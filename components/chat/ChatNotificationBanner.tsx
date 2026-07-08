import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalSearchParams, usePathname, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { connectChatSocket, onMessageNew } from "@/api/chats/chatSocketApi";
import { useChatRoomsInfiniteQuery } from "@/hooks/api/useChats";
import { queryKeys } from "@/hooks/api/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationSettingsStore } from "@/stores/notificationSettingsStore";
import type { MessageNewData } from "@/types/api/socket";
import { readUnreadMessagesInChatRoom } from "@/utils/chatRead";
import { markChatRoomUnreadCountInCache } from "@/utils/chatUnreadCache";

type ChatNotification = {
  chatRoomId: number;
  messageId: number;
  senderUserId: number;
  senderName: string;
  senderProfileImage?: string;
  body: string;
  receivedAt: Date;
};

type ChatRoomPreview = {
  chatRoomId: number;
  unreadCount: number;
  senderName: string;
  senderProfileImage?: string;
  body: string;
  sentAt?: string | null;
};

const DISPLAY_DURATION_MS = 5000;
const CHAT_NOTIFICATION_POLL_MS = 3000;
const RECENT_UNREAD_NOTIFICATION_MS = 15_000;
const COLORS = {
  primary: "#FF3E70",
  primarySoft: "#FFE2EA",
  primarySurface: "#FFF8FA",
  primaryMuted: "#F2DDE3",
  primaryDivider: "#E8C6D0",
  avatarFallback: "#FF7A9A",
  surface: "#FFFFFF",
  text: "#202020",
  textSubtle: "#454B52",
  textMuted: "#A6AFB6",
};

export default function ChatNotificationBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const myUserId = useAuthStore((state) => state.user?.userId);
  const notificationEnabled = useNotificationSettingsStore(
    (state) => state.enabled,
  );
  const [notification, setNotification] = useState<ChatNotification | null>(
    null,
  );
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unreadCountsRef = useRef<Map<number, number> | null>(null);
  // 방별로 마지막으로 배너를 띄운 메시지 시각. 같은 메시지에 대한 폴링 중복 배너를 막는다.
  const lastNotifiedSentAtRef = useRef<Map<number, string>>(new Map());

  const currentChatRoomId = useMemo(() => {
    if (!pathname.startsWith("/chat/")) return null;

    const parsedId = Number(params.id);
    return Number.isFinite(parsedId) ? parsedId : null;
  }, [params.id, pathname]);
  const chatRoomsQuery = useChatRoomsInfiniteQuery(undefined, {
    enabled: notificationEnabled && isAuthInitialized && isAuthenticated,
    staleTime: 0,
    refetchInterval: CHAT_NOTIFICATION_POLL_MS,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!notificationEnabled) {
      setNotification(null);
      unreadCountsRef.current = null;
      lastNotifiedSentAtRef.current.clear();
      return;
    }

    if (!isAuthInitialized || !isAuthenticated) return;

    const socket = connectChatSocket();
    const unsubscribe = onMessageNew((payload) => {
      const nextMessage = getSocketMessageData(payload);
      if (!nextMessage) return;
      if (nextMessage.senderUserId === myUserId) return;
      if (nextMessage.chatRoomId === currentChatRoomId) return;

      setNotification(mapChatNotification(nextMessage));
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    }, socket);

    return unsubscribe;
  }, [
    currentChatRoomId,
    isAuthInitialized,
    isAuthenticated,
    myUserId,
    notificationEnabled,
    queryClient,
  ]);

  useEffect(() => {
    if (!notificationEnabled) return;

    const rooms = mapChatRoomPreviews(chatRoomsQuery.data);
    if (rooms.length === 0) return;

    const previousUnreadCounts = unreadCountsRef.current;
    const nextUnreadCounts = new Map(
      rooms.map((room) => [room.chatRoomId, room.unreadCount]),
    );

    if (!previousUnreadCounts) {
      unreadCountsRef.current = nextUnreadCounts;

      const recentUnreadRoom = rooms.find((room) => {
        if (room.chatRoomId === currentChatRoomId) return false;
        if (room.unreadCount <= 0 || !room.sentAt) return false;

        const sentAt = new Date(room.sentAt).getTime();
        return (
          !Number.isNaN(sentAt) &&
          Date.now() - sentAt <= RECENT_UNREAD_NOTIFICATION_MS
        );
      });

      if (recentUnreadRoom) {
        lastNotifiedSentAtRef.current.set(
          recentUnreadRoom.chatRoomId,
          recentUnreadRoom.sentAt ?? "",
        );
        setNotification(mapChatRoomNotification(recentUnreadRoom));
      }

      return;
    }

    const updatedRoom = rooms.find((room) => {
      if (room.chatRoomId === currentChatRoomId) return false;

      const previousCount = previousUnreadCounts.get(room.chatRoomId) ?? 0;
      return room.unreadCount > previousCount;
    });

    unreadCountsRef.current = nextUnreadCounts;

    if (!updatedRoom) return;

    // 같은 마지막 메시지에 대해서는 폴링 주기마다 배너가 반복해서 뜨지 않도록 dedupe.
    const roomSentAt = updatedRoom.sentAt ?? null;
    if (
      roomSentAt &&
      lastNotifiedSentAtRef.current.get(updatedRoom.chatRoomId) === roomSentAt
    ) {
      return;
    }
    if (roomSentAt) {
      lastNotifiedSentAtRef.current.set(updatedRoom.chatRoomId, roomSentAt);
    }

    setNotification(mapChatRoomNotification(updatedRoom));
  }, [chatRoomsQuery.data, currentChatRoomId, notificationEnabled]);

  // 위로 스와이프해서 배너를 닫기 위한 세로 이동값(0 = 표시, 음수 = 위로 사라짐).
  const translateY = useSharedValue(0);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (!notification) return;

    // 새 알림이 뜰 때마다 위치를 초기화한다.
    translateY.value = 0;

    hideTimerRef.current = setTimeout(() => {
      setNotification(null);
      hideTimerRef.current = null;
    }, DISPLAY_DURATION_MS);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [notification, translateY]);

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          // 위로는 그대로 따라오고, 아래로는 고무줄 저항을 준다.
          translateY.value =
            event.translationY < 0
              ? event.translationY
              : event.translationY / 6;
        })
        .onEnd((event) => {
          if (event.translationY < -40 || event.velocityY < -500) {
            translateY.value = withTiming(-260, { duration: 180 }, () => {
              runOnJS(clearNotification)();
            });
            return;
          }
          translateY.value = withTiming(0, { duration: 160 });
        }),
    [translateY, clearNotification],
  );

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!notification) return null;

  const dismiss = () => setNotification(null);

  const handleRead = async () => {
    const chatRoomId = notification.chatRoomId;
    dismiss();

    // 방 단위 읽음 커서 전진(메시지 단위 읽음 API는 폐지됨).
    await readUnreadMessagesInChatRoom(chatRoomId).catch(() => undefined);

    markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
    queryClient.invalidateQueries({
      queryKey: queryKeys.chats.messages(chatRoomId, 30),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
  };

  const handleReply = () => {
    const chatRoomId = notification.chatRoomId;
    dismiss();
    router.push({
      pathname: "/chat/[id]",
      params: { id: String(chatRoomId) },
    });
  };

  return (
    <GestureHandlerRootView
      style={[styles.container, { paddingTop: insets.top + 8 }]}
      pointerEvents="box-none"
    >
      <GestureDetector gesture={swipeGesture}>
        <Reanimated.View style={[styles.card, cardAnimatedStyle]}>
        <View style={styles.contentRow}>
          {notification.senderProfileImage ? (
            <Image
              source={{ uri: notification.senderProfileImage }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={22} color="#FFFFFF" />
            </View>
          )}

          <View style={styles.messageColumn}>
            <View style={styles.metaRow}>
              <Text style={styles.senderName} numberOfLines={1}>
                {notification.senderName}
              </Text>
              <Text style={styles.timeText}>
                {formatNotificationTime(notification.receivedAt)}
              </Text>
            </View>
            <Text style={styles.bodyText} numberOfLines={1}>
              {notification.body}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionButton}
            onPress={handleRead}
            accessibilityRole="button"
            accessibilityLabel="채팅 알림 읽음 처리"
          >
            <Text style={styles.actionText}>읽음</Text>
          </Pressable>
          <View style={styles.actionDivider} />
          <Pressable
            style={styles.actionButton}
            onPress={handleReply}
            accessibilityRole="button"
            accessibilityLabel="채팅 답장하기"
          >
            <Text style={styles.actionText}>답장</Text>
          </Pressable>
        </View>
        </Reanimated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

function mapChatRoomPreviews(data?: {
  pages: {
    items?: {
      chatRoomId?: number | null;
      type?: string | null;
      peer?: {
        nickname?: string | null;
        profileImageUrl?: string | null;
      } | null;
      club?: {
        name?: string | null;
        thumbnailUrl?: string | null;
      } | null;
      lastMessage?: {
        textPreview?: string | null;
        sentAt?: string | null;
      } | null;
      unreadCount?: number | null;
    }[] | null;
  }[];
}): ChatRoomPreview[] {
  return (
    data?.pages.flatMap((page) =>
      (page.items ?? []).flatMap((room) => {
        if (!room.chatRoomId) return [];
        const isClub = room.type === "CLUB";

        return {
          chatRoomId: room.chatRoomId,
          unreadCount: room.unreadCount ?? 0,
          senderName: isClub
            ? room.club?.name?.trim() || "동호회 채팅"
            : room.peer?.nickname?.trim() || "새로운 인연",
          senderProfileImage: isClub
            ? room.club?.thumbnailUrl ?? undefined
            : room.peer?.profileImageUrl ?? undefined,
          body:
            room.lastMessage?.textPreview?.trim() || "새 메시지가 도착했어요",
          sentAt: room.lastMessage?.sentAt,
        };
      }),
    ) ?? []
  );
}

function mapChatNotification(message: MessageNewData): ChatNotification {
  return {
    chatRoomId: message.chatRoomId,
    messageId: message.messageId,
    senderUserId: message.senderUserId,
    senderName: message.senderName?.trim() || "새로운 인연",
    senderProfileImage: message.senderProfileImage || undefined,
    body: formatMessagePreview(message),
    receivedAt: new Date(message.sentAt),
  };
}

function mapChatRoomNotification(room: ChatRoomPreview): ChatNotification {
  return {
    chatRoomId: room.chatRoomId,
    messageId: 0,
    senderUserId: 0,
    senderName: room.senderName,
    senderProfileImage: room.senderProfileImage,
    body: room.body,
    receivedAt: room.sentAt ? new Date(room.sentAt) : new Date(),
  };
}

function formatMessagePreview(message: MessageNewData) {
  if (message.type === "AUDIO") return "음성 메시지를 보냈어요";
  if (message.type === "PHOTO") return message.text || "사진을 보냈어요";
  if (message.type === "VIDEO") return message.text || "동영상을 보냈어요";
  return message.text?.trim() || "새 메시지가 도착했어요";
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

function formatNotificationTime(date: Date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "오전" : "오후";
  const displayHour = hours % 12 || 12;

  return `${period} ${displayHour}:${minutes}`;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "box-none",
    zIndex: 1000,
    elevation: 1000,
  },
  card: {
    width: "92%",
    maxWidth: 420,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 12,
    overflow: "hidden",
  },
  contentRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primarySoft,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.avatarFallback,
  },
  messageColumn: {
    flex: 1,
    marginLeft: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  senderName: {
    maxWidth: "58%",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  timeText: {
    marginLeft: 7,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  bodyText: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: COLORS.textSubtle,
  },
  actionsRow: {
    height: 46,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryMuted,
    backgroundColor: COLORS.primarySurface,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDivider: {
    width: 1,
    height: 24,
    alignSelf: "center",
    backgroundColor: COLORS.primaryDivider,
  },
  actionText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
});
