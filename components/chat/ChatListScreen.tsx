import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActiveUsersSection from "@/components/chat/ActiveUsersSection";
import {
  ChatPreviewListSkeleton,
} from "@/components/skeletons";
import { TAB_SCREEN_BOTTOM_PADDING } from "@/constants/layout";
import { queryKeys } from "@/hooks/api/queryKeys";
import { useChatRoomsInfiniteQuery } from "@/hooks/api/useChats";
import { useNotificationBellBadge } from "@/hooks/useNotificationBellBadge";
import { uniqueBy } from "@/utils/array";
import { readUnreadMessagesInChatRoom } from "@/utils/chatRead";
import { markChatRoomUnreadCountInCache } from "@/utils/chatUnreadCache";

type ChatPreview = {
  id: string;
  name: string;
  location: string;
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
  image?: string;
  isClub?: boolean;
};

type ChatFilter = "dm" | "club";

const CHAT_FILTERS: { id: ChatFilter; label: string }[] = [
  { id: "dm", label: "일반" },
  { id: "club", label: "동호회" },
];

export default function ChatListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasNotificationBadge } = useNotificationBellBadge();
  const [activeFilter, setActiveFilter] = useState<ChatFilter>("dm");
  const chatRoomsQuery = useChatRoomsInfiniteQuery(undefined, {
    staleTime: 30_000,
  });
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = chatRoomsQuery;
  const apiChatPreviews = useMemo(
    () => mapChatRooms(chatRoomsQuery.data),
    [chatRoomsQuery.data],
  );
  const chatPreviews = useMemo(
    () =>
      apiChatPreviews.filter((item) =>
        activeFilter === "club" ? item.isClub : !item.isClub,
      ),
    [activeFilter, apiChatPreviews],
  );
  const isInitialLoading = chatRoomsQuery.isLoading && chatPreviews.length === 0;
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsPullRefreshing(true);
    void chatRoomsQuery.refetch().finally(() => {
      setIsPullRefreshing(false);
    });
  }, [chatRoomsQuery]);

  const isFilterLoading =
    chatRoomsQuery.isFetchingNextPage && chatPreviews.length === 0;

  useFocusEffect(
    useCallback(() => {
      void chatRoomsQuery.refetch();
    }, [chatRoomsQuery]),
  );

  useEffect(() => {
    if (
      isLoading ||
      isFetchingNextPage ||
      !hasNextPage ||
      chatPreviews.length > 0
    ) {
      return;
    }

    fetchNextPage();
  }, [
    chatPreviews.length,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  ]);

  const openChatRoom = (item: ChatPreview) => {
    const chatRoomId = Number(item.id);
    if (Number.isFinite(chatRoomId) && item.unreadCount > 0) {
      void queryClient.cancelQueries({
        queryKey: queryKeys.chats.rooms(30),
        exact: true,
      });
      markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
      void readUnreadMessagesInChatRoom(chatRoomId)
        .catch((error) => {
          console.log("[ChatList] read unread messages error", error);
        })
        .finally(() => {
          markChatRoomUnreadCountInCache(queryClient, chatRoomId, 0);
          queryClient.invalidateQueries({
            queryKey: queryKeys.chats.messages(chatRoomId, 30),
          });
        });
    }

    router.push({
      pathname: "/chat/[id]",
      params: { id: item.id },
    });
  };

  const openNotifications = () => {
    router.push("/notifications" as never);
  };

  const renderChatPreview: ListRenderItem<ChatPreview> = ({ item }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() => openChatRoom(item)}
      accessibilityRole="button"
      accessibilityLabel={
        item.isClub ? `${item.name} 동호회 대화` : `${item.name}님과의 대화`
      }
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.avatarPlaceholder}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
      <View style={styles.chatContent}>
        <View style={styles.chatMetaRow}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.chatInfo} numberOfLines={1}>
            {item.location} · {item.timeLabel}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unreadCount > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>대화</Text>
        <Pressable
          style={styles.notificationButton}
          onPress={openNotifications}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="알림 보기"
        >
          <Ionicons name="notifications-outline" size={23} color="#202020" />
          {hasNotificationBadge ? <View style={styles.notificationBadgeDot} /> : null}
        </Pressable>
      </View>
      <View style={styles.filterTabs}>
        {CHAT_FILTERS.map((filter) => {
          const isActive = filter.id === activeFilter;

          return (
            <Pressable
              key={filter.id}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {activeFilter === "dm" ? <ActiveUsersSection /> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={chatPreviews}
        keyExtractor={(item) => item.id}
        renderItem={renderChatPreview}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FF3E70"
            colors={["#FF3E70"]}
          />
        }
        ListEmptyComponent={
          isInitialLoading || isFilterLoading ? (
            <ChatPreviewListSkeleton />
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={34} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>아직 대화가 없어요</Text>
              <Text style={styles.emptyText}>
                {chatRoomsQuery.isError
                  ? "대화 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
                  : activeFilter === "club"
                    ? "동호회 채팅방이 이곳에 표시돼요."
                    : "매칭된 인연과 대화를 시작하면 이곳에 표시돼요."}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          chatRoomsQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color="#FF3E70" />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (chatRoomsQuery.hasNextPage && !chatRoomsQuery.isFetchingNextPage) {
            chatRoomsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

function mapChatRooms(data?: {
  pages: {
    items: {
      chatRoomId?: number | null;
      type?: string | null;
      peer?: {
        nickname?: string | null;
        profileImageUrl?: string | null;
        areaName?: string | null;
      } | null;
      club?: {
        name?: string | null;
        thumbnailUrl?: string | null;
      } | null;
      memberCount?: number | null;
      lastMessage?: {
        textPreview?: string | null;
        sentAt?: string | null;
      } | null;
      unreadCount?: number | null;
    }[] | null;
  }[];
}): ChatPreview[] {
  return (
    uniqueBy(
      data?.pages.flatMap((page) =>
        (page.items ?? []).flatMap((room) => {
          if (!room?.chatRoomId) return [];
          const isClub = room.type === "CLUB";

          return {
            id: String(room.chatRoomId),
            name: isClub
              ? room.club?.name?.trim() || "동호회 채팅"
              : room.peer?.nickname?.trim() || "이름 없는 사용자",
            location: isClub
              ? `${room.memberCount ?? 0}명 참여중`
              : room.peer?.areaName?.trim() || "지역 정보 없음",
            lastMessage:
              room.lastMessage?.textPreview?.trim() ||
              "새로운 대화를 시작해보세요.",
            timeLabel: formatRelativeTime(room.lastMessage?.sentAt),
            unreadCount: room.unreadCount ?? 0,
            image: isClub
              ? room.club?.thumbnailUrl ?? undefined
              : room.peer?.profileImageUrl ?? undefined,
            isClub,
          };
        }),
      ) ?? [],
      (item) => item.id,
    )
  );
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) return "";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: TAB_SCREEN_BOTTOM_PADDING,
  },
  emptyWrap: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    color: "#202020",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#A6AFB6",
    lineHeight: 20,
    textAlign: "center",
  },
  footerLoading: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    color: "#202020",
  },
  notificationButton: {
    position: "relative",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FF1B4D",
  },
  filterTabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 10,
    padding: 3,
    borderRadius: 8,
    backgroundColor: "#F2F4F6",
  },
  filterTab: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: "#FFFFFF",
  },
  filterTabText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#8E9AA3",
  },
  filterTabTextActive: {
    color: "#202020",
  },
  chatItem: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D9D9D9",
  },
  chatContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  chatMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    minWidth: 0,
  },
  chatName: {
    maxWidth: "45%",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: "#202020",
    marginRight: 8,
  },
  chatInfo: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: "#6F7780",
  },
  lastMessage: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "500",
    color: "#5F6973",
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3E70",
    marginLeft: 10,
  },
  unreadBadgeText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
