import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TAB_SCREEN_BOTTOM_PADDING } from "@/constants/layout";
import { useChatRoomsInfiniteQuery } from "@/hooks/api/useChats";

type ChatPreview = {
  id: string;
  name: string;
  location: string;
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
  image?: string;
};

type ActiveMember = {
  id: string;
  name: string;
  age: number;
  image: string;
};

const ACTIVE_MEMBER_PLACEHOLDERS = Array.from({ length: 4 }, (_, index) =>
  `active-member-placeholder-${index}`,
);

interface ChatListScreenProps {
  showActiveMembers?: boolean;
}

export default function ChatListScreen({
  showActiveMembers = true,
}: ChatListScreenProps) {
  const router = useRouter();
  const chatRoomsQuery = useChatRoomsInfiniteQuery(undefined, {
    staleTime: 0,
    refetchOnMount: "always",
  });
  const apiChatPreviews = useMemo(
    () => mapChatRooms(chatRoomsQuery.data),
    [chatRoomsQuery.data],
  );
  const chatPreviews = apiChatPreviews;
  const activeMembers = showActiveMembers
    ? mapActiveMembers(chatPreviews).slice(0, 8)
    : [];
  const isInitialLoading = chatRoomsQuery.isLoading && chatPreviews.length === 0;
  const shouldShowActiveSection =
    showActiveMembers && (isInitialLoading || activeMembers.length > 0);

  const openChatRoom = (chatId: string) => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId },
    });
  };

  const openNotifications = () => {
    router.push("/notifications" as never);
  };

  const renderChatPreview: ListRenderItem<ChatPreview> = ({ item }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() => openChatRoom(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}님과의 대화`}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.avatarPlaceholder} />
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

  const renderActiveMember: ListRenderItem<ActiveMember> = ({ item }) => (
    <View style={styles.activeMember}>
      <Image source={{ uri: item.image }} style={styles.activeImage} />
      <Text style={styles.activeName} numberOfLines={1}>
        {item.age > 0 ? `${item.name} · ${item.age}` : item.name}
      </Text>
    </View>
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
          <Ionicons name="notifications-outline" size={25} color="#202020" />
        </Pressable>
      </View>

      {/* 첫 응답 전후로 헤더 높이가 튀지 않도록 활동중 섹션 자리를 유지합니다. */}
      {shouldShowActiveSection ? (
        <View style={styles.activeSection}>
          <Text style={styles.activeTitle}>현재 활동중인 사람들이에요!</Text>
          <Text style={styles.activeSubtitle}>편하게 소통해봐요!</Text>
          {isInitialLoading ? (
            <View style={styles.activePlaceholderList}>
              {ACTIVE_MEMBER_PLACEHOLDERS.map((id) => (
                <View key={id} style={styles.activeMember}>
                  <View style={styles.activeImagePlaceholder} />
                  <View style={styles.activeNamePlaceholder} />
                </View>
              ))}
            </View>
          ) : (
            <FlatList
              data={activeMembers}
              keyExtractor={(item) => item.id}
              renderItem={renderActiveMember}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeList}
            />
          )}
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={chatPreviews}
        keyExtractor={(item) => item.id}
        renderItem={renderChatPreview}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isInitialLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#FF3E70" />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={34} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>아직 대화가 없어요</Text>
              <Text style={styles.emptyText}>
                {chatRoomsQuery.isError
                  ? "대화 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
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
      peer?: {
        nickname?: string | null;
        profileImageUrl?: string | null;
        areaName?: string | null;
      } | null;
      lastMessage?: {
        textPreview?: string | null;
        sentAt?: string | null;
      } | null;
      unreadCount?: number | null;
    }[] | null;
  }[];
}): ChatPreview[] {
  return (
    data?.pages.flatMap((page) =>
      (page.items ?? []).flatMap((room) => {
        if (!room?.chatRoomId) return [];

        return {
          id: String(room.chatRoomId),
          name: room.peer?.nickname?.trim() || "이름 없는 사용자",
          location: room.peer?.areaName?.trim() || "지역 정보 없음",
          lastMessage:
            room.lastMessage?.textPreview?.trim() ||
            "새로운 대화를 시작해보세요.",
          timeLabel: formatRelativeTime(room.lastMessage?.sentAt),
          unreadCount: room.unreadCount ?? 0,
          image: room.peer?.profileImageUrl ?? undefined,
        };
      }),
    ) ?? []
  );
}

function mapActiveMembers(items: ChatPreview[]): ActiveMember[] {
  const fromChats = items
    .filter((item) => item.image)
    .map((item) => ({
      id: `active-${item.id}`,
      name: item.name,
      age: 0,
      image: item.image ?? "",
    }));

  return fromChats;
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
  loadingWrap: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
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
    height: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "800",
    color: "#202020",
  },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  activeSection: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  activeTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#202020",
    marginBottom: 6,
  },
  activeSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#6F7780",
    marginBottom: 16,
  },
  activeList: {
    gap: 12,
  },
  activePlaceholderList: {
    flexDirection: "row",
    gap: 12,
  },
  activeMember: {
    width: 86,
  },
  activeImage: {
    width: 86,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
    marginBottom: 8,
  },
  activeName: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#202020",
  },
  activeImagePlaceholder: {
    width: 86,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#EEF1F4",
    marginBottom: 8,
  },
  activeNamePlaceholder: {
    width: 58,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EEF1F4",
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
