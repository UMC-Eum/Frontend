import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NotificationItem from "@/components/NotificationItem";
import { NotificationListSkeleton } from "@/components/skeletons";
import {
  useNotificationsInfiniteQuery,
  useReadNotificationMutation,
} from "@/hooks/api/useNotifications";
import type { INotification } from "@/types/api/notifications/notificationsDTO";
import { uniqueBy } from "@/utils/array";

const PINK = "#FF4F7E";

type NotificationTab = "heart" | "club";

type NotificationData = {
  id: string;
  apiId?: number;
  isRead: boolean;
  userId: string;
  userName: string;
  userProfileImage?: string;
  notificationContent: string;
  timeLabel?: string;
  timestamp: Date;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<NotificationTab>("heart");
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const heartQuery = useNotificationsInfiniteQuery("heart");
  const clubQuery = useNotificationsInfiniteQuery("chat");
  const readNotificationMutation = useReadNotificationMutation();

  const heartNotifications = useMemo(
    () =>
      mapNotificationPages(heartQuery.data).map((item) => ({
        ...item,
        isRead: item.isRead || readIds.has(item.id),
      })),
    [heartQuery.data, readIds],
  );
  const clubNotifications = useMemo(
    () =>
      mapNotificationPages(clubQuery.data).map((item) => ({
        ...item,
        isRead: item.isRead || readIds.has(item.id),
      })),
    [clubQuery.data, readIds],
  );
  const notifications =
    activeTab === "heart"
      ? heartNotifications
      : clubNotifications;
  const activeQuery = activeTab === "heart" ? heartQuery : clubQuery;
  const hasUnreadHeart = heartNotifications.some((item) => !item.isRead);
  const hasUnreadClub = clubNotifications.some((item) => !item.isRead);
  const isInitialLoading =
    activeQuery.isLoading && notifications.length === 0;
  const isRefreshing =
    activeQuery.isRefetching && !activeQuery.isFetchingNextPage;

  const handleRefresh = useCallback(() => {
    void activeQuery.refetch();
  }, [activeQuery]);

  // 알림 항목을 누르면 화면에 먼저 읽음 처리를 반영하고 서버 상태를 동기화합니다.
  const markNotificationAsRead = (item: NotificationData) => {
    setReadIds((prev) => new Set(prev).add(item.id));
    if (item.apiId) {
      readNotificationMutation.mutate(item.apiId);
    }
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <NotificationItem
      isRead={item.isRead}
      onPress={() => markNotificationAsRead(item)}
      userId={item.userId}
      userName={item.userName}
      userProfileImage={item.userProfileImage}
      notificationContent={item.notificationContent}
      timestamp={item.timestamp}
      timeLabel={item.timeLabel || undefined}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* 알림 페이지 전용 헤더: 이미지처럼 뒤로가기 아이콘과 중앙 제목만 노출합니다. */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={30} color="#A6AFB6" />
        </Pressable>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 마음/동호회 알림을 전환하는 상단 탭입니다. */}
      <View style={styles.tabs}>
        <NotificationTabButton
          label="마음"
          isActive={activeTab === "heart"}
          hasDot={hasUnreadHeart}
          onPress={() => setActiveTab("heart")}
          width={width / 2}
        />
        <NotificationTabButton
          label="동호회"
          isActive={activeTab === "club"}
          hasDot={hasUnreadClub}
          onPress={() => setActiveTab("club")}
          width={width / 2}
        />
      </View>

      {isInitialLoading ? (
        <NotificationListSkeleton />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
              activeQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={PINK}
              colors={[PINK]}
            />
          }
          ListFooterComponent={
            activeQuery.isFetchingNextPage ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={PINK} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons
                name={
                  activeTab === "heart"
                    ? "heart-outline"
                    : "chatbubble-ellipses-outline"
                }
                size={34}
                color="#CBD5E1"
              />
              <Text style={styles.emptyTitle}>
                {activeTab === "heart"
                  ? "아직 마음 알림이 없어요"
                  : "아직 동호회 알림이 없어요"}
              </Text>
              <Text style={styles.emptyText}>
                {activeQuery.isError
                  ? "알림을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
                  : "새로운 알림이 오면 이곳에 표시돼요."}
              </Text>
            </View>
          }
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.emptyListContent,
          ]}
        />
      )}
    </SafeAreaView>
  );
}

function mapNotificationPages(data?: { pages: { items: INotification[] }[] }) {
  return (
    uniqueBy(
      data?.pages.flatMap((page) =>
        page.items.map((item) => ({
          id: String(item.notificationId),
          apiId: item.notificationId,
          isRead: item.isRead,
          userId: String(item.sender?.id ?? item.notificationId),
          userName: item.sender?.nickname ?? "EUM",
          userProfileImage: item.sender?.profileImageUrl ?? undefined,
          notificationContent: item.body || item.title,
          timestamp: new Date(item.createdAt),
        })),
      ) ?? [],
      (item) => item.id,
    )
  );
}

interface NotificationTabButtonProps {
  label: string;
  isActive: boolean;
  hasDot?: boolean;
  onPress: () => void;
  width: number;
}

const NotificationTabButton = ({
  label,
  isActive,
  hasDot = false,
  onPress,
  width,
}: NotificationTabButtonProps) => {
  return (
    <Pressable
      style={[styles.tabButton, { width }]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <View style={styles.tabLabelRow}>
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {label}
        </Text>
        <View style={[styles.newDot, !hasDot && styles.newDotHidden]} />
      </View>
      {isActive ? <View style={styles.activeIndicator} /> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "800",
    color: "#222222",
    textAlign: "center",
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },
  tabs: {
    height: 64,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#FFFFFF",
  },
  tabButton: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
  },
  tabText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#7B828A",
  },
  activeTabText: {
    color: "#222222",
    fontWeight: "800",
  },
  newDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF4F7E",
    marginLeft: 3,
    marginTop: -14,
  },
  newDotHidden: {
    opacity: 0,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    width: "88%",
    height: 2,
    backgroundColor: "#222222",
  },
  listContent: {
    paddingTop: 0,
    paddingBottom: 120,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  footerLoading: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    color: "#222222",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#A6AFB6",
    textAlign: "center",
  },
});
