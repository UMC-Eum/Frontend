import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NotificationItem from "@/components/NotificationItem";

type NotificationTab = "heart" | "club";

type NotificationData = {
  id: string;
  isRead: boolean;
  userId: string;
  userName: string;
  userProfileImage: string;
  notificationContent: string;
  timeLabel: string;
  timestamp: Date;
};

const PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop";

const HEART_NOTIFICATIONS: NotificationData[] = [
  {
    id: "heart-1",
    userId: "user-1",
    userName: "OOO",
    userProfileImage: PROFILE_IMAGE,
    notificationContent: "OOO님이 회원님에게 마음을 보냈어요",
    timeLabel: "10분전",
    timestamp: new Date(),
    isRead: false,
  },
  {
    id: "heart-2",
    userId: "user-2",
    userName: "OOO",
    userProfileImage: PROFILE_IMAGE,
    notificationContent: "OOO님이 회원님에게 마음을 보냈어요",
    timeLabel: "11분전",
    timestamp: new Date(),
    isRead: false,
  },
  {
    id: "heart-3",
    userId: "user-3",
    userName: "wlfjddl",
    userProfileImage: PROFILE_IMAGE,
    notificationContent: "wlfjddl님이 회원님에게 마음을 보냈어요",
    timeLabel: "14분전",
    timestamp: new Date(),
    isRead: true,
  },
  {
    id: "heart-4",
    userId: "user-4",
    userName: "OOO",
    userProfileImage: PROFILE_IMAGE,
    notificationContent:
      "OOO님도 회원님에게 마음을 보냈어요💕 서로의 마음이 이어졌어요! 지금 대화를 시작해보세요 🎉",
    timeLabel: "32분전",
    timestamp: new Date(),
    isRead: true,
  },
  {
    id: "heart-5",
    userId: "user-5",
    userName: "OOO",
    userProfileImage: PROFILE_IMAGE,
    notificationContent: "OOO님이 회원님에게 마음을 보냈어요",
    timeLabel: "3시간전",
    timestamp: new Date(),
    isRead: false,
  },
];

const CLUB_NOTIFICATIONS: NotificationData[] = [];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<NotificationTab>("heart");
  const [heartNotifications, setHeartNotifications] =
    useState<NotificationData[]>(HEART_NOTIFICATIONS);
  const [clubNotifications, setClubNotifications] =
    useState<NotificationData[]>(CLUB_NOTIFICATIONS);

  const notifications =
    activeTab === "heart" ? heartNotifications : clubNotifications;
  const hasUnreadHeart = heartNotifications.some((item) => !item.isRead);
  const hasUnreadClub = clubNotifications.some((item) => !item.isRead);

  // 알림 항목을 누르면 현재 탭의 해당 알림만 읽음 상태로 변경합니다.
  const markNotificationAsRead = (notificationId: string) => {
    const updateReadState = (items: NotificationData[]) =>
      items.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      );

    if (activeTab === "heart") {
      setHeartNotifications(updateReadState);
      return;
    }

    setClubNotifications(updateReadState);
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <NotificationItem
      isRead={item.isRead}
      onPress={() => markNotificationAsRead(item.id)}
      userId={item.userId}
      userName={item.userName}
      userProfileImage={item.userProfileImage}
      notificationContent={item.notificationContent}
      timestamp={item.timestamp}
      timeLabel={item.timeLabel}
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

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.emptyListContent,
        ]}
      />
    </SafeAreaView>
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
        {hasDot ? <View style={styles.newDot} /> : null}
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
});
