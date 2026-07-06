import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalSearchParams, usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getChatMessages,
  readChatMessage,
} from "@/api/chats/chatsApi";
import { connectChatSocket, onMessageNew } from "@/api/chats/chatSocketApi";
import { useChatRoomsInfiniteQuery } from "@/hooks/api/useChats";
import { queryKeys } from "@/hooks/api/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import type { MessageNewData } from "@/types/api/socket";

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
  const [notification, setNotification] = useState<ChatNotification | null>(
    null,
  );
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unreadCountsRef = useRef<Map<number, number> | null>(null);

  const currentChatRoomId = useMemo(() => {
    if (!pathname.startsWith("/chat/")) return null;

    const parsedId = Number(params.id);
    return Number.isFinite(parsedId) ? parsedId : null;
  }, [params.id, pathname]);
  const chatRoomsQuery = useChatRoomsInfiniteQuery(undefined, {
    enabled: isAuthInitialized && isAuthenticated,
    staleTime: 0,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!isAuthInitialized || !isAuthenticated) return;

    const socket = connectChatSocket();
    const unsubscribe = onMessageNew((payload) => {
      if (payload.resultType !== "SUCCESS") return;

      const nextMessage = payload.success.data;
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
    queryClient,
  ]);

  useEffect(() => {
    const rooms = mapChatRoomPreviews(chatRoomsQuery.data);
    if (rooms.length === 0) return;

    const previousUnreadCounts = unreadCountsRef.current;
    const nextUnreadCounts = new Map(
      rooms.map((room) => [room.chatRoomId, room.unreadCount]),
    );

    if (!previousUnreadCounts) {
      unreadCountsRef.current = nextUnreadCounts;
      return;
    }

    const updatedRoom = rooms.find((room) => {
      if (room.chatRoomId === currentChatRoomId) return false;

      const previousCount = previousUnreadCounts.get(room.chatRoomId) ?? 0;
      return room.unreadCount > previousCount;
    });

    unreadCountsRef.current = nextUnreadCounts;

    if (!updatedRoom) return;

    setNotification({
      chatRoomId: updatedRoom.chatRoomId,
      messageId: 0,
      senderUserId: 0,
      senderName: updatedRoom.senderName,
      senderProfileImage: updatedRoom.senderProfileImage,
      body: updatedRoom.body,
      receivedAt: updatedRoom.sentAt ? new Date(updatedRoom.sentAt) : new Date(),
    });
  }, [chatRoomsQuery.data, currentChatRoomId]);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (!notification) return;

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
  }, [notification]);

  if (!notification) return null;

  const dismiss = () => setNotification(null);

  const handleRead = async () => {
    const chatRoomId = notification.chatRoomId;
    const messageId = notification.messageId;
    dismiss();

    if (messageId > 0) {
      await readChatMessage(messageId).catch(() => undefined);
    } else {
      await readLatestUnreadMessages(chatRoomId).catch(() => undefined);
    }

    queryClient.invalidateQueries({
      queryKey: queryKeys.chats.messages(chatRoomId, 30),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
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
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.card}>
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
      </View>
    </View>
  );
}

function mapChatRoomPreviews(data?: {
  pages: {
    items?: {
      chatRoomId?: number | null;
      peer?: {
        nickname?: string | null;
        profileImageUrl?: string | null;
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

        return {
          chatRoomId: room.chatRoomId,
          unreadCount: room.unreadCount ?? 0,
          senderName: room.peer?.nickname?.trim() || "새로운 인연",
          senderProfileImage: room.peer?.profileImageUrl ?? undefined,
          body:
            room.lastMessage?.textPreview?.trim() || "새 메시지가 도착했어요",
          sentAt: room.lastMessage?.sentAt,
        };
      }),
    ) ?? []
  );
}

async function readLatestUnreadMessages(chatRoomId: number) {
  const messages = await getChatMessages(chatRoomId, { size: 30 });
  const unreadMessageIds = messages.items
    .filter((message) => !message.isMine && !message.readAt)
    .map((message) => message.messageId);

  await Promise.all(
    unreadMessageIds.map((messageId) => readChatMessage(messageId)),
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

function formatMessagePreview(message: MessageNewData) {
  if (message.type === "AUDIO") return "음성 메시지를 보냈어요";
  if (message.type === "PHOTO") return message.text || "사진을 보냈어요";
  if (message.type === "VIDEO") return message.text || "동영상을 보냈어요";
  return message.text?.trim() || "새 메시지가 도착했어요";
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
