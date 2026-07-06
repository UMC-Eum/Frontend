import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  createAudioPlayer,
  RecordingPresets,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  connectChatSocket,
  disconnectChatSocket,
  getChatSocketDebugConfig,
  joinChatRoomSocket,
  onMemberJoined,
  onMessageNew,
  pingChatSocket,
  sendChatMessageSocket,
} from "@/api/chats/chatSocketApi";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage, { ChatMessageData } from "@/components/chat/ChatMessage";
import MicRecorder from "@/components/MicRecorder";
import { useChatMessagesInfiniteQuery } from "@/hooks/api/useChats";
import { useClubMembersInfiniteQuery } from "@/hooks/api/useHost";
import { useAuthStore } from "@/stores/authStore";
import { uniqueBy } from "@/utils/array";
import {
  pickChatImage,
  uploadChatPhotoMessage,
  uploadChatVoiceMessage,
} from "@/utils/chatMediaUpload";
import type {
  MemberJoinedData,
  MessageSendAckData,
  MessageNewData,
  SocketAckResponse,
} from "@/types/api/socket";

const PAGE_SIZE = 30;

// 단체 채팅용 확장 메시지 타입: 발신자 라벨 + 시스템(입장) 메시지 추가
type ClubChatMessage =
  | (ChatMessageData & { senderName?: string })
  | { id: string; type: "system"; text: string; sentAt?: string };

type Props = {
  chatRoomId: number;
  /** 발신자 닉네임/프로필 매핑용. 메시지 API 응답에 발신자 정보가 없어 멤버 목록으로 보강한다. */
  clubId?: number;
  bottomPadding?: number;
};

type ClubMemberSummary = {
  nickname: string;
  profileImageUrl?: string;
};

/**
 * 동호회(단체) 채팅 탭.
 * 1:1 채팅과 동일한 소켓/REST 인프라를 chatRoomId 기반으로 재사용한다.
 * (room.join 재사용, message.new 수신, member.joined 시스템 메시지 처리)
 */
export default function ClubChatTab({
  chatRoomId,
  clubId,
  bottomPadding = 0,
}: Props) {
  const myUserId = useAuthStore((state) => state.user?.userId);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const hasRoom = Number.isFinite(chatRoomId);
  const messagesQuery = useChatMessagesInfiniteQuery(
    chatRoomId,
    PAGE_SIZE,
    hasRoom,
  );
  const membersQuery = useClubMembersInfiniteQuery(
    clubId ?? Number.NaN,
    { limit: 100 },
    typeof clubId === "number" && Number.isFinite(clubId),
  );
  const memberMap = useMemo(() => {
    const map = new Map<number, ClubMemberSummary>();
    membersQuery.data?.pages.forEach((page) => {
      page.members.forEach((member) => {
        map.set(member.userId, {
          nickname: member.nickname,
          profileImageUrl: member.profileImageUrl ?? undefined,
        });
      });
    });
    return map;
  }, [membersQuery.data]);
  const refetchMessages = messagesQuery.refetch;
  const playbackPlayerRef = useRef<AudioPlayer | null>(null);
  const playbackStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [liveMessages, setLiveMessages] = useState<ClubChatMessage[]>([]);
  const [systemMessages, setSystemMessages] = useState<ClubChatMessage[]>([]);
  const [errorText, setErrorText] = useState("");
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [playingVoiceMessageId, setPlayingVoiceMessageId] = useState<
    string | null
  >(null);
  const isRecording = recorderState.isRecording;
  const displayRecordingTime = isRecording
    ? Math.floor(recorderState.durationMillis / 1000)
    : recordingTime;

  const apiMessages = useMemo<ClubChatMessage[]>(
    () => mapApiMessages(messagesQuery.data, memberMap),
    [memberMap, messagesQuery.data],
  );

  const messages = useMemo(() => {
    const apiIds = new Set(apiMessages.map((message) => message.id));
    const merged = [
      ...apiMessages,
      ...liveMessages.filter((message) => !apiIds.has(message.id)),
      ...systemMessages,
    ];
    return merged.sort(sortByOrder);
  }, [apiMessages, liveMessages, systemMessages]);

  // 소켓 effect 재구독 없이 최신 멤버 매핑을 참조하기 위한 ref
  const memberMapRef = useRef(memberMap);
  useEffect(() => {
    memberMapRef.current = memberMap;
  }, [memberMap]);

  const listScrollRef = useRef<ScrollView>(null);
  const needsInitialScrollRef = useRef(true);
  // 전체화면(chat/[id])에서는 자체 ScrollView가 스크롤하고,
  // 동호회 상세 탭처럼 부모 ScrollView 안에서는 자연 높이로 부모가 스크롤한다.
  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      listScrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);
  const handleListContentSizeChange = useCallback(() => {
    if (!needsInitialScrollRef.current) return;
    if (messagesQuery.isLoading) return;

    needsInitialScrollRef.current = false;
    listScrollRef.current?.scrollToEnd({ animated: false });
  }, [messagesQuery.isLoading]);

  const stopVoicePlayback = useCallback(() => {
    if (playbackStopTimerRef.current) {
      clearTimeout(playbackStopTimerRef.current);
      playbackStopTimerRef.current = null;
    }

    const currentPlayer = playbackPlayerRef.current;
    currentPlayer?.pause();
    currentPlayer?.remove();
    playbackPlayerRef.current = null;
    setPlayingVoiceMessageId(null);
  }, []);

  const syncMessages = useCallback(
    (pendingMessageId?: string) => {
      void refetchMessages().finally(() => {
        if (!pendingMessageId) return;

        setLiveMessages((prev) =>
          prev.filter((message) => message.id !== pendingMessageId),
        );
      });
    },
    [refetchMessages],
  );

  useEffect(() => {
    if (!hasRoom) return;

    const intervalId = setInterval(() => {
      void refetchMessages();
    }, 2500);

    return () => clearInterval(intervalId);
  }, [hasRoom, refetchMessages]);

  useEffect(() => {
    return () => {
      audioRecorder.stop().catch(() => undefined);
      stopVoicePlayback();
    };
  }, [audioRecorder, stopVoicePlayback]);

  useEffect(() => {
    if (!isRecording) return;

    setRecordingTime(Math.floor(recorderState.durationMillis / 1000));
  }, [isRecording, recorderState.durationMillis]);

  // 소켓 연결 + room.join + 실시간 이벤트 구독
  useEffect(() => {
    if (!hasRoom) return;

    const socket = connectChatSocket();
    let isActive = true;
    let hasJoinedRoom = false;

    const joinRoom = (attempt = 1) => {
      if (__DEV__) {
        console.log("[ClubChatSocket] room.join request", {
          attempt,
          chatRoomId,
          connected: socket.connected,
          socketId: socket.id,
        });
      }

      joinChatRoomSocket({ chatRoomId }, socket)
        .then((response) => {
          if (__DEV__) {
            console.log("[ClubChatSocket] room.join", response);
          }
          if (!isActive) return;
          if (!isSocketSuccess(response)) {
            // CLUB-003: 아직 가입 승인이 안 된 사용자
            const errorCode = getSocketErrorCode(response);
            setErrorText(
              errorCode === "CHAT-003"
                ? "가입 승인 후 채팅에 참여할 수 있어요."
                : getSocketErrorMessage(response) ??
                    "채팅방에 입장하지 못했어요.",
            );
            return;
          }
          hasJoinedRoom = true;
          setErrorText("");
        })
        .catch((error) => {
          if (__DEV__) {
            console.log("[ClubChatSocket] room.join error", error);
          }

          if (!isActive || hasJoinedRoom) return;

          if (attempt < 2 && socket.connected) {
            setTimeout(() => {
              if (isActive && socket.connected && !hasJoinedRoom) {
                joinRoom(attempt + 1);
              }
            }, 500);
            return;
          }

          setErrorText("채팅 서버에 연결하지 못했어요.");
        });
    };

    const handleConnect = async () => {
      if (__DEV__) {
        console.log("[ClubChatSocket] connected", {
          chatRoomId,
          socketId: socket.id,
        });
      }

      try {
        const pingResponse = await pingChatSocket(socket, 5000);
        if (__DEV__) {
          console.log("[ClubChatSocket] ping", pingResponse);
        }
      } catch (error) {
        if (__DEV__) {
          console.log("[ClubChatSocket] ping error", error);
        }
      }

      joinRoom();
    };

    const handleConnectError = (error: Error & {
      description?: unknown;
      context?: unknown;
      type?: string;
    }) => {
      if (__DEV__) {
        console.log("[ClubChatSocket] connect_error", {
          ...getChatSocketDebugConfig(),
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type,
        });
      }
      setErrorText("채팅 서버에 연결하지 못했어요.");
    };

    const handleDisconnect = (reason: string) => {
      if (__DEV__) {
        console.log("[ClubChatSocket] disconnect", { chatRoomId, reason });
      }
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    if (socket.connected) joinRoom();

    const appendIncomingMessage = (next: MessageNewData) => {
      if (next.chatRoomId !== chatRoomId) return;

      setLiveMessages((prev) =>
        appendUnique(prev, mapSocketMessage(next, myUserId, memberMapRef.current)),
      );
      scrollToLatest();
    };

    const appendMemberJoined = (joined: MemberJoinedData) => {
      if (joined.chatRoomId !== chatRoomId) return;

      setSystemMessages((prev) =>
        appendUnique(prev, mapMemberJoined(joined)),
      );
      scrollToLatest();
    };

    const handleAnyEvent = (event: string, ...args: unknown[]) => {
      if (__DEV__) {
        console.log("[ClubChatSocket] event", event, args);
      }

      const nextMessage = getSocketMessageData(args[0]);
      if (nextMessage) {
        appendIncomingMessage(nextMessage);
        return;
      }

      const joined = getMemberJoinedData(args[0]);
      if (joined) {
        appendMemberJoined(joined);
      }
    };
    socket.onAny(handleAnyEvent);

    const unsubscribeNew = onMessageNew((payload) => {
      const next = getSocketMessageData(payload);
      if (!next) return;
      appendIncomingMessage(next);
    }, socket);

    const unsubscribeMember = onMemberJoined((payload) => {
      const joined = getMemberJoinedData(payload);
      if (!joined) return;
      appendMemberJoined(joined);
    }, socket);

    return () => {
      isActive = false;
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.offAny(handleAnyEvent);
      unsubscribeNew();
      unsubscribeMember();
      disconnectChatSocket();
    };
  }, [chatRoomId, hasRoom, myUserId, scrollToLatest]);

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !hasRoom) return;

    const sentAt = new Date().toISOString();
    const pendingMessage: ClubChatMessage = {
      id: `pending-message-${Date.now()}`,
      type: "text",
      text: trimmed,
      isMine: true,
      time: formatTime(sentAt),
      sentAt,
      showTime: true,
    };

    setLiveMessages((prev) => appendUnique(prev, pendingMessage));
    setIsAttachmentOpen(false);
    scrollToLatest();

    sendChatMessageSocket({ type: "TEXT", chatRoomId, text: trimmed })
      .then((response) => {
        if (__DEV__) {
          console.log("[ClubChatSocket] message.send", response);
        }

        const sentMessage = getMessageSendAckData(response);
        if (!isSocketSuccess(response) && !sentMessage) {
          throw new Error(
            getSocketErrorMessage(response) ?? "메시지 전송 실패",
          );
        }

        setErrorText("");
        if (sentMessage) {
          setLiveMessages((prev) =>
            replaceMessage(prev, pendingMessage.id, {
              ...pendingMessage,
              id: `message-${sentMessage.messageId}`,
              time: formatTime(sentMessage.sentAt),
              sentAt: sentMessage.sentAt,
            }),
          );
        }
        syncMessages(pendingMessage.id);
      })
      .catch((error) => {
        if (__DEV__) {
          console.log("[ClubChatSocket] message.send error", error);
        }
        setLiveMessages((prev) =>
          prev.filter((message) => message.id !== pendingMessage.id),
        );
        setErrorText("메시지를 보내지 못했어요.");
      });
  };

  const handlePickPhoto = async (source: "camera" | "gallery") => {
    if (isUploadingPhoto || !hasRoom) return;

    setIsAttachmentOpen(false);
    setIsVoiceRecorderOpen(false);

    try {
      const pickedImage = await pickChatImage(source);
      if (!pickedImage) return;

      await sendPhotoMessage(pickedImage.uri);
    } catch (error) {
      console.log("[ClubChat] photo send error", error);
      setErrorText("사진을 보내지 못했어요.");
    }
  };

  const sendPhotoMessage = async (imageUri: string) => {
    const sentAt = new Date().toISOString();
    const pendingMessage: ClubChatMessage = {
      id: `pending-photo-${Date.now()}`,
      type: "photo",
      mediaUrl: imageUri,
      isMine: true,
      time: formatTime(sentAt),
      sentAt,
      showTime: true,
    };

    setLiveMessages((prev) => appendUnique(prev, pendingMessage));
    scrollToLatest();
    setIsUploadingPhoto(true);

    try {
      const mediaRef = await uploadChatPhotoMessage(chatRoomId, imageUri);
      const response = await sendChatMessageSocket({
        type: "PHOTO",
        chatRoomId,
        mediaUrl: mediaRef,
      });
      if (__DEV__) {
        console.log("[ClubChatSocket] photo.message.send", response);
      }

      if (!isSocketSuccess(response)) {
        throw new Error(
          getSocketErrorMessage(response) ?? "사진 메시지 전송 실패",
        );
      }
      setErrorText("");

      const sentMessage = getMessageSendAckData(response);
      if (sentMessage) {
        setLiveMessages((prev) =>
          replaceMessage(prev, pendingMessage.id, {
            ...pendingMessage,
            id: `message-${sentMessage.messageId}`,
            time: formatTime(sentMessage.sentAt),
            sentAt: sentMessage.sentAt,
          }),
        );
      }
      syncMessages(pendingMessage.id);
    } catch (error) {
      console.log("[ClubChat] photo upload/send error", error);
      setLiveMessages((prev) =>
        prev.filter((message) => message.id !== pendingMessage.id),
      );
      setErrorText("사진을 보내지 못했어요.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const resetVoiceRecorder = async () => {
    if (isRecording) {
      await audioRecorder.stop().catch(() => undefined);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
    }

    setRecordingUri(null);
    setRecordingTime(0);
  };

  const startVoiceRecording = async () => {
    if (isUploadingVoice) return;

    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setErrorText("마이크 권한이 필요해요.");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      setRecordingUri(null);
      setRecordingTime(0);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.log("[ClubChat] start recording error", error);
      setErrorText("녹음을 시작하지 못했어요.");
    }
  };

  const stopVoiceRecording = async () => {
    const nextSeconds = Math.max(
      recordingTime,
      Math.floor(recorderState.durationMillis / 1000),
    );

    if (nextSeconds <= 0) {
      setErrorText("녹음 시간이 너무 짧아요.");
      return null;
    }

    try {
      await audioRecorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      const nextUri = audioRecorder.uri ?? recorderState.url;
      if (!nextUri) {
        throw new Error("Recorded audio uri is empty.");
      }

      setRecordingUri(nextUri);
      setRecordingTime(nextSeconds);
      return { uri: nextUri, durationSec: nextSeconds };
    } catch (error) {
      console.log("[ClubChat] stop recording error", error);
      setErrorText("녹음을 종료하지 못했어요.");
      return null;
    }
  };

  const handleVoiceButtonPress = () => {
    setIsAttachmentOpen(false);
    setIsVoiceRecorderOpen(true);
    void startVoiceRecording();
  };

  const handleVoiceCancel = async () => {
    await resetVoiceRecorder();
    setIsVoiceRecorderOpen(false);
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      void stopVoiceRecording();
      return;
    }

    void startVoiceRecording();
  };

  const handleVoiceSend = async () => {
    if (isUploadingVoice || !hasRoom) return;

    const recording = isRecording
      ? await stopVoiceRecording()
      : recordingUri
        ? { uri: recordingUri, durationSec: recordingTime }
        : null;

    if (!recording || recording.durationSec <= 0) {
      setErrorText("먼저 음성을 녹음해주세요.");
      return;
    }

    const sentAt = new Date().toISOString();
    const pendingMessage: ClubChatMessage = {
      id: `pending-voice-${Date.now()}`,
      type: "voice",
      duration: formatDuration(recording.durationSec),
      mediaUrl: recording.uri,
      isMine: true,
      time: formatTime(sentAt),
      sentAt,
      showTime: true,
      isPlaying: false,
    };

    setLiveMessages((prev) => appendUnique(prev, pendingMessage));
    setIsVoiceRecorderOpen(false);
    setIsUploadingVoice(true);
    scrollToLatest();

    try {
      const mediaRef = await uploadChatVoiceMessage(chatRoomId, recording.uri);
      const response = await sendChatMessageSocket({
        type: "AUDIO",
        chatRoomId,
        mediaUrl: mediaRef,
        durationSec: recording.durationSec,
      });
      if (__DEV__) {
        console.log("[ClubChatSocket] voice.message.send", response);
      }

      if (!isSocketSuccess(response)) {
        throw new Error(
          getSocketErrorMessage(response) ?? "음성 메시지 전송 실패",
        );
      }
      setErrorText("");

      const sentMessage = getMessageSendAckData(response);
      if (sentMessage) {
        setLiveMessages((prev) =>
          replaceMessage(prev, pendingMessage.id, {
            ...pendingMessage,
            id: `message-${sentMessage.messageId}`,
            time: formatTime(sentMessage.sentAt),
            sentAt: sentMessage.sentAt,
          }),
        );
      }
      syncMessages(pendingMessage.id);
      setRecordingUri(null);
      setRecordingTime(0);
    } catch (error) {
      console.log("[ClubChat] voice upload/send error", error);
      setLiveMessages((prev) =>
        prev.filter((message) => message.id !== pendingMessage.id),
      );
      setErrorText("음성을 보내지 못했어요.");
    } finally {
      setIsUploadingVoice(false);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
    }
  };

  const handleVoicePlay = async (
    message: Extract<ChatMessageData, { type: "voice" }>,
  ) => {
    if (!message.mediaUrl) {
      setErrorText("재생할 음성 파일을 찾지 못했어요.");
      return;
    }

    try {
      if (playingVoiceMessageId === message.id) {
        stopVoicePlayback();
        return;
      }

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      await setIsAudioActiveAsync(true);

      stopVoicePlayback();
      const nextPlayer = createAudioPlayer(
        { uri: message.mediaUrl },
        { updateInterval: 250, keepAudioSessionActive: true },
      );
      playbackPlayerRef.current = nextPlayer;
      await wait(180);
      try {
        await nextPlayer.seekTo(0);
      } catch {
        // 일부 플랫폼에서는 메타데이터 로딩 전 seek가 실패할 수 있습니다.
      }

      nextPlayer.play();
      setPlayingVoiceMessageId(message.id);
      playbackStopTimerRef.current = setTimeout(() => {
        if (playbackPlayerRef.current === nextPlayer) {
          stopVoicePlayback();
        }
      }, parseDurationSeconds(message.duration) * 1000 + 500);
    } catch (error) {
      console.log("[ClubChat] voice playback error", error);
      stopVoicePlayback();
      setErrorText("음성 메시지를 재생하지 못했어요.");
    }
  };

  const displayed = messages;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {errorText ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{errorText}</Text>
        </View>
      ) : null}

      <ScrollView
        ref={listScrollRef}
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        nestedScrollEnabled
        onContentSizeChange={handleListContentSizeChange}
        keyboardShouldPersistTaps="handled"
      >
        {messagesQuery.hasNextPage ? (
          <Pressable
            style={styles.loadMoreButton}
            disabled={messagesQuery.isFetchingNextPage}
            onPress={() => void messagesQuery.fetchNextPage()}
          >
            {messagesQuery.isFetchingNextPage ? (
              <ActivityIndicator color="#FF3E70" />
            ) : (
              <Text style={styles.loadMoreText}>이전 대화 더 보기</Text>
            )}
          </Pressable>
        ) : null}

        {messagesQuery.isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color="#FF3E70" />
          </View>
        ) : displayed.length > 0 ? (
          displayed.map((item) => (
            <ClubChatRow
              key={item.id}
              message={
                item.type === "voice"
                  ? { ...item, isPlaying: item.id === playingVoiceMessageId }
                  : item
              }
              onVoicePress={handleVoicePlay}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              아직 대화가 없어요. 첫 메시지를 남겨보세요.
            </Text>
          </View>
        )}
      </ScrollView>

      {!isAttachmentOpen ? (
        isVoiceRecorderOpen ? (
          <View style={styles.voiceRecorderWrap}>
            <MicRecorder
              status={isUploadingVoice ? "recorded" : undefined}
              isRecording={isRecording}
              recordingTime={displayRecordingTime}
              onRecordPress={handleVoiceRecord}
              onCancelPress={handleVoiceCancel}
              onSendPress={handleVoiceSend}
              onResetPress={resetVoiceRecorder}
              containerStyle={styles.voiceRecorder}
            />
          </View>
        ) : (
          <Pressable
            style={styles.voiceButton}
            onPress={handleVoiceButtonPress}
          >
            <Ionicons name="mic-outline" size={28} color="#FFFFFF" />
          </Pressable>
        )
      ) : null}

      {isVoiceRecorderOpen ? (
        <View style={styles.inputPlaceholder} />
      ) : (
        <ChatInput
          onSend={handleSend}
          isAttachmentOpen={isAttachmentOpen}
          onToggleAttachment={() => setIsAttachmentOpen((prev) => !prev)}
          onCameraPress={() => void handlePickPhoto("camera")}
          onGalleryPress={() => void handlePickPhoto("gallery")}
          isMediaSending={isUploadingPhoto}
        />
      )}
    </View>
  );
}

function ClubChatRow({
  message,
  onVoicePress,
}: {
  message: ClubChatMessage;
  onVoicePress?: (message: Extract<ChatMessageData, { type: "voice" }>) => void;
}) {
  if (message.type === "system") {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.systemText}>{message.text}</Text>
      </View>
    );
  }

  return (
    <View>
      {message.type !== "date" &&
      !message.isMine &&
      message.senderName &&
      message.showAvatar !== false ? (
        <Text style={styles.senderName}>{message.senderName}</Text>
      ) : null}
      <ChatMessage message={message} onVoicePress={onVoicePress} />
    </View>
  );
}

function isSocketSuccess<TData>(
  response: SocketAckResponse<TData>,
) {
  if (response.resultType === "SUCCESS") return true;
  const record = response as unknown;
  if (!isRecord(record)) return false;
  if (isRecord(record.error)) return false;
  return record.ok === true;
}

function getSocketSuccessData<TData>(
  response: SocketAckResponse<TData> | unknown,
): TData | null {
  if (!isRecord(response)) return null;

  const success = response.success;
  if (response.resultType === "SUCCESS" && isRecord(success)) {
    return success.data as TData;
  }

  const data = response.data;
  if (isRecord(data)) {
    return data as TData;
  }

  if (response.ok === true) {
    return response as TData;
  }

  if (!isRecord(response.error) && response.resultType !== "FAIL") {
    return response as TData;
  }

  return null;
}

function getMessageSendAckData(response: unknown): MessageSendAckData | null {
  const data = getSocketSuccessData<MessageSendAckData>(response);
  if (!isRecord(data)) return null;

  return typeof data.messageId === "number" && typeof data.sentAt === "string"
    ? { messageId: data.messageId, sentAt: data.sentAt }
    : null;
}

function getSocketErrorCode(response: unknown) {
  if (!isRecord(response)) return undefined;
  const error = response.error;
  if (!isRecord(error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

function getSocketErrorMessage(response: unknown) {
  if (!isRecord(response)) return undefined;
  const error = response.error;
  if (!isRecord(error)) return undefined;
  return typeof error.message === "string" ? error.message : undefined;
}

function getSocketMessageData(payload: unknown): MessageNewData | null {
  const data = unwrapSocketPayloadData(payload);
  if (!isRecord(data)) return null;
  const sender = isRecord(data.sender) ? data.sender : null;

  const {
    messageId,
    chatRoomId,
    type,
    text,
    mediaUrl,
    durationSec,
    sentAt,
  } = data;
  const senderUserId = data.senderUserId ?? data.senderId ?? sender?.userId;
  const senderName = data.senderName ?? sender?.nickname ?? sender?.name;
  const senderProfileImage =
    data.senderProfileImage ??
    data.senderProfileImageUrl ??
    sender?.profileImageUrl;

  if (
    typeof messageId !== "number" ||
    typeof chatRoomId !== "number" ||
    typeof senderUserId !== "number" ||
    !isChatMessageType(type) ||
    typeof sentAt !== "string"
  ) {
    return null;
  }

  return {
    messageId,
    chatRoomId,
    senderUserId,
    type,
    text: typeof text === "string" ? text : null,
    mediaUrl: typeof mediaUrl === "string" ? mediaUrl : null,
    durationSec: typeof durationSec === "number" ? durationSec : 0,
    sentAt,
    senderName: typeof senderName === "string" ? senderName : undefined,
    senderProfileImage:
      typeof senderProfileImage === "string" ? senderProfileImage : undefined,
  };
}

function getMemberJoinedData(payload: unknown): MemberJoinedData | null {
  const data = unwrapSocketPayloadData(payload);
  if (!isRecord(data)) return null;

  const { chatRoomId, userId, nickname, joinedAt, memberCount } = data;
  if (
    typeof chatRoomId !== "number" ||
    typeof userId !== "number" ||
    typeof nickname !== "string" ||
    typeof joinedAt !== "string"
  ) {
    return null;
  }

  return {
    chatRoomId,
    userId,
    nickname,
    joinedAt,
    memberCount: typeof memberCount === "number" ? memberCount : 0,
  };
}

function unwrapSocketPayloadData(payload: unknown) {
  if (!isRecord(payload)) return payload;

  const success = payload.success;
  if (payload.resultType === "SUCCESS" && isRecord(success)) {
    return success.data;
  }

  return payload.data ?? payload.message ?? payload.payload ?? payload;
}

function isChatMessageType(value: unknown): value is MessageNewData["type"] {
  return (
    value === "TEXT" ||
    value === "AUDIO" ||
    value === "PHOTO" ||
    value === "VIDEO"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapApiMessages(
  data:
    | { pages: { items: ApiMessageItem[] }[] }
    | undefined,
  memberMap: Map<number, ClubMemberSummary>,
): ClubChatMessage[] {
  return uniqueBy(
    data?.pages.flatMap((page) => page.items) ?? [],
    (item) => item.messageId,
  )
    .sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    )
    .map((item) => toChatMessage(item, memberMap));
}

type ApiMessageItem = {
  messageId: number;
  type: "TEXT" | "AUDIO" | "PHOTO" | "VIDEO" | "SYSTEM";
  text: string | null;
  mediaUrl: string | null;
  durationSec: number;
  isMine: boolean;
  sentAt: string;
  senderUserId?: number;
  senderName?: string | null;
  senderProfileImage?: string | null;
};

function toChatMessage(
  item: ApiMessageItem,
  memberMap: Map<number, ClubMemberSummary>,
): ClubChatMessage {
  if (item.type === "SYSTEM") {
    return {
      id: `system-${item.messageId}`,
      type: "system",
      text: item.text ?? "입장했습니다.",
      sentAt: item.sentAt,
    };
  }

  // 메시지 API 응답에는 발신자 프로필이 없어 멤버 목록으로 보강한다.
  const member =
    typeof item.senderUserId === "number"
      ? memberMap.get(item.senderUserId)
      : undefined;
  const base = {
    id: `message-${item.messageId}`,
    isMine: item.isMine,
    time: formatTime(item.sentAt),
    sentAt: item.sentAt,
    showTime: true,
    avatar: item.isMine
      ? undefined
      : item.senderProfileImage ?? member?.profileImageUrl,
    senderName: item.isMine
      ? undefined
      : item.senderName ?? member?.nickname,
  };

  if (item.type === "AUDIO") {
    return {
      ...base,
      type: "voice",
      duration: formatDuration(item.durationSec),
      mediaUrl: item.mediaUrl ?? undefined,
      isPlaying: false,
    };
  }

  if (item.type === "PHOTO" && item.mediaUrl) {
    return {
      ...base,
      type: "photo",
      mediaUrl: item.mediaUrl,
    };
  }

  return {
    ...base,
    type: "text",
    text: item.text ?? textForNonText(item.type),
  };
}

function mapSocketMessage(
  item: MessageNewData,
  myUserId?: number,
  memberMap?: Map<number, ClubMemberSummary>,
): ClubChatMessage {
  const isMine = myUserId ? item.senderUserId === myUserId : false;
  const member = memberMap?.get(item.senderUserId);
  const base = {
    id: `message-${item.messageId}`,
    isMine,
    time: formatTime(item.sentAt),
    sentAt: item.sentAt,
    showTime: true,
    avatar: isMine ? undefined : item.senderProfileImage ?? member?.profileImageUrl,
    senderName: isMine ? undefined : item.senderName ?? member?.nickname,
  };

  if (item.type === "AUDIO") {
    return {
      ...base,
      type: "voice",
      duration: formatDuration(item.durationSec),
      mediaUrl: item.mediaUrl ?? undefined,
      isPlaying: false,
    };
  }

  if (item.type === "PHOTO" && item.mediaUrl) {
    return {
      ...base,
      type: "photo",
      mediaUrl: item.mediaUrl,
    };
  }

  return {
    ...base,
    type: "text",
    text: item.text ?? textForNonText(item.type),
  };
}

function mapMemberJoined(item: MemberJoinedData): ClubChatMessage {
  return {
    id: `system-join-${item.userId}-${item.joinedAt}`,
    type: "system",
    text: `${item.nickname}님이 입장했습니다.`,
    sentAt: item.joinedAt,
  };
}

function textForNonText(type: ApiMessageItem["type"]) {
  if (type === "AUDIO") return "[음성 메시지]";
  if (type === "PHOTO") return "[사진]";
  if (type === "VIDEO") return "[동영상]";
  if (type === "SYSTEM") return "";
  return "";
}

function appendUnique(list: ClubChatMessage[], next: ClubChatMessage) {
  if (list.some((message) => message.id === next.id)) return list;
  return [...list, next];
}

function replaceMessage(
  list: ClubChatMessage[],
  targetId: string,
  next: ClubChatMessage,
) {
  if (list.some((message) => message.id === next.id)) {
    return list.filter((message) => message.id !== targetId);
  }

  return list.map((message) => (message.id === targetId ? next : message));
}

function sortByOrder(a: ClubChatMessage, b: ClubChatMessage) {
  return orderKey(a) - orderKey(b);
}

function orderKey(message: ClubChatMessage) {
  if (message.type === "system") {
    if (message.sentAt) {
      const sentAtTime = new Date(message.sentAt).getTime();
      return Number.isNaN(sentAtTime) ? 0 : sentAtTime;
    }

    const iso = message.id.split("-").slice(2).join("-");
    const time = new Date(iso).getTime();
    return Number.isNaN(time) ? 0 : time;
  }
  if (message.type === "date") return 0;
  const time = message.sentAt ? new Date(message.sentAt).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 1;
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function parseDurationSeconds(duration: string) {
  const [minutes = "0", seconds = "0"] = duration.split(":");
  const totalSeconds = Number(minutes) * 60 + Number(seconds);

  return Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 1;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 320,
    backgroundColor: "#FFFFFF",
  },
  listScroll: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },
  loadMoreButton: {
    alignSelf: "center",
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: "#F1F3F5",
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E9AA3",
  },
  voiceButton: {
    alignSelf: "center",
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: "#FF3E70",
  },
  voiceRecorderWrap: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  voiceRecorder: {
    alignSelf: "center",
  },
  inputPlaceholder: {
    height: 64,
    backgroundColor: "#FFFFFF",
  },
  empty: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#A6AFB6",
    textAlign: "center",
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#FFF0F2",
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: "#FF3E70",
    textAlign: "center",
  },
  senderName: {
    marginLeft: 44,
    marginBottom: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: "#8E9AA3",
  },
  systemRow: {
    alignItems: "center",
    paddingVertical: 8,
  },
  systemText: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: "#F1F3F5",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: "#8E9AA3",
    overflow: "hidden",
  },
});
