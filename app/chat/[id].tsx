import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
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
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  isChatS3UploadError,
  postChatMediaPresign,
  readChatMessage,
  uploadChatFileToS3,
  uploadChatFileUriToS3,
} from "@/api/chats/chatsApi";
import ChatActionSheet from "@/components/chat/ChatActionSheet";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage, { ChatMessageData } from "@/components/chat/ChatMessage";
import ConfirmModal from "@/components/chat/ConfirmModal";
import MicRecorder from "@/components/MicRecorder";
import {
  connectChatSocket,
  disconnectChatSocket,
  getChatSocketDebugConfig,
  joinChatRoomSocket,
  onMessageDeleted,
  onMessageNew,
  onMessageRead,
  pingChatSocket,
  sendChatMessageSocket,
} from "@/api/chats/chatSocketApi";
import {
  useChatMessagesInfiniteQuery,
  useChatRoomDetailQuery,
  useLeaveChatRoomMutation,
} from "@/hooks/api/useChats";
import { queryKeys } from "@/hooks/api/queryKeys";
import {
  useBlockUserMutation,
  useBlocksInfiniteQuery,
  usePatchBlockMutation,
} from "@/hooks/api/useSocials";
import { useAuthStore } from "@/stores/authStore";
import type {
  MessageDeletedData,
  MessageNewData,
  MessageReadData,
  SocketAckResponse,
} from "@/types/api/socket";

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const myUserId = useAuthStore((state) => state.user?.userId);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const chatRoomId = Number(id);
  const hasChatRoomId = Number.isFinite(chatRoomId);
  const roomDetailQuery = useChatRoomDetailQuery(chatRoomId, hasChatRoomId);
  const messagesQuery = useChatMessagesInfiniteQuery(
    chatRoomId,
    30,
    hasChatRoomId,
  );
  const peerUserId = roomDetailQuery.data?.peer.userId;
  const blocksQuery = useBlocksInfiniteQuery(100, {
    enabled: typeof peerUserId === "number",
    staleTime: 10000,
  });
  const refetchMessages = messagesQuery.refetch;
  const leaveChatRoomMutation = useLeaveChatRoomMutation(chatRoomId);
  const blockUserMutation = useBlockUserMutation();
  const patchBlockMutation = usePatchBlockMutation();
  const messageListRef = useRef<FlatList<ChatMessageData>>(null);
  const shouldScrollToLatestRef = useRef(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackPlayerRef = useRef<AudioPlayer | null>(null);
  const playbackStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const profile = useMemo(
    () =>
      roomDetailQuery.data
        ? {
            name: roomDetailQuery.data.peer.nickname,
            age: roomDetailQuery.data.peer.age,
            area: roomDetailQuery.data.peer.areaName,
            image: roomDetailQuery.data.peer.profileImageUrl,
            userId: roomDetailQuery.data.peer.userId,
          }
        : null,
    [roomDetailQuery.data],
  );
  const activeBlock = useMemo(() => {
    if (typeof peerUserId !== "number") return null;

    return (
      blocksQuery.data?.pages
        .flatMap((page) => page.items)
        .find(
          (block) =>
            Number(block.targetUserId) === peerUserId &&
            block.status === "BLOCKED",
        ) ?? null
    );
  }, [blocksQuery.data, peerUserId]);
  const apiMessages = useMemo(
    () =>
      mapChatMessages(
        messagesQuery.data,
        roomDetailQuery.data?.peer.profileImageUrl,
      ),
    [messagesQuery.data, roomDetailQuery.data?.peer.profileImageUrl],
  );
  const [optimisticMessages, setOptimisticMessages] = useState<
    ChatMessageData[]
  >([]);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [localBlockId, setLocalBlockId] = useState<number | null>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isChatRealtimeActive, setIsChatRealtimeActive] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [playingVoiceMessageId, setPlayingVoiceMessageId] = useState<
    string | null
  >(null);
  const [toastMessage, setToastMessage] = useState("");
  const isRecording = recorderState.isRecording;
  const displayRecordingTime = isRecording
    ? Math.floor(recorderState.durationMillis / 1000)
    : recordingTime;
  const messages = useMemo(() => {
    const apiMessageIds = new Set(apiMessages.map((message) => message.id));
    return [
      ...apiMessages,
      ...optimisticMessages.filter((message) => !apiMessageIds.has(message.id)),
    ];
  }, [apiMessages, optimisticMessages]);
  const visibleMessages = useMemo(
    () => withGroupedMessageTimes(withDateSeparators(messages)),
    [messages],
  );
  const displayedMessages = useMemo(
    () => [...visibleMessages].reverse(),
    [visibleMessages],
  );
  const peerUserIdRef = useRef<number | undefined>(undefined);
  const peerProfileImageUrlRef = useRef<string | undefined>(undefined);
  const isBlockedRef = useRef(false);
  const readMessageIdsRef = useRef<Set<number>>(new Set());
  const blockId = activeBlock?.blockId ?? localBlockId;
  const isBlockSubmitting =
    blockUserMutation.isPending || patchBlockMutation.isPending;

  useEffect(() => {
    setIsBlocked(!!activeBlock);
    isBlockedRef.current = !!activeBlock;
    setLocalBlockId(activeBlock?.blockId ?? null);
  }, [activeBlock]);

  useEffect(() => {
    isBlockedRef.current = isBlocked;
  }, [isBlocked]);

  useEffect(() => {
    peerUserIdRef.current = roomDetailQuery.data?.peer.userId;
    peerProfileImageUrlRef.current = roomDetailQuery.data?.peer.profileImageUrl;
  }, [
    roomDetailQuery.data?.peer.profileImageUrl,
    roomDetailQuery.data?.peer.userId,
  ]);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage("");
      toastTimeoutRef.current = null;
    }, 1800);
  }, []);

  const scrollToLatestMessage = useCallback(() => {
    shouldScrollToLatestRef.current = true;

    requestAnimationFrame(() => {
      messageListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });

    setTimeout(() => {
      messageListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 80);
  }, []);

  const handleMessageListContentSizeChange = useCallback(() => {
    if (!shouldScrollToLatestRef.current) return;

    shouldScrollToLatestRef.current = false;
    requestAnimationFrame(() => {
      messageListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, []);

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

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      audioRecorder.stop().catch(() => undefined);
      stopVoicePlayback();
    };
  }, [audioRecorder, stopVoicePlayback]);

  useEffect(() => {
    if (!isRecording) return;

    setRecordingTime(Math.floor(recorderState.durationMillis / 1000));
  }, [isRecording, recorderState.durationMillis]);

  useEffect(() => {
    if (!hasChatRoomId || isChatRealtimeActive) return;

    const intervalId = setInterval(() => {
      void refetchMessages();
    }, 2500);

    return () => clearInterval(intervalId);
  }, [hasChatRoomId, isChatRealtimeActive, refetchMessages]);

  useEffect(() => {
    if (!hasChatRoomId) return;

    const unreadMessageIds =
      messagesQuery.data?.pages.flatMap((page) =>
        page.items
          .filter(
            (message) =>
              !message.isMine &&
              !message.readAt &&
              !readMessageIdsRef.current.has(message.messageId),
          )
          .map((message) => message.messageId),
      ) ?? [];

    if (unreadMessageIds.length === 0) return;

    unreadMessageIds.forEach((messageId) => {
      readMessageIdsRef.current.add(messageId);
    });

    void Promise.all(
      unreadMessageIds.map((messageId) => readChatMessage(messageId)),
    )
      .then(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
        queryClient.invalidateQueries({
          queryKey: queryKeys.chats.messages(chatRoomId, 30),
        });
      })
      .catch((error) => {
        console.log("[ChatSocket] read messages error", error);
      });
  }, [chatRoomId, hasChatRoomId, messagesQuery.data, queryClient]);

  useEffect(() => {
    setIsChatRealtimeActive(false);

    if (!hasChatRoomId) return;

    const socket = connectChatSocket();
    let isActive = true;
    let hasJoinedRoom = false;

    const joinRoom = (attempt = 1) => {
      console.log("[ChatSocket] room.join request", {
        attempt,
        chatRoomId,
        connected: socket.connected,
        socketId: socket.id,
      });

      joinChatRoomSocket({ chatRoomId }, socket)
        .then((response) => {
          console.log("[ChatSocket] room.join", response);
          if (!isActive) return;

          if (!isSocketSuccess(response)) {
            showToast(`채팅방 입장 실패: ${response.error.message}`);
            return;
          }

          hasJoinedRoom = true;
          setIsChatRealtimeActive(true);
        })
        .catch((error) => {
          console.log("[ChatSocket] room.join error", error);
          if (!isActive || hasJoinedRoom) {
            return;
          }

          if (attempt < 2 && socket.connected) {
            setTimeout(() => {
              if (isActive && socket.connected && !hasJoinedRoom) {
                joinRoom(attempt + 1);
              }
            }, 500);
          }
        });
    };

    const handleConnect = async () => {
      console.log("[ChatSocket] connected", { chatRoomId, socketId: socket.id });
      try {
        const pingResponse = await pingChatSocket(socket, 5000);
        console.log("[ChatSocket] ping", pingResponse);
      } catch (error) {
        console.log("[ChatSocket] ping error", error);
      }

      joinRoom();
    };

    const handleConnectError = (error: Error & {
      description?: unknown;
      context?: unknown;
      type?: string;
    }) => {
      console.log("[ChatSocket] connect_error", {
        ...getChatSocketDebugConfig(),
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type,
      });
      setIsChatRealtimeActive(false);
      showToast(`채팅 서버 연결 실패: ${error.message}`);
    };
    const handleDisconnect = () => {
      setIsChatRealtimeActive(false);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    const appendIncomingMessage = (nextMessage: MessageNewData) => {
      if (nextMessage.chatRoomId !== chatRoomId) return;
      if (
        isBlockedRef.current &&
        nextMessage.senderUserId === peerUserIdRef.current
      ) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.messages(chatRoomId, 30),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });

      setOptimisticMessages((prevMessages) =>
        appendSocketMessage(
          prevMessages,
          mapSocketMessage(
            nextMessage,
            myUserId,
            peerUserIdRef.current,
            peerProfileImageUrlRef.current,
          ),
        ),
      );
      scrollToLatestMessage();
    };

    const handleAnyEvent = (event: string, ...args: unknown[]) => {
      if (__DEV__) {
        console.log("[ChatSocket] event", event, args);
      }

      const nextMessage = getSocketMessageData(args[0]);
      if (nextMessage) {
        appendIncomingMessage(nextMessage);
      }
    };
    socket.onAny(handleAnyEvent);

    if (socket.connected) {
      joinRoom();
    }

    const unsubscribeMessageNew = onMessageNew((payload) => {
      if (payload.resultType !== "SUCCESS") return;

      const nextMessage = payload.success.data;
      appendIncomingMessage(nextMessage);
    }, socket);

    const unsubscribeMessageRead = onMessageRead((payload) => {
      if (payload.resultType !== "SUCCESS") return;
      const readEvent = payload.success.data;
      if (readEvent.chatRoomId !== chatRoomId) return;

      console.log("[ChatSocket] message.read", readEvent);
      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.messages(chatRoomId, 30),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });

      setOptimisticMessages((prevMessages) =>
        markSocketMessageRead(prevMessages, readEvent),
      );
    }, socket);

    const unsubscribeMessageDeleted = onMessageDeleted((payload) => {
      if (payload.resultType !== "SUCCESS") return;
      const deletedEvent = payload.success.data;
      if (deletedEvent.chatRoomId !== chatRoomId) return;

      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.messages(chatRoomId, 30),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });

      setOptimisticMessages((prevMessages) =>
        removeSocketMessage(prevMessages, deletedEvent),
      );
    }, socket);

    return () => {
      isActive = false;
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.offAny(handleAnyEvent);
      unsubscribeMessageNew();
      unsubscribeMessageRead();
      unsubscribeMessageDeleted();
      disconnectChatSocket();
    };
  }, [
    chatRoomId,
    hasChatRoomId,
    myUserId,
    queryClient,
    scrollToLatestMessage,
    showToast,
  ]);

  const handleReport = () => {
    setShowActionSheet(false);
    if (!profile || typeof profile.userId !== "number") {
      showToast("대화방 정보를 불러온 뒤 다시 시도해주세요.");
      return;
    }

    router.push({
      pathname: "/chat/report",
      params: {
        targetUserId: String(profile.userId),
        chatRoomId: String(chatRoomId),
        nickname: profile.name,
      },
    } as never);
  };

  const handleBlockToggle = () => {
    setShowActionSheet(false);
    if (!profile) {
      showToast("대화방 정보를 불러온 뒤 다시 시도해주세요.");
      return;
    }

    if (isBlocked) {
      if (!blockId || isBlockSubmitting) return;

      patchBlockMutation.mutate(blockId, {
        onSuccess: () => {
          setIsBlocked(false);
          setLocalBlockId(null);
          queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
          showToast(`${profile.name}님을 차단 해제했습니다`);
        },
        onError: () => {
          showToast("차단 해제에 실패했습니다.");
        },
      });
      return;
    }

    setShowBlockModal(true);
  };

  const handleLeave = () => {
    setShowActionSheet(false);
    setShowLeaveModal(true);
  };

  const syncSentMessage = useCallback(
    (pendingMessageId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.messages(chatRoomId, 30),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });

      setTimeout(() => {
        void refetchMessages().finally(() => {
          setOptimisticMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== pendingMessageId),
          );
        });
      }, 300);
    },
    [chatRoomId, queryClient, refetchMessages],
  );

  const handleSend = (text: string) => {
    const sentAt = new Date().toISOString();
    const nextMessage: ChatMessageData = {
      id: `pending-message-${Date.now()}`,
      type: "text",
      text,
      isMine: true,
      time: formatChatTime(sentAt),
      sentAt,
      showUnreadIndicator: true,
    };

    setOptimisticMessages((prevMessages) => [...prevMessages, nextMessage]);
    setIsAttachmentOpen(false);
    scrollToLatestMessage();

    if (!hasChatRoomId) return;

    sendChatMessageSocket({
      type: "TEXT",
      chatRoomId,
      text,
    })
      .then((response) => {
        console.log("[ChatSocket] message.send", response);
        if (!isSocketSuccess(response)) {
          throw new Error(response.error.message);
        }

        const sentMessage = response.success.data;
        const confirmedMessage: ChatMessageData = {
          ...nextMessage,
          id: `message-${sentMessage.messageId}`,
          time: formatChatTime(sentMessage.sentAt),
          sentAt: sentMessage.sentAt,
        };

        setOptimisticMessages((prevMessages) =>
          replaceOptimisticMessage(
            prevMessages,
            nextMessage.id,
            confirmedMessage,
          ),
        );
        syncSentMessage(nextMessage.id);
      })
      .catch((error) => {
        console.log("[ChatSocket] message.send error", error);
        syncSentMessage(nextMessage.id);
      });
  };

  const formatVoiceDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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
        showToast("마이크 권한이 필요해요.");
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
      console.log("[ChatVoice] start recording error", error);
      showToast("녹음을 시작하지 못했습니다.");
    }
  };

  const stopVoiceRecording = async () => {
    const nextSeconds = Math.max(
      recordingTime,
      Math.floor(recorderState.durationMillis / 1000),
    );

    if (nextSeconds <= 0) {
      showToast("녹음 시간이 너무 짧아요.");
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
      console.log("[ChatVoice] stop recording error", error);
      showToast("녹음을 종료하지 못했습니다.");
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
    if (isUploadingVoice || !hasChatRoomId) return;

    const recording = isRecording
      ? await stopVoiceRecording()
      : recordingUri
        ? { uri: recordingUri, durationSec: recordingTime }
        : null;

    if (!recording || recording.durationSec <= 0) {
      showToast("먼저 음성을 녹음해주세요.");
      return;
    }

    const sentAt = new Date().toISOString();
    const nextMessage: ChatMessageData = {
      id: `pending-voice-${Date.now()}`,
      type: "voice",
      duration: formatVoiceDuration(recording.durationSec),
      isMine: true,
      time: formatChatTime(sentAt),
      sentAt,
      mediaUrl: recording.uri,
      isPlaying: false,
      showUnreadIndicator: true,
    };

    setOptimisticMessages((prevMessages) => [...prevMessages, nextMessage]);
    setIsVoiceRecorderOpen(false);
    setIsUploadingVoice(true);
    scrollToLatestMessage();

    try {
      const mediaRef = await uploadChatVoiceMessage(chatRoomId, recording.uri);
      try {
        const response = await sendChatMessageSocket({
          type: "AUDIO",
          chatRoomId,
          mediaUrl: mediaRef,
          durationSec: recording.durationSec,
        });

        console.log("[ChatSocket] voice.message.send", response);
        if (isSocketSuccess(response)) {
          const sentMessage = response.success.data;
          const confirmedMessage: ChatMessageData = {
            ...nextMessage,
            id: `message-${sentMessage.messageId}`,
            time: formatChatTime(sentMessage.sentAt),
            sentAt: sentMessage.sentAt,
          };

          setOptimisticMessages((prevMessages) =>
            replaceOptimisticMessage(
              prevMessages,
              nextMessage.id,
              confirmedMessage,
            ),
          );
        } else {
          console.log("[ChatVoice] send fail ack", response.error);
        }
      } catch (sendError) {
        console.log("[ChatVoice] socket send error", sendError);
      }

      syncSentMessage(nextMessage.id);
      setRecordingUri(null);
      setRecordingTime(0);
    } catch (error) {
      const uploadError = formatVoiceUploadError(error);
      console.log("[ChatVoice] upload error", {
        step: getVoiceUploadErrorStep(error),
        message: uploadError,
        raw: error,
      });
      setOptimisticMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== nextMessage.id),
      );
      showToast(`음성 전송 실패: ${truncateDebugMessage(uploadError, 80)}`);
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
      showToast("재생할 음성 파일을 찾지 못했습니다.");
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
        // 일부 플랫폼은 메타데이터 로딩 전 seek를 지원하지 않습니다.
      }

      nextPlayer.play();
      setPlayingVoiceMessageId(message.id);
      playbackStopTimerRef.current = setTimeout(() => {
        if (playbackPlayerRef.current === nextPlayer) {
          stopVoicePlayback();
        }
      }, parseDurationSeconds(message.duration) * 1000 + 500);
    } catch (error) {
      console.log("[ChatVoice] playback error", error);
      stopVoicePlayback();
      showToast("음성 메시지를 재생하지 못했습니다.");
    }
  };

  const renderProfileInfo = () => (
    <View style={styles.profileHeader}>
      {profile ? (
        <>
          {profile.image ? (
            <Image
              source={{ uri: profile.image }}
              style={styles.profileAvatar}
            />
          ) : (
            <View style={styles.profileAvatar} />
          )}
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileInfo}>
            {profile.age}세 · {profile.area}
          </Text>
          <Text style={styles.profileWelcomeText}>
            서로를 알아가는 첫 이야기,{"\n"}편하게 시작해볼까요?
          </Text>
        </>
      ) : roomDetailQuery.isLoading ? (
        <ActivityIndicator color="#FF3E70" />
      ) : (
        <Text style={styles.profileWelcomeText}>
          대화방 정보를 불러오지 못했습니다.
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={24} color="#A6AFB6" />
        </Pressable>
        <Text style={styles.headerTitle}>{profile?.name ?? "대화"}</Text>
        <Pressable
          style={[
            styles.headerButton,
            styles.menuButton,
            !profile && styles.headerButtonDisabled,
          ]}
          onPress={() => setShowActionSheet(true)}
          hitSlop={10}
          disabled={!profile}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={profile ? "#202020" : "#CBD5E1"}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.messageListFrame}>
          <FlatList
            ref={messageListRef}
            data={displayedMessages}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatMessage
                message={
                  item.type === "voice"
                    ? { ...item, isPlaying: item.id === playingVoiceMessageId }
                    : item
                }
                onVoicePress={handleVoicePlay}
              />
            )}
            ListFooterComponent={
              <>
                {messagesQuery.isFetchingNextPage ? (
                  <View style={styles.paginationLoading}>
                    <Text style={styles.paginationLoadingText}>
                      이전 대화를 불러오는 중...
                    </Text>
                  </View>
                ) : null}
                {renderProfileInfo()}
              </>
            }
            ListEmptyComponent={
              messagesQuery.isLoading ? (
                <View style={styles.emptyMessages}>
                  <ActivityIndicator color="#FF3E70" />
                </View>
              ) : (
                <View style={styles.emptyMessages}>
                  <Text style={styles.emptyMessagesTitle}>
                    아직 주고받은 메시지가 없어요
                  </Text>
                  <Text style={styles.emptyMessagesText}>
                    {messagesQuery.isError
                      ? "대화 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
                      : "첫 메시지를 보내 대화를 시작해보세요."}
                  </Text>
                </View>
              )
            }
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={handleMessageListContentSizeChange}
            onEndReached={() => {
              if (
                messagesQuery.hasNextPage &&
                !messagesQuery.isFetchingNextPage
              ) {
                messagesQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.35}
          />
        </View>

        {!isBlocked && !isAttachmentOpen ? (
          isVoiceRecorderOpen ? (
            <View style={styles.voiceRecorderPosition}>
              {/* 기존 채팅 마이크 버튼 위치에서 녹음 컨트롤을 보여줍니다. */}
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
              <Ionicons name="mic-outline" size={34} color="#FFFFFF" />
            </Pressable>
          )
        ) : null}

        {isBlocked ? (
          <View style={styles.blockedInputArea}>
            <Ionicons name="add" size={25} color="#A6AFB6" />
            <View style={styles.blockedTextBox}>
              <Text style={styles.blockedText}>
                차단한 사용자와는 대화할 수 없어요.
              </Text>
            </View>
          </View>
        ) : isVoiceRecorderOpen ? (
          <View style={styles.chatInputPlaceholder} />
        ) : (
          <ChatInput
            onSend={handleSend}
            isAttachmentOpen={isAttachmentOpen}
            onToggleAttachment={() =>
              setIsAttachmentOpen((prevOpen) => !prevOpen)
            }
          />
        )}
      </KeyboardAvoidingView>

      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      <ChatActionSheet
        visible={showActionSheet}
        isBlocked={isBlocked}
        onClose={() => setShowActionSheet(false)}
        onReport={handleReport}
        onBlockToggle={handleBlockToggle}
        onLeave={handleLeave}
      />

      <ConfirmModal
        visible={showLeaveModal}
        title="대화방을 나갈까요?"
        subtitle="대화방을 나가면 다시 대화할 수 없습니다."
        cancelLabel="취소"
        confirmLabel="나가기"
        onClose={() => setShowLeaveModal(false)}
        onConfirm={() => {
          setShowLeaveModal(false);
          if (!hasChatRoomId) {
            router.replace("/(tabs)/chat" as never);
            return;
          }

          leaveChatRoomMutation.mutate(undefined, {
            onSettled: () => router.replace("/(tabs)/chat" as never),
          });
        }}
      />

      <ConfirmModal
        visible={showBlockModal}
        title="상대방을 차단할까요?"
        subtitle={`차단하면 ${profile?.name ?? "상대방"}님과 채팅창에서 대화를 주고받을 수 없어요. 차단하시겠어요?`}
        cancelLabel="취소"
        confirmLabel="차단"
        onClose={() => setShowBlockModal(false)}
        onConfirm={() => {
          if (!profile || typeof profile.userId !== "number" || isBlockSubmitting) {
            return;
          }

          setShowBlockModal(false);
          blockUserMutation.mutate(
            {
              targetUserId: profile.userId,
              reason: "채팅방에서 사용자 차단",
            },
            {
              onSuccess: (block) => {
                setIsBlocked(true);
                setLocalBlockId(block.blockId);
                queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
                showToast(`${profile.name}님을 차단했습니다`);
              },
              onError: () => {
                showToast("차단에 실패했습니다.");
              },
            },
          );
        }}
      />
    </SafeAreaView>
  );
}

function mapChatMessages(
  data:
    | {
        pages: {
          items: {
            messageId: number;
            type: "TEXT" | "AUDIO" | "PHOTO" | "VIDEO";
            text: string | null;
            mediaUrl: string | null;
            durationSec: number;
            isMine: boolean;
            sentAt: string;
            readAt?: string | null;
          }[];
        }[];
      }
    | undefined,
  peerAvatar?: string,
): ChatMessageData[] {
  return (
    data?.pages
      .flatMap((page) => page.items)
      .sort(
        (left, right) =>
          new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime(),
      )
      .map((item) => {
        const base = {
          id: `message-${item.messageId}`,
          isMine: item.isMine,
          time: formatChatTime(item.sentAt),
          sentAt: item.sentAt,
          avatar: item.isMine ? undefined : peerAvatar,
          showUnreadIndicator: item.isMine && !item.readAt,
        };

        if (item.type === "AUDIO") {
          return {
            ...base,
            type: "voice" as const,
            duration: formatDuration(item.durationSec),
            mediaUrl: item.mediaUrl ?? undefined,
            isPlaying: false,
          };
        }

        return {
          ...base,
          type: "text" as const,
          text:
            item.type === "PHOTO"
              ? item.text ?? "[사진]"
              : item.type === "VIDEO"
                ? item.text ?? "[동영상]"
                : item.text ?? "",
        };
      }) ?? []
  );
}

function isSocketSuccess<TData>(
  response: SocketAckResponse<TData>,
): response is Extract<SocketAckResponse<TData>, { resultType: "SUCCESS" }> {
  return response.resultType === "SUCCESS";
}

function mapSocketMessage(
  item: MessageNewData,
  myUserId?: number,
  peerUserId?: number,
  peerAvatar?: string,
): ChatMessageData {
  const isMine = myUserId
    ? item.senderUserId === myUserId
    : peerUserId
      ? item.senderUserId !== peerUserId
      : false;
  const base = {
    id: `message-${item.messageId}`,
    isMine,
    time: formatChatTime(item.sentAt),
    sentAt: item.sentAt,
    avatar: isMine ? undefined : item.senderProfileImage ?? peerAvatar,
    showUnreadIndicator: isMine,
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

  return {
    ...base,
    type: "text",
    text:
      item.type === "PHOTO"
        ? item.text ?? "[사진]"
        : item.type === "VIDEO"
          ? item.text ?? "[동영상]"
          : item.text ?? "",
  };
}

function appendSocketMessage(
  messages: ChatMessageData[],
  nextMessage: ChatMessageData,
) {
  let removedPendingMessage = false;
  const messagesWithoutPendingDuplicate = messages.filter((message) => {
    if (
      !removedPendingMessage &&
      isPendingLocalMessage(message) &&
      isSameChatMessage(message, nextMessage)
    ) {
      removedPendingMessage = true;
      return false;
    }

    return true;
  });

  if (
    messagesWithoutPendingDuplicate.some(
      (message) => message.id === nextMessage.id,
    )
  ) {
    return messagesWithoutPendingDuplicate;
  }

  return [...messagesWithoutPendingDuplicate, nextMessage];
}

function isPendingLocalMessage(message: ChatMessageData) {
  return message.id.startsWith("pending-");
}

function withDateSeparators(messages: ChatMessageData[]) {
  const messagesWithDates: ChatMessageData[] = [];
  let previousDateKey: string | null = null;

  messages.forEach((message) => {
    if (message.type === "date") {
      messagesWithDates.push(message);
      return;
    }

    const dateKey = getChatDateKey(message.sentAt);
    if (dateKey && dateKey !== previousDateKey) {
      messagesWithDates.push({
        id: `date-${dateKey}`,
        type: "date",
        dateText: formatChatDate(message.sentAt),
      });
      previousDateKey = dateKey;
    }

    messagesWithDates.push(message);
  });

  return messagesWithDates;
}

function withGroupedMessageTimes(messages: ChatMessageData[]) {
  return messages.map((message, index) => {
    if (message.type === "date") {
      return message;
    }

    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const isSameGroupAsPrev =
      prevMessage &&
      prevMessage.type !== "date" &&
      prevMessage.isMine === message.isMine &&
      prevMessage.time === message.time;
    const isSameGroupAsNext =
      nextMessage &&
      nextMessage.type !== "date" &&
      nextMessage.isMine === message.isMine &&
      nextMessage.time === message.time;

    return {
      ...message,
      showTime: !isSameGroupAsNext,
      showAvatar: message.isMine ? undefined : !isSameGroupAsNext,
      compactSpacing: Boolean(isSameGroupAsPrev || isSameGroupAsNext),
      groupTopSpacing: Boolean(prevMessage && !isSameGroupAsPrev),
    };
  });
}

function isSameChatMessage(
  leftMessage: ChatMessageData,
  rightMessage: ChatMessageData,
) {
  if (leftMessage.type !== rightMessage.type) return false;
  if (leftMessage.type === "date" || rightMessage.type === "date") return false;
  if (leftMessage.isMine !== rightMessage.isMine) return false;

  if (leftMessage.type === "text" && rightMessage.type === "text") {
    return leftMessage.text === rightMessage.text;
  }

  if (leftMessage.type === "voice" && rightMessage.type === "voice") {
    return leftMessage.duration === rightMessage.duration;
  }

  return false;
}

function replaceOptimisticMessage(
  messages: ChatMessageData[],
  optimisticMessageId: string,
  confirmedMessage: ChatMessageData,
) {
  if (messages.some((message) => message.id === confirmedMessage.id)) {
    return messages.filter((message) => message.id !== optimisticMessageId);
  }

  return messages.map((message) =>
    message.id === optimisticMessageId ? confirmedMessage : message,
  );
}

function removeSocketMessage(
  messages: ChatMessageData[],
  deletedEvent: MessageDeletedData,
) {
  return messages.filter(
    (message) => message.id !== `message-${deletedEvent.messageId}`,
  );
}

function markSocketMessageRead(
  messages: ChatMessageData[],
  readEvent: MessageReadData,
) {
  return messages.map((message) => {
    if (message.id !== `message-${readEvent.messageId}`) {
      return message;
    }

    if (message.type === "date") {
      return message;
    }

    return {
      ...message,
      showUnreadIndicator: false,
    };
  });
}

function getSocketMessageData(payload: unknown): MessageNewData | null {
  const data = unwrapSocketPayloadData(payload);
  if (!isRecord(data)) return null;

  const {
    messageId,
    chatRoomId,
    senderUserId,
    type,
    text,
    mediaUrl,
    durationSec,
    sentAt,
    senderName,
    senderProfileImage,
  } = data;

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

function unwrapSocketPayloadData(payload: unknown) {
  if (!isRecord(payload)) return payload;

  const success = payload.success;
  if (payload.resultType === "SUCCESS" && isRecord(success)) {
    return success.data;
  }

  return payload.data ?? payload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isChatMessageType(value: unknown): value is MessageNewData["type"] {
  return (
    value === "TEXT" ||
    value === "AUDIO" ||
    value === "PHOTO" ||
    value === "VIDEO"
  );
}

async function uploadChatVoiceMessage(chatRoomId: number, uri: string) {
  const contentType = resolveAudioContentType(uri);
  const fileName = `chat-voice-${Date.now()}.${contentTypeToExtension(contentType)}`;
  const uploadFile = await getVoiceUploadFileInfo(uri, contentType);

  if (__DEV__) {
    console.log("[ChatVoice] file ready", {
      chatRoomId,
      uri,
      fileName,
      contentType,
      fileSize: uploadFile.size,
      hasBlob: Boolean(uploadFile.blob),
    });
  }

  const presignData = await runVoiceUploadStep("PRESIGN", () =>
    postChatMediaPresign(chatRoomId, {
      name: fileName,
      type: contentType,
      size: uploadFile.size,
    }),
  );

  if (__DEV__) {
    console.log("[ChatVoice] upload presign success", {
      hasUploadUrl: Boolean(presignData.uploadUrl),
      hasMediaRef: Boolean(presignData.mediaRef),
      uploadHost: getDebugUrlHost(presignData.uploadUrl),
      uploadUrlPreview: getDebugUrlPreview(presignData.uploadUrl),
      mediaRef: presignData.mediaRef,
      requiredHeaders: presignData.requiredHeaders,
    });
  }

  if (Platform.OS !== "web" && isLocalFileUri(uri)) {
    try {
      await runVoiceUploadStep("S3_NATIVE", () =>
        uploadChatFileUriToS3(presignData, uri, contentType),
      );

      if (__DEV__) {
        console.log("[ChatVoice] upload native s3 success", {
          mediaRef: presignData.mediaRef,
        });
      }

      return presignData.mediaRef;
    } catch (nativeUploadError) {
      console.log("[ChatVoice] native s3 failed", {
        message: formatVoiceUploadError(nativeUploadError),
        raw: nativeUploadError,
      });
      if (isTerminalS3UploadError(nativeUploadError)) {
        throw nativeUploadError;
      }
    }
  }

  const blob =
    uploadFile.blob ?? (await readVoiceUploadBlob(uri, contentType));

  await runVoiceUploadStep("S3_BLOB", () =>
    uploadChatFileToS3(presignData, blob, contentType),
  );

  if (__DEV__) {
    console.log("[ChatVoice] upload blob s3 success", {
      mediaRef: presignData.mediaRef,
      blobSize: blob.size,
      blobType: blob.type,
    });
  }

  return presignData.mediaRef;
}

type VoiceUploadStep =
  | "FILE_INFO"
  | "READ_LOCAL_FILE"
  | "PRESIGN"
  | "S3_NATIVE"
  | "S3_BLOB"
  | "UNKNOWN";

class VoiceUploadError extends Error {
  readonly step: VoiceUploadStep;
  readonly source: unknown;

  constructor(step: VoiceUploadStep, source: unknown) {
    super(`${step}: ${formatUnknownError(source)}`);
    this.name = "VoiceUploadError";
    this.step = step;
    this.source = source;
  }
}

async function runVoiceUploadStep<T>(
  step: Exclude<VoiceUploadStep, "UNKNOWN">,
  action: () => Promise<T>,
) {
  try {
    return await action();
  } catch (error) {
    throw new VoiceUploadError(step, error);
  }
}

async function getVoiceUploadFileInfo(uri: string, contentType: string) {
  if (Platform.OS !== "web" && isLocalFileUri(uri)) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (
        fileInfo.exists &&
        !fileInfo.isDirectory &&
        typeof fileInfo.size === "number" &&
        fileInfo.size > 0
      ) {
        return { size: fileInfo.size, blob: undefined as Blob | undefined };
      }

      throw new Error(
        `녹음 파일 정보가 올바르지 않습니다: exists=${fileInfo.exists}`,
      );
    } catch (error) {
      console.log("[ChatVoice] file info failed, retry blob read", error);
    }
  }

  const blob = await readVoiceUploadBlob(uri, contentType);

  return { size: blob.size, blob };
}

async function readVoiceUploadBlob(uri: string, contentType: string) {
  return runVoiceUploadStep("READ_LOCAL_FILE", () =>
    getAudioBlob(uri, contentType),
  );
}

async function getAudioBlob(uri: string, contentType: string) {
  try {
    return ensureAudioBlob(await getAudioBlobWithFetch(uri), contentType);
  } catch (error) {
    console.log("[ChatVoice] fetch local audio failed, retry xhr", error);
    return ensureAudioBlob(await getAudioBlobWithXhr(uri), contentType);
  }
}

async function getAudioBlobWithFetch(uri: string) {
  const fileResponse = await fetch(uri);
  return fileResponse.blob();
}

function getAudioBlobWithXhr(uri: string) {
  return new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", uri);
    xhr.responseType = "blob";
    xhr.onload = () => {
      const isSuccess = xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300);
      if (!isSuccess) {
        reject(new Error(`로컬 음성 파일 읽기 실패: ${xhr.status}`));
        return;
      }

      if (isBlobLike(xhr.response)) {
        resolve(xhr.response);
        return;
      }

      reject(new Error("로컬 음성 파일 응답이 Blob 형식이 아닙니다."));
    };
    xhr.onerror = () => {
      reject(new Error("로컬 음성 파일 네트워크 읽기 실패"));
    };
    xhr.send();
  });
}

function ensureAudioBlob(blob: Blob, contentType: string) {
  if (blob.size <= 0) {
    throw new Error("녹음 파일이 비어 있습니다.");
  }

  if (blob.type) {
    return blob;
  }

  return new Blob([blob], { type: contentType });
}

function isBlobLike(value: unknown): value is Blob {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Blob).size === "number" &&
    typeof (value as Blob).slice === "function"
  );
}

function isLocalFileUri(uri: string) {
  return uri.startsWith("file://");
}

function formatVoiceUploadError(error: unknown) {
  const step = getVoiceUploadErrorStep(error);
  const source = error instanceof VoiceUploadError ? error.source : error;
  const message = formatUnknownError(source);

  return step === "UNKNOWN" ? message : `${step}: ${message}`;
}

function getVoiceUploadErrorStep(error: unknown): VoiceUploadStep {
  return error instanceof VoiceUploadError ? error.step : "UNKNOWN";
}

function isTerminalS3UploadError(error: unknown) {
  const source = error instanceof VoiceUploadError ? error.source : error;

  return isChatS3UploadError(source) && source.status >= 400;
}

function formatUnknownError(error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const responseMessage = getAxiosResponseMessage(error.response?.data);
    const prefix = status ? `HTTP ${status}` : error.code ?? "AXIOS";

    return responseMessage
      ? `${prefix} ${responseMessage}`
      : `${prefix} ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return stringifyDebugValue(error);
}

function getAxiosResponseMessage(data: unknown) {
  if (typeof data === "string") {
    return data;
  }

  if (isRecord(data)) {
    const error = data.error;
    if (isRecord(error)) {
      const code = typeof error.code === "string" ? error.code : "";
      const message = typeof error.message === "string" ? error.message : "";
      return [code, message].filter(Boolean).join(" ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }
  }

  return stringifyDebugValue(data);
}

function stringifyDebugValue(value: unknown) {
  try {
    const stringified = JSON.stringify(value);
    return stringified ?? String(value);
  } catch {
    return String(value);
  }
}

function truncateDebugMessage(message: string, maxLength: number) {
  return message.length > maxLength
    ? `${message.slice(0, Math.max(0, maxLength - 3))}...`
    : message;
}

function getDebugUrlHost(url: string) {
  const match = /^https?:\/\/([^/?#]+)/i.exec(url);

  return match?.[1] ?? "unknown";
}

function getDebugUrlPreview(url: string) {
  const match = /^(https?:\/\/[^/?#]+\/[^?]*)/i.exec(url);
  const baseUrl = match?.[1] ?? url.slice(0, 80);

  return baseUrl.length > 120 ? `${baseUrl.slice(0, 120)}...` : baseUrl;
}

function resolveAudioContentType(uri: string) {
  if (uri.toLowerCase().endsWith(".webm")) {
    return "audio/webm";
  }

  return "audio/mp4";
}

function contentTypeToExtension(contentType: string) {
  if (contentType === "audio/webm") {
    return "webm";
  }

  return "m4a";
}

function parseDurationSeconds(duration: string) {
  const [minutes = "0", seconds = "0"] = duration.split(":");
  const totalSeconds = Number(minutes) * 60 + Number(seconds);

  return Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 1;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatChatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatChatDate(value?: string) {
  const date = new Date(value ?? "");
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function getChatDateKey(value?: string) {
  const date = new Date(value ?? "");
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  messageListFrame: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerButtonDisabled: {
    opacity: 0.6,
  },
  menuButton: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: "#202020",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
  },
  paginationLoading: {
    paddingVertical: 12,
    alignItems: "center",
  },
  paginationLoadingText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#A6AFB6",
  },
  emptyMessages: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyMessagesTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#202020",
    textAlign: "center",
  },
  emptyMessagesText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#A6AFB6",
    textAlign: "center",
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 42,
  },
  profileAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#D9D9D9",
    marginBottom: 14,
    overflow: "hidden",
  },
  profileName: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: "#202020",
    marginBottom: 8,
  },
  profileInfo: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#6F7780",
    marginBottom: 34,
  },
  profileWelcomeText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#A6AFB6",
    textAlign: "center",
  },
  voiceButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3E70",
    marginBottom: 10,
  },
  voiceRecorderPosition: {
    width: "100%",
    paddingHorizontal: 22,
    alignItems: "center",
    marginBottom: -40,
  },
  voiceRecorder: {
    width: "100%",
  },
  chatInputPlaceholder: {
    height: 64,
    backgroundColor: "transparent",
  },
  blockedInputArea: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: 8,
  },
  blockedTextBox: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F2F3F5",
    alignItems: "center",
    justifyContent: "center",
  },
  blockedText: {
    color: "#A6AFB6",
    fontSize: 13,
    fontWeight: "600",
  },
  toast: {
    position: "absolute",
    left: 50,
    right: 50,
    bottom: 96,
    minHeight: 36,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(32,32,32,0.78)",
    paddingHorizontal: 14,
  },
  toastText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
