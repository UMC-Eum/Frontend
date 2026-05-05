import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatPreview = {
  id: string;
  name: string;
  location: string;
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
};

type ActiveMember = {
  id: string;
  name: string;
  age: number;
  image: string;
};

const CHAT_PREVIEWS: ChatPreview[] = [
  {
    id: "1",
    name: "wldnsj",
    location: "서울시 서대문구",
    lastMessage: "안녕하세요. 저는 어디사는 누구임...",
    timeLabel: "1분전",
    unreadCount: 0,
  },
  {
    id: "2",
    name: "등산하는거북이",
    location: "서울시 관악구",
    lastMessage: "이번주 일상은 어땠나요",
    timeLabel: "5분 전",
    unreadCount: 3,
  },
  {
    id: "3",
    name: "영화고래",
    location: "서울시 도봉구",
    lastMessage: "안녕하세요",
    timeLabel: "30분 전",
    unreadCount: 1,
  },
  {
    id: "4",
    name: "독서여우",
    location: "서울시 관악구",
    lastMessage: "오늘 운동 같이 갈래?",
    timeLabel: "2시간 전",
    unreadCount: 0,
  },
  {
    id: "5",
    name: "요가토끼",
    location: "서울시 관악구",
    lastMessage: "새 프로젝트 관련해서 이야기해줘.",
    timeLabel: "10분 전",
    unreadCount: 7,
  },
  {
    id: "6",
    name: "요가토끼",
    location: "서울시 관악구",
    lastMessage: "새 프로젝트 관련해서 이야기해줘.",
    timeLabel: "10분 전",
    unreadCount: 7,
  },
];

const ACTIVE_MEMBERS: ActiveMember[] = [
  {
    id: "active-1",
    name: "김성욱",
    age: 64,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=240&auto=format&fit=crop",
  },
  {
    id: "active-2",
    name: "김성욱",
    age: 64,
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=240&auto=format&fit=crop",
  },
  {
    id: "active-3",
    name: "김성욱",
    age: 64,
    image:
      "https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=240&auto=format&fit=crop",
  },
  {
    id: "active-4",
    name: "김성욱",
    age: 64,
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=240&auto=format&fit=crop",
  },
];

interface ChatListScreenProps {
  showActiveMembers?: boolean;
}

export default function ChatListScreen({
  showActiveMembers = true,
}: ChatListScreenProps) {
  const router = useRouter();
  const activeMembers = showActiveMembers ? ACTIVE_MEMBERS : [];

  const openChatRoom = (chatId: string) => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId },
    });
  };

  const openNotifications = () => {
    router.push("/(tabs)" as never);
  };

  const renderChatPreview: ListRenderItem<ChatPreview> = ({ item }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() => openChatRoom(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}님과의 대화`}
    >
      <View style={styles.avatarPlaceholder} />
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
        {item.name} · {item.age}
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

      {/* 현재 활동 중인 사람이 있을 때만 상단 콘텐츠를 보여줍니다. */}
      {activeMembers.length > 0 ? (
        <View style={styles.activeSection}>
          <Text style={styles.activeTitle}>현재 활동중인 사람들이에요!</Text>
          <Text style={styles.activeSubtitle}>편하게 소통해봐요!</Text>
          <FlatList
            data={activeMembers}
            keyExtractor={(item) => item.id}
            renderItem={renderActiveMember}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeList}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={CHAT_PREVIEWS}
        keyExtractor={(item) => item.id}
        renderItem={renderChatPreview}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 28,
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
