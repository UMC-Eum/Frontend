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
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image as CachedImage } from "@/components/Image";
import { KeyboardAvoidingView } from "@/components/KeyboardCompat";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  isChatS3UploadError,
  markChatRoomRead,
  postChatMediaPresign,
  uploadChatFileToS3,
  uploadChatFileUriToS3,
} from "@/api/chats/chatsApi";
import ChatActionSheet from "@/components/chat/ChatActionSheet";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage, { ChatMessageData } from "@/components/chat/ChatMessage";
import ConfirmModal from "@/components/chat/ConfirmModal";
import ClubChatTab from "@/components/club/ClubChatTab";
import MicRecorder from "@/components/MicRecorder";
import {
  KEYBOARD_AVOIDING_BEHAVIOR,
  KEYBOARD_VERTICAL_OFFSET,
} from "@/constants/keyboard";
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
  useChatRoomsInfiniteQuery,
  useLeaveChatRoomMutation,
} from "@/hooks/api/useChats";
import { queryKeys } from "@/hooks/api/queryKeys";
import { normalizeImageForUpload } from "@/utils/s3ImageUpload";
import {
  useBlockUserMutation,
  useBlocksInfiniteQuery,
  usePatchBlockMutation,
} from "@/hooks/api/useSocials";
import { useAuthStore } from "@/stores/authStore";
import { uniqueBy } from "@/utils/array";
import { markChatRoomUnreadCountInCache } from "@/utils/chatUnreadCache";
import type {
  MessageDeletedData,
  MessageNewData,
  MessageReadData,
  MessageSendAckData,
  SocketAckResponse,
} from "@/types/api/socket";

const DEFAULT_CHAT_GALLERY_IMAGE_URIS = [
  Image.resolveAssetSource(require("@/assets/images/default-profile.png")).uri,
  Image.resolveAssetSource(require("@/assets/images/onboarding-background-image.png")).uri,
  Image.resolveAssetSource(require("@/assets/images/splash-image.png")).uri,
];
let defaultGalleryImageIndex = 0;

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
  const roomDetail = roomDetailQuery.data;
  const isClubRoom =
    roomDetail?.type === "CLUB" || Boolean(roomDetail && !roomDetail.peer);
  const clubRoomsQuery = useChatRoomsInfiniteQuery(30, {
    enabled: hasChatRoomId && isClubRoom,
    staleTime: 15 * 1000,
  });
  const clubRoomListItem = useMemo(
    () =>
      clubRoomsQuery.data?.pages
        .flatMap((page) => page.items)
        .find((room) => room.chatRoomId === chatRoomId) ?? null,
    [chatRoomId, clubRoomsQuery.data],
  );
  const clubMemberCount =
    roomDetail?.memberCount ?? clubRoomListItem?.memberCount ?? null;
  const shouldUseDirectChat =
    hasChatRoomId && Boolean(roomDetail) && !isClubRoom;
  const shouldFetchMessages = hasChatRoomId && !isClubRoom;
  const messagesQuery = useChatMessagesInfiniteQuery(
    chatRoomId,
    30,
    shouldFetchMessages,
  );
  const peerUserId = roomDetail?.peer?.userId;
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
      roomDetail?.peer
        ? {
            name: roomDetail.peer.nickname,
            age: roomDetail.peer.age,
            area: roomDetail.peer.areaName,
            image: roomDetail.peer.profileImageUrl,
            userId: roomDetail.peer.userId,
          }
        : null,
    [roomDetail],
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
  // 상대방의 방 단위 읽음 커서(lastReadAt). 내가 보낸 메시지 중 sentAt <= peerReadAt 인 것은 읽음.
  const [peerReadAt, setPeerReadAt] = useState<string | null>(null);
  const apiMessages = useMemo(
    () =>
      mapChatMessages(
        messagesQuery.data,
        roomDetail?.peer?.profileImageUrl,
      ),
    [messagesQuery.data, roomDetail?.peer?.profileImageUrl],
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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
    const merged = [
      ...apiMessages,
      ...optimisticMessages.filter((message) => !apiMessageIds.has(message.id)),
    ];
    return applyPeerReadCursor(merged, peerReadAt);
  }, [apiMessages, optimisticMessages, peerReadAt]);
  const visibleMessages = useMemo(
    () => withGroupedMessageTimes(withDateSeparators(messages)),
    [messages],
  );
  const displayedMessages = useMemo(
    () => [...visibleMessages].reverse(),
    [visibleMessages],
  );
  const isMessageListPreparing =
    roomDetailQuery.isLoading ||
    (shouldFetchMessages && messagesQuery.isLoading);
  const hasMessageListError = roomDetailQuery.isError || messagesQuery.isError;
  const peerUserIdRef = useRef<number | undefined>(undefined);
  const peerProfileImageUrlRef = useRef<string | undefined>(undefined);
  const isBlockedRef = useRef(false);
  const roomReadInFlightRef = useRef(false);
  const lastReadTriggerIdRef = useRef(0);
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
    peerUserIdRef.current = roomDetail?.peer?.userId;
    peerProfileImageUrlRef.current = roomDetail?.peer?.profileImageUrl;
  }, [
    roomDetail?.peer?.profileImageUrl,
    roomDetail?.peer?.userId,
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

  // 방 단위 읽음 처리: 내 읽음 커서를 서버에서 전진시키고 목록/미읽음 배지를 갱신한다.
  const markRoomRead = useCallback(() => {
    if (!hasChatRoomId) return;

    markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
    if (roomReadInFlightRef.current) return;
    roomReadInFlightRef.current = true;

    void markChatRoomRead(chatRoomId)
      .then((res) => {
        if (__DEV__) {
          console.log("[ChatSocket] room read ok", chatRoomId, res?.lastReadAt);
        }
        markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
        queryClient.invalidateQueries({
          queryKey: queryKeys.chats.messages(chatRoomId, 30),
        });
        void queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
      })
      .catch((error) => {
        console.log("[ChatSocket] mark room read error", error);
      })
      .finally(() => {
        roomReadInFlightRef.current = false;
      });
  }, [chatRoomId, hasChatRoomId, queryClient]);

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
    if (!hasChatRoomId) return;

    void queryClient.cancelQueries({
      queryKey: queryKeys.chats.rooms(30),
      exact: true,
    });
    markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
  }, [chatRoomId, hasChatRoomId, queryClient]);

  useEffect(() => {
    if (!shouldUseDirectChat || isChatRealtimeActive) return;

    const intervalId = setInterval(() => {
      void refetchMessages();
    }, 2500);

    return () => clearInterval(intervalId);
  }, [isChatRealtimeActive, refetchMessages, shouldUseDirectChat]);

  useEffect(() => {
    if (!shouldUseDirectChat) return;

    const items =
      messagesQuery.data?.pages.flatMap((page) => page.items) ?? [];

    // 상대가 보낸(내가 받은) 최신 메시지가 새로 생기면 방 전체를 읽음 처리한다.
    const latestIncomingId = items.reduce(
      (max, message) =>
        !message.isMine && message.messageId > max ? message.messageId : max,
      0,
    );
    if (latestIncomingId > lastReadTriggerIdRef.current) {
      lastReadTriggerIdRef.current = latestIncomingId;
      markRoomRead();
    }

    // 내가 보낸 메시지의 서버 readAt(=상대 읽음 커서)을 커서에 반영한다.
    const maxMineReadAt = items.reduce<string | null>((max, message) => {
      if (!message.isMine || !message.readAt) return max;
      return !max || message.readAt > max ? message.readAt : max;
    }, null);
    if (maxMineReadAt) {
      setPeerReadAt((prev) =>
        !prev || maxMineReadAt > prev ? maxMineReadAt : prev,
      );
    }
  }, [markRoomRead, messagesQuery.data, shouldUseDirectChat]);

  useEffect(() => {
    setIsChatRealtimeActive(false);

    if (!shouldUseDirectChat) return;

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
            showToast(
              `채팅방 입장 실패: ${getSocketErrorMessage(response) ?? "잠시 후 다시 시도해주세요."}`,
            );
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
      if (nextMessage.senderUserId !== myUserId) {
        markRoomRead();
      } else {
        markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
      }

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
      const nextMessage = getSocketMessageData(payload);
      if (!nextMessage) return;
      appendIncomingMessage(nextMessage);
    }, socket);

    const unsubscribeMessageRead = onMessageRead((payload) => {
      const readEvent = getSocketReadData(payload);
      if (!readEvent) return;
      if (readEvent.chatRoomId !== chatRoomId) return;
      // 내 읽음 이벤트는 상대 읽음 커서에 영향 없음(상대가 읽은 경우만 "1"을 지운다).
      if (readEvent.readerUserId === myUserId) return;

      console.log("[ChatSocket] message.read", readEvent);
      setPeerReadAt((prev) =>
        !prev || readEvent.lastReadAt > prev ? readEvent.lastReadAt : prev,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.messages(chatRoomId, 30),
      });
    }, socket);

    const unsubscribeMessageDeleted = onMessageDeleted((payload) => {
      const deletedEvent = getSocketDeletedData(payload);
      if (!deletedEvent) return;
      if (deletedEvent.chatRoomId !== chatRoomId) return;

      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.messages(chatRoomId, 30),
      });
      void queryClient
        .invalidateQueries({ queryKey: queryKeys.chats.all })
        .finally(() => {
          markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
        });

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
    myUserId,
    markRoomRead,
    queryClient,
    scrollToLatestMessage,
    shouldUseDirectChat,
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

  const openPeerProfile = () => {
    if (!profile || typeof profile.userId !== "number") {
      showToast("대화방 정보를 불러온 뒤 다시 시도해주세요.");
      return;
    }

    router.push({
      pathname: "/profile-detail",
      params: {
        userId: String(profile.userId),
        name: profile.name,
        image: profile.image ?? "",
        location: profile.area ?? "",
        age: profile.age != null ? String(profile.age) : "",
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
          void queryClient
            .invalidateQueries({ queryKey: queryKeys.chats.all })
            .finally(() => {
              markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
            });
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
      void queryClient
        .invalidateQueries({ queryKey: queryKeys.chats.all })
        .finally(() => {
          markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
        });

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
        const sentMessage = getMessageSendAckData(response);
        if (!isSocketSuccess(response) && !sentMessage) {
          throw new Error(
            getSocketErrorMessage(response) ?? "메시지를 보내지 못했습니다.",
          );
        }

        if (sentMessage) {
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
        }
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
      stopVoicePlayback();
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
        const sentMessage = getMessageSendAckData(response);
        if (isSocketSuccess(response) || sentMessage) {
          const confirmedMessage: ChatMessageData = {
            ...nextMessage,
            id: sentMessage ? `message-${sentMessage.messageId}` : nextMessage.id,
            time: sentMessage ? formatChatTime(sentMessage.sentAt) : nextMessage.time,
            sentAt: sentMessage?.sentAt ?? nextMessage.sentAt,
          };

          setOptimisticMessages((prevMessages) =>
            replaceOptimisticMessage(
              prevMessages,
              nextMessage.id,
              confirmedMessage,
            ),
          );
        } else {
          console.log("[ChatVoice] send fail ack", getSocketErrorMessage(response));
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

  const handleRecordedVoicePlay = () => {
    if (!recordingUri || recordingTime <= 0) {
      showToast("재생할 녹음 파일을 찾지 못했습니다.");
      return;
    }

    void handleVoicePlay({
      id: "recorded-voice-preview",
      type: "voice",
      duration: formatVoiceDuration(recordingTime),
      mediaUrl: recordingUri,
      isMine: true,
      time: "",
      isPlaying: playingVoiceMessageId === "recorded-voice-preview",
    });
  };

  const handlePickPhoto = async (source: "camera" | "gallery") => {
    if (isUploadingPhoto || !hasChatRoomId) return;

    setIsAttachmentOpen(false);
    setIsVoiceRecorderOpen(false);

    try {
      const pickedImage = await pickChatImage(source);
      if (!pickedImage) return;

      await sendPhotoMessage(pickedImage.uri);
    } catch (error) {
      console.log("[ChatPhoto] pick/send error", error);
      showToast(`사진 전송 실패: ${truncateDebugMessage(formatUnknownError(error), 80)}`);
    }
  };

  const sendPhotoMessage = async (imageUri: string) => {
    if (isUploadingPhoto || !hasChatRoomId) return;

    const sentAt = new Date().toISOString();
    const nextMessage: ChatMessageData = {
      id: `pending-photo-${Date.now()}`,
      type: "photo",
      mediaUrl: imageUri,
      isMine: true,
      time: formatChatTime(sentAt),
      sentAt,
      showUnreadIndicator: true,
    };

    setOptimisticMessages((prevMessages) => [...prevMessages, nextMessage]);
    setIsUploadingPhoto(true);
    scrollToLatestMessage();

    try {
      const mediaRef = await uploadChatPhotoMessage(chatRoomId, imageUri);
      try {
        const response = await sendChatMessageSocket({
          type: "PHOTO",
          chatRoomId,
          mediaUrl: mediaRef,
        });

        console.log("[ChatSocket] photo.message.send", response);
        const sentMessage = getMessageSendAckData(response);
        if (isSocketSuccess(response) || sentMessage) {
          const confirmedMessage: ChatMessageData = {
            ...nextMessage,
            id: sentMessage ? `message-${sentMessage.messageId}` : nextMessage.id,
            time: sentMessage ? formatChatTime(sentMessage.sentAt) : nextMessage.time,
            sentAt: sentMessage?.sentAt ?? nextMessage.sentAt,
          };

          setOptimisticMessages((prevMessages) =>
            replaceOptimisticMessage(
              prevMessages,
              nextMessage.id,
              confirmedMessage,
            ),
          );
        } else {
          console.log("[ChatPhoto] send fail ack", getSocketErrorMessage(response));
        }
      } catch (sendError) {
        console.log("[ChatPhoto] socket send error", sendError);
      }

      syncSentMessage(nextMessage.id);
    } catch (error) {
      setOptimisticMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== nextMessage.id),
      );
      throw error;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isClubRoom) {
    const title = roomDetail?.club?.name ?? "동호회 채팅";

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
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={[styles.headerButton, styles.headerButtonDisabled]} />
        </View>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={KEYBOARD_AVOIDING_BEHAVIOR}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
        >
          <ClubChatTab
            chatRoomId={chatRoomId}
            memberCount={clubMemberCount}
            bottomPadding={8}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const renderProfileInfo = () => {
    if (!profile && !roomDetailQuery.isLoading) {
      return null;
    }

    return (
      <Pressable
        style={styles.profileHeader}
        onPress={openPeerProfile}
        accessibilityRole="button"
        accessibilityLabel={`${profile?.name ?? "상대방"} 프로필 상세 보기`}
        disabled={!profile}
      >
        {profile ? (
          <>
            {profile.image ? (
              <CachedImage
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
        ) : (
          <ActivityIndicator color="#FF3E70" />
        )}
      </Pressable>
    );
  };

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {profile?.name ?? "대화"}
        </Text>
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
        behavior={KEYBOARD_AVOIDING_BEHAVIOR}
        keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
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
                onAvatarPress={openPeerProfile}
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
              isMessageListPreparing ? (
                <View style={styles.emptyMessages}>
                  <ActivityIndicator color="#FF3E70" />
                </View>
              ) : hasMessageListError ? (
                <View style={styles.emptyMessages}>
                  <Text style={styles.emptyMessagesTitle}>
                    대화 내역을 불러오지 못했어요
                  </Text>
                  <Text style={styles.emptyMessagesText}>
                    잠시 후 다시 시도해주세요.
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyMessages}>
                  <Text style={styles.emptyMessagesTitle}>
                    아직 주고받은 메시지가 없어요
                  </Text>
                  <Text style={styles.emptyMessagesText}>
                    첫 메시지를 보내 대화를 시작해보세요.
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
                onPlayPress={handleRecordedVoicePlay}
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
            onCameraPress={() => void handlePickPhoto("camera")}
            onGalleryPress={() => void handlePickPhoto("gallery")}
            isMediaSending={isUploadingPhoto}
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
                void queryClient
                  .invalidateQueries({ queryKey: queryKeys.chats.all })
                  .finally(() => {
                    markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
                  });
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
            type: "TEXT" | "AUDIO" | "PHOTO" | "VIDEO" | "SYSTEM";
            text: string | null;
            mediaUrl: string | null;
            durationSec: number;
            isMine: boolean;
            sentAt: string;
            readAt?: string | null;
            unreadCount?: number | null;
          }[];
        }[];
      }
    | undefined,
  peerAvatar?: string,
): ChatMessageData[] {
  return (
    uniqueBy(
      data?.pages.flatMap((page) => page.items) ?? [],
      (item) => item.messageId,
    )
      .sort(
        (left, right) =>
          new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime(),
      )
      .map((item) => {
        const messageId = `message-${item.messageId}`;
        const unreadCount = resolveUnreadCount(item);
        const base = {
          id: messageId,
          isMine: item.isMine,
          time: formatChatTime(item.sentAt),
          sentAt: item.sentAt,
          avatar: item.isMine ? undefined : peerAvatar,
          unreadCount,
          showUnreadIndicator: unreadCount > 0,
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

        if (item.type === "PHOTO" && item.mediaUrl) {
          return {
            ...base,
            type: "photo" as const,
            mediaUrl: item.mediaUrl,
          };
        }

        if (item.type === "SYSTEM") {
          return {
            ...base,
            type: "text" as const,
            text: item.text ?? "",
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
      })
  );
}

function resolveUnreadCount(item: {
  isMine: boolean;
  readAt?: string | null;
  unreadCount?: number | null;
}) {
  if (!item.isMine) return 0;
  if (typeof item.unreadCount === "number") {
    return Math.max(0, item.unreadCount);
  }
  return item.readAt ? 0 : 1;
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

function getSocketErrorMessage(response: unknown) {
  if (!isRecord(response)) return undefined;
  const error = response.error;
  if (!isRecord(error)) return undefined;
  return typeof error.message === "string" ? error.message : undefined;
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
    unreadCount: isMine ? 1 : 0,
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

  if (leftMessage.type === "photo" && rightMessage.type === "photo") {
    return leftMessage.mediaUrl === rightMessage.mediaUrl;
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

// 상대 읽음 커서(peerReadAt)를 적용해, 내가 보낸 메시지 중 sentAt <= peerReadAt 인 것의 "1"을 제거한다.
// (ISO-8601 UTC 문자열이므로 사전식 비교가 시간순 비교와 일치)
function applyPeerReadCursor(
  messages: ChatMessageData[],
  peerReadAt: string | null,
): ChatMessageData[] {
  if (!peerReadAt) return messages;

  return messages.map((message) => {
    if (message.type === "date" || !message.isMine) return message;
    if (!message.sentAt || message.sentAt > peerReadAt) return message;
    if (message.unreadCount === 0 && message.showUnreadIndicator === false) {
      return message;
    }

    return {
      ...message,
      unreadCount: 0,
      showUnreadIndicator: false,
    };
  });
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

function getSocketDeletedData(payload: unknown): MessageDeletedData | null {
  const data = unwrapSocketPayloadData(payload);
  if (!isRecord(data)) return null;

  const { messageId, chatRoomId, deletedByUserId, deletedAt } = data;
  if (
    typeof messageId !== "number" ||
    typeof chatRoomId !== "number" ||
    typeof deletedByUserId !== "number" ||
    typeof deletedAt !== "string"
  ) {
    return null;
  }

  return {
    messageId,
    chatRoomId,
    deletedByUserId,
    deletedAt,
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

async function pickChatImage(source: "camera" | "gallery") {
  if (Platform.OS === "web" && source === "gallery") {
    return getNextDefaultChatGalleryImage();
  }

  if (source === "gallery") {
    let permissionResult = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (!permissionResult.granted && permissionResult.canAskAgain) {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult.granted) {
      Alert.alert("갤러리 권한 필요", "사진을 첨부하려면 갤러리 접근 권한이 필요해요.");
      if (Platform.OS === "web") {
        return getNextDefaultChatGalleryImage();
      }
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
    });

    return result.canceled ? null : (result.assets[0] ?? null);
  }

  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissionResult.granted) {
    Alert.alert("카메라 권한 필요", "사진을 촬영하려면 카메라 권한이 필요해요.");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.85,
  });

  return result.canceled ? null : (result.assets[0] ?? null);
}

function getNextDefaultChatGalleryImage() {
  const uri =
    DEFAULT_CHAT_GALLERY_IMAGE_URIS[
      defaultGalleryImageIndex % DEFAULT_CHAT_GALLERY_IMAGE_URIS.length
    ];
  defaultGalleryImageIndex += 1;

  return {
    uri,
    width: 512,
    height: 512,
  };
}

async function uploadChatPhotoMessage(chatRoomId: number, uri: string) {
  const image = await normalizeImageForUpload(uri);
  const contentType = image.contentType;
  const fileName = `chat-photo-${Date.now()}.${image.extension}`;
  const uploadFile = await getPhotoUploadFileInfo(image.uri, contentType);

  const presignData = await postChatMediaPresign(chatRoomId, {
    name: fileName,
    type: contentType,
    size: uploadFile.size,
  });

  if (Platform.OS !== "web" && isLocalFileUri(image.uri)) {
    try {
      await uploadChatFileUriToS3(presignData, image.uri, contentType);
      return presignData.mediaRef;
    } catch (nativeUploadError) {
      console.log("[ChatPhoto] native s3 failed", nativeUploadError);
      if (isTerminalS3UploadError(nativeUploadError)) {
        throw nativeUploadError;
      }
    }
  }

  const blob = uploadFile.blob ?? (await getPhotoBlob(image.uri, contentType));
  await uploadChatFileToS3(presignData, blob, contentType);

  return presignData.mediaRef;
}

async function getPhotoUploadFileInfo(uri: string, contentType: string) {
  if (Platform.OS !== "web" && isLocalFileUri(uri)) {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (
      fileInfo.exists &&
      !fileInfo.isDirectory &&
      typeof fileInfo.size === "number" &&
      fileInfo.size > 0
    ) {
      return { size: fileInfo.size, blob: undefined as Blob | undefined };
    }
  }

  const blob = await getPhotoBlob(uri, contentType);
  return { size: blob.size, blob };
}

async function getPhotoBlob(uri: string, contentType: string) {
  const response = await fetch(uri);
  const blob = await response.blob();
  if (blob.size <= 0) {
    throw new Error("첨부할 사진 파일이 비어 있습니다.");
  }

  return blob.type ? blob : new Blob([blob], { type: contentType });
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
    flex: 1,
    minWidth: 0,
    textAlign: "center",
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
