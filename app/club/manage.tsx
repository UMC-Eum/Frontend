import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import ClubActionSheet, { type ActionSheetItem } from "@/components/club/ClubActionSheet";
import DeleteClubModal from "@/components/club/DeleteClubModal";
import { IconCalendar, IconPerson, IconTrash, IconWrite } from "@/components/SvgIcons";
import { useMockClubStore } from "@/stores/mockClubStore";

const PINK = "#FC3367";
const BLACK = "#202020";
const GRAY = "#A6AFB6";
const DARK_GRAY = "#636970";
const BORDER = "#E9ECED";
const BG = "#F8FAFB";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=85&w=1400&auto=format&fit=crop";

type HostTab = "home" | "board" | "album" | "chat";

const HOST_TABS: { id: HostTab; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "board", label: "게시판" },
  { id: "album", label: "사진첩" },
  { id: "chat", label: "채팅" },
];

const BOARD_POSTS = [
  {
    id: "1",
    category: "공지",
    title: "[필독] 이번 주 토요일 정기 산행 안내",
    author: "루씨",
    time: "30분전",
    comments: 4,
  },
  {
    id: "2",
    category: "후기",
    title: "오늘 새벽 산행 정말 상쾌했어요",
    author: "박영희",
    time: "2일전",
    comments: 1,
  },
  {
    id: "3",
    category: "가입인사",
    title: "안녕하세요, 새로 가입했습니다",
    author: "김택수",
    time: "5일전",
    comments: 0,
  },
];

const ALBUM_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445307806294-bff7f67ff225?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=500&auto=format&fit=crop",
];

const CHAT_MESSAGES = [
  { id: "1", name: "박영희", text: "이번 주 집결지는 동일한가요?", time: "오전 8:21" },
  { id: "2", name: "루씨", text: "네, 종로역 1번 출구 앞에서 만나요!", time: "오전 8:24" },
  { id: "3", name: "김택수", text: "알겠습니다. 등산화 신고 갈게요.", time: "오전 8:27" },
];

export default function ClubManageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clubId?: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<HostTab>("home");
  const myClubs = useMockClubStore((state) => state.myClubs);
  const club = useMemo(
    () => myClubs.find((item) => item.id === params.clubId) ?? myClubs[0],
    [myClubs, params.clubId],
  );
  const clubId = parseClubId(params.clubId ?? club.id);
  const showFab = activeTab === "home" || activeTab === "board";
  const bottomPadding = insets.bottom + (showFab ? 112 : 32);

  const [settingsSheet, setSettingsSheet] = useState(false);
  const [createSheet, setCreateSheet] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const settingsItems: ActionSheetItem[] = [
    {
      key: "edit",
      renderIcon: () => <IconWrite width={28} height={28} />,
      title: "동호회 정보 수정",
      description: "이름, 소개, 사진, 카테고리 등",
      onPress: () => router.push("/club/manage-settings" as never),
    },
    {
      key: "members",
      renderIcon: () => <IconPerson width={28} height={28} color={DARK_GRAY} />,
      title: "멤버 관리",
      description: "멤버 목록, 가입 신청, 강제 퇴장",
      onPress: () =>
        router.push({
          pathname: "/club/manage-members",
          params: { clubId: String(clubId) },
        } as never),
    },
    {
      key: "delete",
      renderIcon: () => <IconTrash width={28} height={28} />,
      title: "동호회 삭제",
      description: "삭제 후 복구가 불가능해요",
      danger: true,
      onPress: () => setDeleteModal(true),
    },
  ];

  const createItems: ActionSheetItem[] = [
    {
      key: "post",
      renderIcon: () => <IconWrite width={28} height={28} />,
      title: "글쓰기",
      onPress: () => router.push("/club/post-create" as never),
    },
    {
      key: "meeting",
      renderIcon: () => <IconCalendar width={28} height={28} />,
      title: "정기모임 생성",
      description: "매주/매월 반복되는 모임을 만들 수 있어요",
      onPress: () =>
        router.push({
          pathname: "/meeting-create",
          params: { clubId: String(clubId) },
        } as never),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.headerIconButton} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={BLACK} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerIconButton} hitSlop={12}>
            <Ionicons name="share-outline" size={24} color={BLACK} />
          </Pressable>
          <Pressable
            style={styles.headerIconButton}
            onPress={() => setSettingsSheet(true)}
            hitSlop={12}
          >
            <Ionicons name="settings-outline" size={23} color={BLACK} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: club.image || DEFAULT_IMAGE }}
          style={styles.heroImage}
          contentFit="cover"
        />

        <View style={styles.summary}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{club.category}</Text>
          </View>
          <Text style={styles.clubTitle}>🏔️ {club.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{club.area}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>루씨</Text>
            <Text style={styles.metaDot}>·</Text>
            <Ionicons name="person" size={16} color={GRAY} />
            <Text style={styles.memberText}>6명 참석중 (6/15)</Text>
          </View>
        </View>

        <View style={styles.dividerBand} />

        <View style={styles.tabBar}>
          {HOST_TABS.map((tab) => (
            <Pressable
              key={tab.id}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {activeTab === tab.id ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          ))}
        </View>

        {activeTab === "home" ? (
          <HomeTab
            intro={club.intro}
            pendingCount={2}
            onPendingPress={() =>
              router.push({
                pathname: "/club/manage-members",
                params: { clubId: String(clubId) },
              } as never)
            }
          />
        ) : null}
        {activeTab === "board" ? <BoardTab /> : null}
        {activeTab === "album" ? <AlbumTab /> : null}
        {activeTab === "chat" ? <ChatTab /> : null}
      </ScrollView>

      {showFab ? (
        <Pressable
          style={[styles.boardFab, { bottom: insets.bottom + 24 }]}
          onPress={() => setCreateSheet(true)}
        >
          <Ionicons name="add" size={38} color="#FFFFFF" />
        </Pressable>
      ) : null}

      <ClubActionSheet
        visible={settingsSheet}
        items={settingsItems}
        onClose={() => setSettingsSheet(false)}
      />
      <ClubActionSheet
        visible={createSheet}
        items={createItems}
        onClose={() => setCreateSheet(false)}
      />
      <DeleteClubModal
        visible={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onConfirm={() => {
          setDeleteModal(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

function HomeTab({
  intro,
  pendingCount,
  onPendingPress,
}: {
  intro: string;
  pendingCount: number;
  onPendingPress: () => void;
}) {
  return (
    <View style={styles.homeContent}>
      {pendingCount > 0 ? (
        <Pressable style={styles.pendingBanner} onPress={onPendingPress}>
          <Ionicons name="alert-circle-outline" size={22} color={PINK} />
          <View style={styles.pendingTextBox}>
            <Text style={styles.pendingTitle}>가입 대기중인 멤버가 있어요</Text>
            <Text style={styles.pendingSubtitle}>
              {pendingCount}명이 가입 승인을 기다리고 있어요
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={GRAY} />
        </Pressable>
      ) : null}

      <Text style={styles.descriptionText}>{intro}</Text>

      <View style={styles.meetingSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>정기모임</Text>
          <Pressable>
            <Text style={styles.sectionLink}>관리</Text>
          </Pressable>
        </View>
        <View style={styles.meetingCard}>
          <View style={styles.meetingTitleRow}>
            <View style={styles.dDayBadge}>
              <Text style={styles.dDayText}>D-4</Text>
            </View>
            <Text style={styles.meetingTitle}>매주하는 새벽등산🔥</Text>
          </View>
          <MeetingInfo label="일시" value="매주 목요일 저녁 19시" />
          <MeetingInfo label="위치" value="종로역 1번 출구 앞" />
          <MeetingInfo label="비용" value="n만원" />
          <Pressable style={styles.attendanceButton}>
            <Text style={styles.attendanceButtonText}>참석 현황 확인</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function MeetingInfo({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meetingInfoRow}>
      <Text style={styles.meetingInfoLabel}>{label}</Text>
      <Text style={styles.meetingInfoValue}>{value}</Text>
    </View>
  );
}

function BoardTab() {
  return (
    <View style={styles.boardContent}>
      <View style={styles.pinnedPost}>
        <Ionicons name="megaphone-outline" size={20} color={DARK_GRAY} />
        <Text style={styles.pinnedPostText}>[필독] 첫 가입자는 가입인사를 남겨주세요</Text>
      </View>
      {BOARD_POSTS.map((post) => (
        <Pressable key={post.id} style={styles.boardPost}>
          <View style={styles.boardAvatar} />
          <View style={styles.boardPostTextBox}>
            <Text style={styles.boardPostTitle} numberOfLines={1}>
              {post.title}
            </Text>
            <Text style={styles.boardPostMeta}>
              {post.author} · {post.time} · {post.category}
            </Text>
          </View>
          <View style={styles.commentBox}>
            <Ionicons name="chatbubble-outline" size={17} color={GRAY} />
            <Text style={styles.commentText}>{post.comments}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function AlbumTab() {
  return (
    <View style={styles.albumGrid}>
      {ALBUM_IMAGES.map((image) => (
        <Image key={image} source={{ uri: image }} style={styles.albumImage} contentFit="cover" />
      ))}
    </View>
  );
}

function ChatTab() {
  return (
    <View style={styles.chatContent}>
      {CHAT_MESSAGES.map((message) => (
        <View key={message.id} style={styles.chatRow}>
          <View style={styles.chatAvatar} />
          <View style={styles.chatBubble}>
            <View style={styles.chatNameRow}>
              <Text style={styles.chatName}>{message.name}</Text>
              <Text style={styles.chatTime}>{message.time}</Text>
            </View>
            <Text style={styles.chatText}>{message.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function parseClubId(value?: string) {
  if (!value) return 1;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) return numericValue;

  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: { flexDirection: "row", alignItems: "center" },
  scrollView: { flex: 1 },
  heroImage: { width: "100%", height: 298, backgroundColor: "#D9D9D9" },
  summary: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18 },
  categoryChip: {
    height: 26,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: BG,
    justifyContent: "center",
  },
  categoryChipText: { color: DARK_GRAY, fontSize: 13, lineHeight: 18, fontWeight: "500" },
  clubTitle: {
    marginTop: 10,
    color: BLACK,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  metaText: { color: GRAY, fontSize: 14, lineHeight: 20, fontWeight: "500" },
  metaDot: { color: GRAY, fontSize: 14, lineHeight: 20, fontWeight: "500" },
  memberText: { color: GRAY, fontSize: 14, lineHeight: 20, fontWeight: "500" },
  dividerBand: { height: 8, backgroundColor: BG },
  tabBar: {
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F4",
    flexDirection: "row",
  },
  tabButton: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  tabText: {
    color: DARK_GRAY,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    paddingBottom: 13,
  },
  tabTextActive: { color: PINK, fontWeight: "700" },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    width: 42,
    height: 2,
    borderRadius: 1,
    backgroundColor: PINK,
  },
  homeContent: { paddingHorizontal: 20, paddingTop: 20 },
  pendingBanner: {
    marginBottom: 20,
    minHeight: 66,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFC2D1",
    backgroundColor: "#FFF7F9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  pendingTextBox: { flex: 1, gap: 2 },
  pendingTitle: { color: PINK, fontSize: 16, lineHeight: 22, fontWeight: "700" },
  pendingSubtitle: { color: DARK_GRAY, fontSize: 13, lineHeight: 18, fontWeight: "500" },
  descriptionText: { color: BLACK, fontSize: 16, lineHeight: 25, fontWeight: "500" },
  meetingSection: { marginTop: 30 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { color: BLACK, fontSize: 20, lineHeight: 25, fontWeight: "700" },
  sectionLink: { color: PINK, fontSize: 15, lineHeight: 21, fontWeight: "700" },
  meetingCard: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  meetingTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  dDayBadge: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "#FFF1F5",
    alignItems: "center",
    justifyContent: "center",
  },
  dDayText: { color: PINK, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  meetingTitle: {
    flex: 1,
    marginLeft: 8,
    color: BLACK,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },
  meetingInfoRow: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
  },
  meetingInfoLabel: { width: 44, color: GRAY, fontSize: 14, lineHeight: 20 },
  meetingInfoValue: { flex: 1, color: DARK_GRAY, fontSize: 14, lineHeight: 20 },
  attendanceButton: {
    height: 46,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  attendanceButtonText: { color: "#FFFFFF", fontSize: 15, lineHeight: 21, fontWeight: "700" },
  boardContent: { paddingTop: 12 },
  pinnedPost: {
    height: 48,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: BG,
  },
  pinnedPostText: { flex: 1, color: DARK_GRAY, fontSize: 14, lineHeight: 20 },
  boardPost: {
    minHeight: 78,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F4",
    flexDirection: "row",
    alignItems: "center",
  },
  boardAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#D9D9D9" },
  boardPostTextBox: { flex: 1, marginLeft: 12, marginRight: 8 },
  boardPostTitle: { color: BLACK, fontSize: 16, lineHeight: 22, fontWeight: "600" },
  boardPostMeta: { marginTop: 3, color: GRAY, fontSize: 13, lineHeight: 18 },
  commentBox: { flexDirection: "row", alignItems: "center", gap: 3 },
  commentText: { color: GRAY, fontSize: 13, lineHeight: 18 },
  albumGrid: { flexDirection: "row", flexWrap: "wrap" },
  albumImage: { width: "33.3333%", aspectRatio: 1, backgroundColor: "#D9D9D9" },
  chatContent: { paddingHorizontal: 20, paddingTop: 18, gap: 14 },
  chatRow: { flexDirection: "row", alignItems: "flex-start" },
  chatAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#D9D9D9" },
  chatBubble: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 14,
    backgroundColor: BG,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  chatNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  chatName: { color: BLACK, fontSize: 14, lineHeight: 20, fontWeight: "700" },
  chatTime: { color: GRAY, fontSize: 12, lineHeight: 17 },
  chatText: { marginTop: 3, color: DARK_GRAY, fontSize: 14, lineHeight: 20 },
  boardFab: {
    position: "absolute",
    right: 20,
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "#FFA0B4",
    backgroundColor: PINK,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
    elevation: 8,
  },
});
