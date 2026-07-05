import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  connectChatSocket,
  disconnectChatSocket,
  joinChatRoomSocket,
  onMemberJoined,
  onMessageNew,
  sendChatMessageSocket,
} from "@/api/chats/chatSocketApi";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage, { ChatMessageData } from "@/components/chat/ChatMessage";
import { useChatMessagesInfiniteQuery } from "@/hooks/api/useChats";
import { useAuthStore } from "@/stores/authStore";
import { uniqueBy } from "@/utils/array";
import type {
  MemberJoinedData,
  MessageNewData,
  SocketAckResponse,
} from "@/types/api/socket";

const PAGE_SIZE = 30;

// 단체 채팅용 확장 메시지 타입: 발신자 라벨 + 시스템(입장) 메시지 추가
type ClubChatMessage =
  | (ChatMessageData & { senderName?: string })
  | { id: string; type: "system"; text: string };

type Props = {
  chatRoomId: number;
  bottomPadding?: number;
};

/**
 * 동호회(단체) 채팅 탭.
 * 1:1 채팅과 동일한 소켓/REST 인프라를 chatRoomId 기반으로 재사용한다.
 * (room.join 재사용, message.new 수신, member.joined 시스템 메시지 처리)
 */
export default function ClubChatTab({ chatRoomId, bottomPadding = 0 }: Props) {
  const myUserId = useAuthStore((state) => state.user?.userId);
  const hasRoom = Number.isFinite(chatRoomId);
  const messagesQuery = useChatMessagesInfiniteQuery(
    chatRoomId,
    PAGE_SIZE,
    hasRoom,
  );
  const refetchMessages = messagesQuery.refetch;
  const listRef = useRef<FlatList<ClubChatMessage>>(null);
  const [liveMessages, setLiveMessages] = useState<ClubChatMessage[]>([]);
  const [systemMessages, setSystemMessages] = useState<ClubChatMessage[]>([]);
  const [errorText, setErrorText] = useState("");

  const apiMessages = useMemo<ClubChatMessage[]>(
    () => mapApiMessages(messagesQuery.data),
    [messagesQuery.data],
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

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, []);

  // 소켓 연결 + room.join + 실시간 이벤트 구독
  useEffect(() => {
    if (!hasRoom) return;

    const socket = connectChatSocket();
    let isActive = true;

    const joinRoom = () => {
      joinChatRoomSocket({ chatRoomId }, socket)
        .then((response) => {
          if (!isActive) return;
          if (!isSocketSuccess(response)) {
            // CLUB-003: 아직 가입 승인이 안 된 사용자
            setErrorText(
              response.error.code === "CHAT-003"
                ? "가입 승인 후 채팅에 참여할 수 있어요."
                : "채팅방에 입장하지 못했어요.",
            );
            return;
          }
          setErrorText("");
        })
        .catch(() => {
          if (isActive) setErrorText("채팅 서버에 연결하지 못했어요.");
        });
    };

    const handleConnect = () => joinRoom();
    socket.on("connect", handleConnect);
    if (socket.connected) joinRoom();

    const unsubscribeNew = onMessageNew((payload) => {
      if (payload.resultType !== "SUCCESS") return;
      const next = payload.success.data;
      if (next.chatRoomId !== chatRoomId) return;

      setLiveMessages((prev) =>
        appendUnique(prev, mapSocketMessage(next, myUserId)),
      );
      scrollToLatest();
    }, socket);

    const unsubscribeMember = onMemberJoined((payload) => {
      if (payload.resultType !== "SUCCESS") return;
      const joined = payload.success.data;
      if (joined.chatRoomId !== chatRoomId) return;

      setSystemMessages((prev) =>
        appendUnique(prev, mapMemberJoined(joined)),
      );
      scrollToLatest();
    }, socket);

    return () => {
      isActive = false;
      socket.off("connect", handleConnect);
      unsubscribeNew();
      unsubscribeMember();
      disconnectChatSocket();
    };
  }, [chatRoomId, hasRoom, myUserId, scrollToLatest]);

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !hasRoom) return;

    sendChatMessageSocket({ type: "TEXT", chatRoomId, text: trimmed })
      .then((response) => {
        if (isSocketSuccess(response)) {
          // 전송 확정 후 서버 목록과 동기화
          void refetchMessages();
        }
      })
      .catch(() => {
        setErrorText("메시지를 보내지 못했어요.");
      });
  };

  const displayed = useMemo(() => [...messages].reverse(), [messages]);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {errorText ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{errorText}</Text>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={displayed}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClubChatRow message={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
            messagesQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          messagesQuery.isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color="#FF3E70" />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                아직 대화가 없어요. 첫 메시지를 남겨보세요.
              </Text>
            </View>
          )
        }
      />

      <ChatInput onSend={handleSend} />
    </View>
  );
}

function ClubChatRow({ message }: { message: ClubChatMessage }) {
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
      <ChatMessage message={message} />
    </View>
  );
}

function isSocketSuccess<TData>(
  response: SocketAckResponse<TData>,
): response is Extract<SocketAckResponse<TData>, { resultType: "SUCCESS" }> {
  return response.resultType === "SUCCESS";
}

function mapApiMessages(
  data:
    | { pages: { items: ApiMessageItem[] }[] }
    | undefined,
): ClubChatMessage[] {
  return uniqueBy(
    data?.pages.flatMap((page) => page.items) ?? [],
    (item) => item.messageId,
  )
    .sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    )
    .map((item) => toTextMessage(item));
}

type ApiMessageItem = {
  messageId: number;
  type: "TEXT" | "AUDIO" | "PHOTO" | "VIDEO";
  text: string | null;
  mediaUrl: string | null;
  durationSec: number;
  isMine: boolean;
  sentAt: string;
};

function toTextMessage(item: ApiMessageItem): ClubChatMessage {
  return {
    id: `message-${item.messageId}`,
    type: "text",
    text: item.text ?? textForNonText(item.type),
    isMine: item.isMine,
    time: formatTime(item.sentAt),
    sentAt: item.sentAt,
    showTime: true,
  };
}

function mapSocketMessage(
  item: MessageNewData,
  myUserId?: number,
): ClubChatMessage {
  const isMine = myUserId ? item.senderUserId === myUserId : false;
  return {
    id: `message-${item.messageId}`,
    type: "text",
    text: item.text ?? textForNonText(item.type),
    isMine,
    time: formatTime(item.sentAt),
    sentAt: item.sentAt,
    showTime: true,
    avatar: isMine ? undefined : item.senderProfileImage,
    senderName: isMine ? undefined : item.senderName,
  };
}

function mapMemberJoined(item: MemberJoinedData): ClubChatMessage {
  return {
    id: `system-join-${item.userId}-${item.joinedAt}`,
    type: "system",
    text: `${item.nickname}님이 들어왔어요`,
  };
}

function textForNonText(type: ApiMessageItem["type"]) {
  if (type === "AUDIO") return "[음성 메시지]";
  if (type === "PHOTO") return "[사진]";
  if (type === "VIDEO") return "[동영상]";
  return "";
}

function appendUnique(list: ClubChatMessage[], next: ClubChatMessage) {
  if (list.some((message) => message.id === next.id)) return list;
  return [...list, next];
}

function sortByOrder(a: ClubChatMessage, b: ClubChatMessage) {
  return orderKey(a) - orderKey(b);
}

function orderKey(message: ClubChatMessage) {
  if (message.type === "system") {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 320,
    backgroundColor: "#FFFFFF",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
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
