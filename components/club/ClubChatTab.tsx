import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
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
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { FullWindowOverlay } from "react-native-screens";

import {
  connectChatSocket,
  getChatSocketDebugConfig,
  joinChatRoomSocket,
  onMemberJoined,
  onMessageNew,
  onMessageRead,
  pingChatSocket,
  sendChatMessageSocket,
} from "@/api/chats/chatSocketApi";
import { markChatRoomRead } from "@/api/chats/chatsApi";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage, { ChatMessageData } from "@/components/chat/ChatMessage";
import MicRecorder from "@/components/MicRecorder";
import { queryKeys } from "@/hooks/api/queryKeys";
import { useChatMessagesInfiniteQuery } from "@/hooks/api/useChats";
import { useAuthStore } from "@/stores/authStore";
import { uniqueBy } from "@/utils/array";
import { markChatRoomUnreadCountInCache } from "@/utils/chatUnreadCache";
import {
  pickChatImage,
  uploadChatPhotoMessage,
  uploadChatVoiceMessage,
} from "@/utils/chatMediaUpload";
import type {
  MemberJoinedData,
  MessageSendAckData,
  MessageNewData,
  MessageReadData,
  SocketAckResponse,
} from "@/types/api/socket";

const PAGE_SIZE = 30;

// 단체 채팅용 확장 메시지 타입: 발신자 라벨 + 시스템(입장) 메시지 추가
type ClubChatMessage =
  | (ChatMessageData & { senderName?: string; senderUserId?: number })
  | { id: string; type: "system"; text: string; sentAt?: string };

type ClubBubbleMessage = Extract<ClubChatMessage, { isMine: boolean }>;

type Props = {
  chatRoomId: number;
  memberCount?: number | null;
  bottomPadding?: number;
  embeddedInPage?: boolean;
  fixedInputDock?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * 동호회(단체) 채팅 탭.
 * 1:1 채팅과 동일한 소켓/REST 인프라를 chatRoomId 기반으로 재사용한다.
 * (room.join 재사용, message.new 수신, member.joined 시스템 메시지 처리)
 */
export default function ClubChatTab({
  chatRoomId,
  memberCount,
  bottomPadding = 0,
  embeddedInPage = false,
  fixedInputDock = false,
  style,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const myUserId = useAuthStore((state) => state.user?.userId);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const hasRoom = Number.isFinite(chatRoomId);
  const messagesQuery = useChatMessagesInfiniteQuery(
    chatRoomId,
    PAGE_SIZE,
    hasRoom,
  );
  const refetchMessages = messagesQuery.refetch;
  const listRef = useRef<ScrollView>(null);
  const playbackPlayerRef = useRef<AudioPlayer | null>(null);
  const playbackStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const roomReadInFlightRef = useRef(false);
  const lastReadTriggerIdRef = useRef(0);
  const hasScrolledInitialMessagesRef = useRef(false);
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
  const fallbackUnreadCount =
    typeof memberCount === "number" && Number.isFinite(memberCount)
      ? Math.max(0, memberCount - 1)
      : 0;
  const displayRecordingTime = isRecording
    ? Math.floor(recorderState.durationMillis / 1000)
    : recordingTime;

  const apiMessages = useMemo<ClubChatMessage[]>(
    () => mapApiMessages(messagesQuery.data, fallbackUnreadCount),
    [fallbackUnreadCount, messagesQuery.data],
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
  const visibleMessages = useMemo(
    () => withClubGroupedMessageTimes(messages),
    [messages],
  );

  const scrollToLatest = useCallback(() => {
    if (embeddedInPage) return;

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [embeddedInPage]);

  useEffect(() => {
    hasScrolledInitialMessagesRef.current = false;
  }, [chatRoomId]);

  useEffect(() => {
    if (hasScrolledInitialMessagesRef.current || visibleMessages.length === 0) {
      return;
    }

    hasScrolledInitialMessagesRef.current = true;
    scrollToLatest();
  }, [scrollToLatest, visibleMessages.length]);

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

  // 방 단위 읽음 처리(그룹): 내 읽음 커서를 전진시키고 목록/미읽음 배지를 갱신한다.
  const markRoomRead = useCallback(() => {
    if (!hasRoom) return;

    markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
    if (roomReadInFlightRef.current) return;
    roomReadInFlightRef.current = true;

    void markChatRoomRead(chatRoomId)
      .then(() => {
        markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
        queryClient.invalidateQueries({
          queryKey: queryKeys.chats.messages(chatRoomId, PAGE_SIZE),
        });
        void queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
      })
      .catch((error) => {
        console.log("[ClubChat] mark room read error", error);
      })
      .finally(() => {
        roomReadInFlightRef.current = false;
      });
  }, [chatRoomId, hasRoom, queryClient]);

  useEffect(() => {
    if (!hasRoom) return;

    const intervalId = setInterval(() => {
      void refetchMessages();
    }, 2500);

    return () => clearInterval(intervalId);
  }, [hasRoom, refetchMessages]);

  useEffect(() => {
    if (!hasRoom) return;

    void queryClient.cancelQueries({
      queryKey: queryKeys.chats.rooms(PAGE_SIZE),
      exact: true,
    });
    markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
  }, [chatRoomId, hasRoom, queryClient]);

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

  useEffect(() => {
    if (!hasRoom) return;

    // 다른 멤버가 보낸 최신 메시지가 새로 생기면 방 전체를 읽음 처리한다.
    const latestIncomingId =
      messagesQuery.data?.pages
        .flatMap((page) => page.items)
        .reduce(
          (max, message) =>
            !message.isMine && message.messageId > max
              ? message.messageId
              : max,
          0,
        ) ?? 0;

    if (latestIncomingId > lastReadTriggerIdRef.current) {
      lastReadTriggerIdRef.current = latestIncomingId;
      markRoomRead();
    }
  }, [hasRoom, markRoomRead, messagesQuery.data]);

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
        appendUnique(prev, mapSocketMessage(next, myUserId, fallbackUnreadCount)),
      );
      if (next.senderUserId !== myUserId) {
        markRoomRead();
      }
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

    const unsubscribeRead = onMessageRead((payload) => {
      const readEvent = getSocketReadData(payload);
      if (!readEvent) return;
      if (readEvent.chatRoomId !== chatRoomId) return;

      // 그룹은 멤버별 읽음 커서를 서버가 집계하므로, 최신 readCount를 다시 받아온다.
      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.messages(chatRoomId, PAGE_SIZE),
      });
      markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
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
      unsubscribeRead();
      unsubscribeMember();
      // 소켓은 전역 공유(알림 배너 등) — 화면에서는 리스너만 정리하고 끊지 않는다.
    };
  }, [
    chatRoomId,
    fallbackUnreadCount,
    hasRoom,
    markRoomRead,
    myUserId,
    queryClient,
    scrollToLatest,
  ]);

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
      unreadCount: fallbackUnreadCount,
      showUnreadIndicator: fallbackUnreadCount > 0,
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
      unreadCount: fallbackUnreadCount,
      showUnreadIndicator: fallbackUnreadCount > 0,
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
      stopVoicePlayback();
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
      unreadCount: fallbackUnreadCount,
      showUnreadIndicator: fallbackUnreadCount > 0,
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

  const openMemberProfile = useCallback(
    (userId?: number, nickname?: string) => {
      if (!userId) return;

      router.push({
        pathname: "/profile-detail",
        params: {
          userId: String(userId),
          name: nickname ?? "",
        },
      } as never);
    },
    [router],
  );

  const handleRecordedVoicePlay = () => {
    if (!recordingUri || recordingTime <= 0) {
      setErrorText("재생할 녹음 파일을 찾지 못했어요.");
      return;
    }

    void handleVoicePlay({
      id: "recorded-voice-preview",
      type: "voice",
      duration: formatDuration(recordingTime),
      mediaUrl: recordingUri,
      isMine: true,
      time: "",
      isPlaying: playingVoiceMessageId === "recorded-voice-preview",
    });
  };

  const inputDock = (
    <View
      style={[
        styles.inputDock,
        fixedInputDock && [
          styles.fixedInputDock,
          { paddingBottom: bottomPadding },
        ],
      ]}
    >
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
              onPlayPress={handleRecordedVoicePlay}
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

  return (
    <View
      style={[
        styles.container,
        embeddedInPage && styles.embeddedContainer,
        style,
        { paddingBottom: fixedInputDock ? 0 : bottomPadding },
      ]}
    >
      {errorText ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{errorText}</Text>
        </View>
      ) : null}

      {embeddedInPage ? (
        <View style={[styles.messageList, styles.embeddedMessageList]}>
          <ClubChatMessageContent
            visibleMessages={visibleMessages}
            hasNextPage={messagesQuery.hasNextPage}
            isFetchingNextPage={messagesQuery.isFetchingNextPage}
            isLoading={messagesQuery.isLoading}
            playingVoiceMessageId={playingVoiceMessageId}
            onFetchNextPage={() => void messagesQuery.fetchNextPage()}
            onVoicePress={handleVoicePlay}
            onAvatarPress={openMemberProfile}
          />
        </View>
      ) : (
        <ScrollView
          ref={listRef}
          style={styles.messageList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            if (
              event.nativeEvent.contentOffset.y <= 24 &&
              messagesQuery.hasNextPage &&
              !messagesQuery.isFetchingNextPage
            ) {
              void messagesQuery.fetchNextPage();
            }
          }}
          scrollEventThrottle={16}
        >
          <ClubChatMessageContent
            visibleMessages={visibleMessages}
            hasNextPage={messagesQuery.hasNextPage}
            isFetchingNextPage={messagesQuery.isFetchingNextPage}
            isLoading={messagesQuery.isLoading}
            playingVoiceMessageId={playingVoiceMessageId}
            onFetchNextPage={() => void messagesQuery.fetchNextPage()}
            onVoicePress={handleVoicePlay}
            onAvatarPress={openMemberProfile}
          />
        </ScrollView>
      )}

      {fixedInputDock ? (
        <FullWindowOverlay>
          <View pointerEvents="box-none" style={styles.windowOverlay}>
            {inputDock}
          </View>
        </FullWindowOverlay>
      ) : (
        inputDock
      )}
    </View>
  );
}

function ClubChatMessageContent({
  visibleMessages,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  playingVoiceMessageId,
  onFetchNextPage,
  onVoicePress,
  onAvatarPress,
}: {
  visibleMessages: ClubChatMessage[];
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  playingVoiceMessageId: string | null;
  onFetchNextPage: () => void;
  onVoicePress: (message: Extract<ChatMessageData, { type: "voice" }>) => void;
  onAvatarPress: (userId?: number, nickname?: string) => void;
}) {
  return (
    <View style={styles.list}>
      {hasNextPage ? (
        <Pressable
          style={styles.loadMoreButton}
          disabled={isFetchingNextPage}
          onPress={onFetchNextPage}
        >
          {isFetchingNextPage ? (
            <ActivityIndicator color="#FF3E70" />
          ) : (
            <Text style={styles.loadMoreText}>이전 대화 더 보기</Text>
          )}
        </Pressable>
      ) : null}

      {visibleMessages.length > 0 ? (
        visibleMessages.map((item) => (
          <ClubChatRow
            key={item.id}
            message={
              item.type === "voice"
                ? { ...item, isPlaying: item.id === playingVoiceMessageId }
                : item
            }
            onVoicePress={onVoicePress}
            onAvatarPress={
              item.type !== "date" && item.type !== "system" && !item.isMine
                ? () => onAvatarPress(item.senderUserId, item.senderName)
                : undefined
            }
          />
        ))
      ) : isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color="#FF3E70" />
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            아직 대화가 없어요. 첫 메시지를 남겨보세요.
          </Text>
        </View>
      )}
    </View>
  );
}

function ClubChatRow({
  message,
  onVoicePress,
  onAvatarPress,
}: {
  message: ClubChatMessage;
  onVoicePress?: (message: Extract<ChatMessageData, { type: "voice" }>) => void;
  onAvatarPress?: () => void;
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
        <Text style={styles.senderName} numberOfLines={1}>
          {message.senderName}
        </Text>
      ) : null}
      <ChatMessage
        message={message}
        onVoicePress={onVoicePress}
        onAvatarPress={onAvatarPress}
      />
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

function getSocketReadData(payload: unknown): MessageReadData | null {
  const data = unwrapSocketPayloadData(payload);
  if (!isRecord(data)) return null;

  const { chatRoomId, readerUserId, lastReadAt } = data;
  if (
    typeof chatRoomId !== "number" ||
    typeof readerUserId !== "number" ||
    typeof lastReadAt !== "string"
  ) {
    return null;
  }

  return { chatRoomId, readerUserId, lastReadAt };
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
  fallbackUnreadCount: number,
): ClubChatMessage[] {
  return uniqueBy(
    data?.pages.flatMap((page) => page.items) ?? [],
    (item) => item.messageId,
  )
    .sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    )
    .map((item) => toChatMessage(item, fallbackUnreadCount));
}

type ApiMessageItem = {
  messageId: number;
  type: "TEXT" | "AUDIO" | "PHOTO" | "VIDEO" | "SYSTEM";
  text: string | null;
  mediaUrl: string | null;
  durationSec: number;
  isMine: boolean;
  sentAt: string;
  readAt?: string | null;
  unreadCount?: number | null;
  // 그룹 전용: 발신자 제외, 이 메시지를 읽은 인원수. 안읽음 = (전체-1) - readCount.
  readCount?: number | null;
  isSystem?: boolean;
  senderName?: string | null;
  senderProfileImage?: string | null;
  senderUserId?: number | null;
  sender?: {
    userId?: number | null;
    nickname?: string | null;
    name?: string | null;
    profileImageUrl?: string | null;
  } | null;
};

function toChatMessage(
  item: ApiMessageItem,
  fallbackUnreadCount: number,
): ClubChatMessage {
  if (item.type === "SYSTEM") {
    return {
      id: `system-${item.messageId}`,
      type: "system",
      text: item.text ?? "입장했습니다.",
      sentAt: item.sentAt,
    };
  }

  const unreadCount = resolveUnreadCount(item, fallbackUnreadCount);
  const base = {
    id: `message-${item.messageId}`,
    isMine: item.isMine,
    time: formatTime(item.sentAt),
    sentAt: item.sentAt,
    showTime: true,
    unreadCount,
    showUnreadIndicator: unreadCount > 0,
    avatar: item.isMine ? undefined : resolveSenderProfileImage(item),
    senderName: item.isMine ? undefined : resolveSenderName(item),
    senderUserId: item.senderUserId ?? item.sender?.userId ?? undefined,
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
  fallbackUnreadCount = 1,
): ClubChatMessage {
  const isMine = myUserId ? item.senderUserId === myUserId : false;
  const unreadCount = isMine ? Math.max(0, fallbackUnreadCount) : 0;
  const base = {
    id: `message-${item.messageId}`,
    isMine,
    time: formatTime(item.sentAt),
    sentAt: item.sentAt,
    showTime: true,
    unreadCount,
    showUnreadIndicator: unreadCount > 0,
    avatar: isMine ? undefined : item.senderProfileImage,
    senderName: isMine ? undefined : item.senderName,
    senderUserId: item.senderUserId,
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

function resolveSenderName(item: ApiMessageItem) {
  return (
    item.senderName ??
    item.sender?.nickname ??
    item.sender?.name ??
    undefined
  );
}

function resolveSenderProfileImage(item: ApiMessageItem) {
  return item.senderProfileImage ?? item.sender?.profileImageUrl ?? undefined;
}

function resolveUnreadCount(item: {
  isMine: boolean;
  readAt?: string | null;
  unreadCount?: number | null;
  readCount?: number | null;
}, fallbackUnreadCount = 1) {
  if (!item.isMine) return 0;
  // 안읽음 인원 = (발신자 제외 전체 인원) - (읽은 인원수). fallbackUnreadCount = 전체-1.
  if (typeof item.readCount === "number") {
    return Math.max(0, fallbackUnreadCount - Math.max(0, item.readCount));
  }
  if (typeof item.unreadCount === "number") {
    return Math.max(0, item.unreadCount);
  }
  return item.readAt ? 0 : Math.max(0, fallbackUnreadCount);
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


function withClubGroupedMessageTimes(messages: ClubChatMessage[]) {
  return messages.map((message, index) => {
    if (message.type === "date" || message.type === "system") {
      return message;
    }

    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const isSameGroupAsPrev = isSameClubMessageGroup(prevMessage, message);
    const isSameGroupAsNext = isSameClubMessageGroup(message, nextMessage);

    return {
      ...message,
      showTime: !isSameGroupAsNext,
      showAvatar: message.isMine ? undefined : !isSameGroupAsPrev,
      compactSpacing: Boolean(isSameGroupAsPrev || isSameGroupAsNext),
      groupTopSpacing: Boolean(prevMessage && !isSameGroupAsPrev),
    };
  });
}

function isSameClubMessageGroup(
  left: ClubChatMessage | undefined,
  right: ClubChatMessage | undefined,
) {
  if (!isClubBubbleMessage(left) || !isClubBubbleMessage(right)) return false;
  if (left.isMine !== right.isMine) return false;
  if (left.time !== right.time) return false;

  if (left.isMine && right.isMine) return true;

  return getClubMessageSenderKey(left) === getClubMessageSenderKey(right);
}

function isClubBubbleMessage(
  message: ClubChatMessage | undefined,
): message is ClubBubbleMessage {
  return Boolean(message && message.type !== "date" && message.type !== "system");
}

function getClubMessageSenderKey(message: ClubBubbleMessage) {
  return (
    message.senderUserId ??
    message.senderName ??
    message.avatar ??
    "unknown"
  );
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
  embeddedContainer: {
    flex: 0,
  },
  messageList: {
    flex: 1,
  },
  embeddedMessageList: {
    flex: 0,
    flexGrow: 1,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  inputDock: {
    backgroundColor: "#FFFFFF",
  },
  fixedInputDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 8,
  },
  windowOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
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
    marginTop: 2,
    marginBottom: 2,
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
    maxWidth: 230,
    marginLeft: 48,
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
