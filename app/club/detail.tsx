import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useClubArchivesInfiniteQuery,
  useClubDetailQuery,
  useClubMeetingsInfiniteQuery,
  useClubPostsInfiniteQuery,
  useJoinClubMutation,
  useLeaveClubMutation,
  useLikeClubMutation,
  useUnlikeClubMutation,
} from "@/hooks/api/useClubs";
import { IClubMeeting } from "@/types/api/clubs/clubsDTO";
import {
  ClubPostCategory,
  IClubPostListItem,
} from "@/types/api/clubs/clubPostsDTO";

const PINK = "#FF3E70";
const BLACK = "#202020";
const GRAY = "#A6AFB6";
const BORDER = "#E9ECED";
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=85&w=1400&auto=format&fit=crop";

type ClubDetailTab = "home" | "board" | "album" | "chat";

const CLUB_TABS: { id: ClubDetailTab; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "board", label: "게시판" },
  { id: "album", label: "사진첩" },
  { id: "chat", label: "채팅" },
];

const BOARD_CATEGORIES: {
  label: string;
  value: ClubPostCategory | "ALL";
}[] = [
  { label: "전체", value: "ALL" },
  { label: "공지", value: "NOTICE" },
  { label: "후기", value: "REVIEW" },
  { label: "가입인사", value: "GREETING" },
  { label: "자유게시판", value: "FREE" },
];

const CATEGORY_LABELS: Record<ClubPostCategory, string> = {
  NOTICE: "공지",
  GREETING: "가입인사",
  REVIEW: "후기",
  FREE: "자유게시판",
};

type BoardPost = {
  id: string;
  apiId?: number;
  author: string;
  time: string;
  category: string;
  content: string;
  likes: number;
  comments: number;
  hasImage: boolean;
  isPinned?: boolean;
};

const BOARD_POSTS: BoardPost[] = [
  {
    id: "post-1",
    apiId: 1,
    author: "등산하는 사람",
    time: "2일전",
    category: "후기",
    content:
      "오늘 아침 등반은 정말 상쾌했어요! 멋진 일출을 보니 힘든 일도 잊혀지네요. 다음 주에 또 만나요!",
    likes: 0,
    comments: 4,
    hasImage: false,
  },
  {
    id: "post-2",
    apiId: 2,
    author: "밤먹는거북이",
    time: "7일전",
    category: "자유게시판",
    content:
      "오늘 운악산 다녀왔는데, 정말 힐링되는 하루였어요! 정상에서 막걸리 한 잔, 캬! 다들 이번 주말에 운악산 어때요?",
    likes: 0,
    comments: 4,
    hasImage: false,
  },
  {
    id: "post-3",
    apiId: 3,
    author: "루시",
    time: "30분전",
    category: "가입인사",
    content:
      "안녕하세요 처음 가입하고 활동 했는데 너무 좋았습니다. 다음에도 또 봐요...",
    likes: 23,
    comments: 1,
    hasImage: true,
  },
  {
    id: "post-4",
    apiId: 4,
    author: "광진구등산",
    time: "3/20",
    category: "자유게시판",
    content:
      "오늘 아침, 구름 사이로 쏟아지는 햇살이 너무 아름다웠어요! 등산 후 먹는 따뜻한 차 맛은 정말 최고! 이번 주말엔...",
    likes: 0,
    comments: 0,
    hasImage: false,
  },
  {
    id: "post-5",
    apiId: 5,
    author: "도봉산모임",
    time: "3/19",
    category: "후기",
    content:
      "지난 토요일 도봉산 등산 모임 정말 즐거웠어요! 함께한 분들 덕분에 힘든...",
    likes: 2,
    comments: 8,
    hasImage: true,
  },
  {
    id: "post-6",
    apiId: 6,
    author: "한강등산클럽",
    time: "1일전",
    category: "가입인사",
    content:
      "안녕하세요! 한강 주변 산책과 등산을 좋아하는 새 회원입니다. 앞으로 종...",
    likes: 0,
    comments: 0,
    hasImage: true,
  },
  {
    id: "post-7",
    apiId: 7,
    author: "관악산사랑",
    time: "5일전",
    category: "자유게시판",
    content:
      "가을 단풍 시즌이 다가오네요. 관악산에서 단풍 구경하며 등산하는 계획 세우는 중인데, 같이 가실 분 있을까요?",
    likes: 3,
    comments: 7,
    hasImage: false,
  },
];

/**
 * 동호회 가입 전 상세 화면입니다.
 * - 상단 소개 영역과 탭 본문을 한 화면에서 확인할 수 있게 목 데이터로 구성합니다.
 * - 하단 가입 CTA는 스크롤과 분리해 항상 화면 아래에 고정합니다.
 */
export default function ClubDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clubId?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const clubId = parseClubId(params.clubId);
  const hasClubId = Number.isFinite(clubId);
  const [activeTab, setActiveTab] = useState<ClubDetailTab>("home");
  const [isFavorite, setFavorite] = useState(false);
  const [isJoinModalVisible, setJoinModalVisible] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [hasTriedJoinSubmit, setTriedJoinSubmit] = useState(false);
  const [isJoined, setJoined] = useState(false);
  const [isLeaveSheetVisible, setLeaveSheetVisible] = useState(false);
  const [isLeaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const clubDetailQuery = useClubDetailQuery(clubId, hasClubId);
  const meetingsQuery = useClubMeetingsInfiniteQuery(clubId, 3, hasClubId);
  const archivesQuery = useClubArchivesInfiniteQuery(clubId, 12, hasClubId);
  const joinClubMutation = useJoinClubMutation(clubId);
  const leaveClubMutation = useLeaveClubMutation(clubId);
  const likeClubMutation = useLikeClubMutation(clubId);
  const unlikeClubMutation = useUnlikeClubMutation(clubId);

  const bottomBarHeight = isJoined
    ? insets.bottom + (activeTab === "board" ? 110 : 24)
    : insets.bottom + 96;
  const albumItemSize = width / 3;
  const trimmedJoinMessage = joinMessage.trim();
  const club = clubDetailQuery.data;
  const meetings =
    meetingsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const archives =
    archivesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const heroImage =
    club?.imageUrls?.[0] ??
    club?.imageUrl ??
    club?.thumbnailImageUrl ??
    HERO_IMAGE;
  const clubTitle = club?.title ?? club?.name ?? "새벽 등산 동호회";
  const categoryText = club?.category ?? "운동 / 스포츠";
  const areaText = club?.area?.name ?? club?.location ?? "서울시 서대문구";
  const hostName = club?.host?.nickname ?? "루씨";
  const memberCount = club?.memberCount ?? club?.currentMemberCount ?? 6;
  const maxMemberCount = club?.maxMemberCount ?? 15;
  const description =
    club?.intro ??
    club?.introduction ??
    club?.description ??
    "해 뜨기 전에 산에 올라 일출 보고 내려옵니다. 평일 새벽이라 부담 없이 운동 삼아 나오시는 분들 많아요. 초보도 환영해요~~😁😁";

  useEffect(() => {
    if (!club) return;

    setFavorite(Boolean(club.isLiked));
    setJoined(Boolean(club.isJoined || club.membershipStatus === "APPROVED"));
  }, [club]);

  const handleFavoritePress = () => {
    const nextFavorite = !isFavorite;

    setFavorite(nextFavorite);
    const mutation = nextFavorite ? likeClubMutation : unlikeClubMutation;
    mutation.mutate(undefined, {
      onError: () => setFavorite(!nextFavorite),
    });
  };

  const handleJoinSubmit = () => {
    if (trimmedJoinMessage.length === 0) {
      setTriedJoinSubmit(true);
      return;
    }

    joinClubMutation.mutate(
      { message: trimmedJoinMessage },
      {
        onSuccess: () => {
          setJoinModalVisible(false);
          setTriedJoinSubmit(false);
          setJoined(true);
          setActiveTab("home");
        },
      },
    );
  };

  const handleLeaveConfirm = () => {
    leaveClubMutation.mutate(undefined, {
      onSuccess: () => {
        setLeaveConfirmVisible(false);
        setJoined(false);
        setActiveTab("home");
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={styles.headerIconButton}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={28} color={BLACK} />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable style={styles.headerIconButton} hitSlop={12}>
            <Ionicons name="share-outline" size={24} color={BLACK} />
          </Pressable>
          <Pressable
            style={styles.headerIconButton}
            onPress={() => {
              if (isJoined) {
                setLeaveSheetVisible(true);
              }
            }}
            hitSlop={12}
          >
            <Ionicons name="ellipsis-vertical" size={23} color={BLACK} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottomBarHeight }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" />

        <View style={styles.summary}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{categoryText}</Text>
          </View>
          <Text style={styles.clubTitle}>{clubTitle}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{areaText}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{hostName}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Ionicons name="person" size={16} color={GRAY} />
            <Text style={styles.memberText}>
              {memberCount}명 참석중 ({memberCount}/{maxMemberCount})
            </Text>
          </View>
        </View>

        <View style={styles.dividerBand} />

        <View style={styles.tabBar}>
          {CLUB_TABS.map((tab) => (
            <Pressable
              key={tab.id}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {isJoined && tab.id === "chat" ? <View style={styles.chatDot} /> : null}
              {activeTab === tab.id ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          ))}
        </View>

        {clubDetailQuery.isLoading ? (
          <View style={styles.statusBox}>
            <ActivityIndicator color={PINK} />
          </View>
        ) : null}
        {activeTab === "home" ? (
          <ClubHomeTab
            description={description}
            isJoined={isJoined}
            meetings={meetings}
          />
        ) : null}
        {activeTab === "board" ? (
          <BoardTab
            clubId={clubId}
            enabled={hasClubId}
            onPostPress={(postId) =>
              router.push({
                pathname: "/club/post-detail",
                params: { postId: String(postId), clubId: String(clubId) },
              } as never)
            }
          />
        ) : null}
        {activeTab === "album" ? (
          <AlbumTab
            archives={archives}
            isLoading={archivesQuery.isLoading}
            itemSize={albumItemSize}
          />
        ) : null}
        {activeTab === "chat" ? (
          isJoined ? (
            <ChatTab bottomPadding={0} />
          ) : (
            <View style={styles.preJoinChatPlaceholder} />
          )
        ) : null}
      </ScrollView>

      {isJoined && activeTab === "board" ? (
        <Pressable
          style={[styles.boardFab, { bottom: insets.bottom + 24 }]}
          onPress={() =>
            router.push({
              pathname: "/club/post-create",
              params: { clubId: String(clubId) },
            } as never)
          }
        >
          <Ionicons name="add" size={38} color="#FFFFFF" />
        </Pressable>
      ) : null}

      {!isJoined ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            hitSlop={10}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={32}
              color={isFavorite ? PINK : "#111111"}
            />
          </Pressable>
          <Pressable
            style={styles.joinButton}
            disabled={joinClubMutation.isPending}
            onPress={() => {
              setTriedJoinSubmit(false);
              setJoinModalVisible(true);
            }}
          >
            <Text style={styles.joinButtonText}>가입</Text>
          </Pressable>
        </View>
      ) : null}

      <JoinRequestModal
        visible={isJoinModalVisible}
        message={joinMessage}
        showMessageRequired={
          hasTriedJoinSubmit && trimmedJoinMessage.length === 0
        }
        bottomPadding={insets.bottom + 32}
        onChangeMessage={(value) => {
          setJoinMessage(value);
          if (value.trim().length > 0) {
            setTriedJoinSubmit(false);
          }
        }}
        onClose={() => {
          setJoinModalVisible(false);
          setTriedJoinSubmit(false);
        }}
        onSubmit={handleJoinSubmit}
      />

      <LeaveActionSheet
        visible={isLeaveSheetVisible}
        onClose={() => setLeaveSheetVisible(false)}
        onPressLeave={() => {
          setLeaveSheetVisible(false);
          setLeaveConfirmVisible(true);
        }}
      />

      <LeaveConfirmModal
        visible={isLeaveConfirmVisible}
        onCancel={() => setLeaveConfirmVisible(false)}
        onConfirm={handleLeaveConfirm}
      />
    </SafeAreaView>
  );
}

function parseClubId(value?: string) {
  if (!value) return 1;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) return numericValue;

  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function ClubHomeTab({
  description,
  isJoined,
  meetings,
}: {
  description: string;
  isJoined: boolean;
  meetings: IClubMeeting[];
}) {
  const firstMeeting = meetings[0];

  return (
    <View style={styles.homeContent}>
      <Text style={styles.descriptionText}>{description}</Text>

      <View style={styles.meetingSection}>
        <Text style={styles.sectionTitle}>정기모임</Text>
        <View style={styles.meetingCard}>
          <View style={styles.meetingTitleRow}>
            <View style={styles.dDayBadge}>
              <Text style={styles.dDayText}>
                {firstMeeting?.startsAt
                  ? formatDday(firstMeeting.startsAt)
                  : "D-4"}
              </Text>
            </View>
            <Text style={styles.meetingTitle}>
              {firstMeeting?.title ?? "매주하는 새벽등산🔥"}
            </Text>
          </View>

          <View style={styles.meetingInfoList}>
            <MeetingInfo
              label="일시"
              value={
                firstMeeting?.dateText ??
                formatDateTime(firstMeeting?.startsAt) ??
                "매주 목요일 저녁 19시"
              }
            />
            <MeetingInfo
              label="위치"
              value={firstMeeting?.location ?? "종로역 1번 출구 앞"}
            />
            <MeetingInfo
              label="비용"
              value={
                firstMeeting?.costText ??
                (typeof firstMeeting?.cost === "number"
                  ? `${firstMeeting.cost.toLocaleString()}원`
                  : "n만원")
              }
            />
          </View>

          <View style={styles.attendeeRow}>
            <View style={styles.attendeeAvatar} />
            <View style={[styles.attendeeAvatar, styles.attendeeOverlap]} />
            <View style={[styles.attendeeAvatar, styles.attendeeOverlap]} />
            <Text style={styles.attendeeText}>
              {firstMeeting?.attendeeCount ?? firstMeeting?.currentAttendeeCount ?? 4}
              명 참석중 (
              {firstMeeting?.attendeeCount ?? firstMeeting?.currentAttendeeCount ?? 4}/
              {firstMeeting?.maxAttendeeCount ?? 8})
            </Text>
          </View>

          {isJoined ? (
            <Pressable style={styles.attendanceButton}>
              <Text style={styles.attendanceButtonText}>참석 현황 확인</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function formatDday(value: string) {
  const target = new Date(value);
  const now = new Date();

  if (Number.isNaN(target.getTime())) {
    return "D-?";
  }

  const diffDays = Math.ceil(
    (target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "D-Day";
  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
}

function formatDateTime(value?: string) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function MeetingInfo({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meetingInfoRow}>
      <Text style={styles.meetingInfoLabel}>{label}</Text>
      <Text style={styles.meetingInfoValue}>{value}</Text>
    </View>
  );
}

function BoardTab({
  clubId,
  enabled,
  onPostPress,
}: {
  clubId: number;
  enabled: boolean;
  onPostPress: (postId: number) => void;
}) {
  const [activeCategory, setActiveCategory] =
    useState<ClubPostCategory | "ALL">("ALL");
  const postsQuery = useClubPostsInfiniteQuery(
    clubId,
    activeCategory,
    20,
    enabled,
  );
  const apiPosts = useMemo(
    () =>
      postsQuery.data?.pages
        .flatMap((page) => page.items)
        .map(mapClubPostItem) ?? [],
    [postsQuery.data],
  );
  const fallbackPosts =
    activeCategory === "ALL"
      ? BOARD_POSTS
      : BOARD_POSTS.filter(
          (post) => post.category === CATEGORY_LABELS[activeCategory],
        );
  const posts = postsQuery.isError && apiPosts.length === 0 ? fallbackPosts : apiPosts;
  const pinnedPosts = posts.filter((post) => post.isPinned);
  const normalPosts = posts.filter((post) => !post.isPinned);

  return (
    <View style={styles.boardContent}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardCategoryList}
      >
        {BOARD_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.value;

          return (
            <Pressable
              key={category.value}
              style={[styles.boardCategoryChip, isActive && styles.boardCategoryChipActive]}
              onPress={() => setActiveCategory(category.value)}
            >
              <Text
                style={[
                  styles.boardCategoryText,
                  isActive && styles.boardCategoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.pinnedList}>
        {(pinnedPosts.length > 0 ? pinnedPosts : normalPosts.slice(0, 2)).map((post) => (
          <PinnedPost key={`pinned-${post.id}`} text={`[필독] ${post.content}`} />
        ))}
      </View>

      <View style={styles.postList}>
        {postsQuery.isLoading && posts.length === 0 ? (
          <View style={styles.statusBox}>
            <ActivityIndicator color={PINK} />
          </View>
        ) : null}
        {normalPosts.map((post) => (
          <BoardPostItem
            key={post.id}
            post={post}
            onPress={() => {
              if (post.apiId) {
                onPostPress(post.apiId);
              }
            }}
          />
        ))}
        {postsQuery.hasNextPage ? (
          <Pressable
            style={styles.moreButton}
            onPress={() => postsQuery.fetchNextPage()}
          >
            <Text style={styles.moreButtonText}>더보기</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function mapClubPostItem(item: IClubPostListItem): BoardPost {
  return {
    id: `post-${item.postId}`,
    apiId: item.postId,
    author: item.author.nickname,
    time: formatRelativeTime(item.createdAt),
    category: CATEGORY_LABELS[item.category],
    content: item.title ? `${item.title}\n${item.content}` : item.content,
    likes: item.likeCount,
    comments: item.commentCount,
    hasImage: Boolean(item.thumbnailImageUrl || item.imageCount),
    isPinned: item.isPinned,
  };
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime())) return "";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일전`;

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function PinnedPost({ text }: { text: string }) {
  return (
    <Pressable style={styles.pinnedPost}>
      <Ionicons name="megaphone-outline" size={20} color="#636970" />
      <Text style={styles.pinnedPostText}>{text}</Text>
    </Pressable>
  );
}

function BoardPostItem({
  post,
  onPress,
}: {
  post: BoardPost;
  onPress: () => void;
}) {
  const hasReactions = post.likes > 0 || post.comments > 0;

  return (
    <Pressable style={styles.boardPost} onPress={onPress}>
      <View style={styles.boardPostTop}>
        <View style={styles.boardAvatar} />
        <View style={styles.boardPostMeta}>
          <Text style={styles.boardAuthor}>{post.author}</Text>
          <Text style={styles.boardMetaText}>
            {post.time} · {post.category}
          </Text>
        </View>
      </View>

      <View style={styles.boardPostBody}>
        <Text
          style={[styles.boardPostText, post.hasImage && styles.boardPostTextWithImage]}
          numberOfLines={post.hasImage ? 3 : 4}
        >
          {post.content}
        </Text>
        {post.hasImage ? <View style={styles.boardPostImage} /> : null}
      </View>

      {hasReactions ? (
        <View style={styles.reactionSummaryRow}>
          <Ionicons name="heart-outline" size={18} color="#A6AFB6" />
          <Text style={styles.reactionSummaryText}>{post.likes}</Text>
          <Ionicons name="chatbubble-outline" size={18} color="#A6AFB6" />
          <Text style={styles.reactionSummaryText}>{post.comments}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function AlbumTab({
  archives,
  isLoading,
  itemSize,
}: {
  archives: { archiveId: number; imageUrl: string }[];
  isLoading: boolean;
  itemSize: number;
}) {
  const hasArchives = archives.length > 0;

  return (
    <View style={styles.albumGrid}>
      {isLoading && !hasArchives ? (
        <View style={styles.statusBox}>
          <ActivityIndicator color={PINK} />
        </View>
      ) : null}
      {hasArchives
        ? archives.map((archive) => (
            <Image
              key={archive.archiveId}
              source={{ uri: archive.imageUrl }}
              style={[
                styles.albumItem,
                {
                  width: itemSize,
                  height: itemSize,
                },
              ]}
              contentFit="cover"
            />
          ))
        : Array.from({ length: 12 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.albumItem,
                {
                  width: itemSize,
                  height: itemSize,
                },
              ]}
            />
          ))}
    </View>
  );
}

type ClubChatMessage = {
  id: string;
  mine?: boolean;
  name?: string;
  time?: string;
  text: string;
};

const INITIAL_CLUB_CHAT_MESSAGES: ClubChatMessage[] = [
  {
    id: "club-chat-1",
    mine: true,
    time: "오후 01:39",
    text: "안녕하세요 새로 가입했어요",
  },
  {
    id: "club-chat-2",
    name: "등산라버",
    time: "오후 03:39",
    text: "네 안녕하세요~~",
  },
  {
    id: "club-chat-3",
    mine: true,
    time: "오후 03:40",
    text: "다들 등산 많이 가시나요?",
  },
  {
    id: "club-chat-4",
    name: "등산등산",
    text: "넵 많이 갑니다",
  },
  {
    id: "club-chat-5",
    time: "오후 07:00",
    text: "관악산 많이가요 ^^",
  },
  {
    id: "club-chat-6",
    name: "dla1203",
    time: "오후 07:01",
    text: "어서오세요!\n처음 오신분들은 공지를 한번씩\n만 확인 부탁드려요",
  },
  {
    id: "club-chat-7",
    mine: true,
    time: "오후 07:40",
    text: "재밌겠네요~~",
  },
];

function formatChatTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "오후" : "오전";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${period} ${String(displayHours).padStart(2, "0")}:${minutes}`;
}

function ChatTab({ bottomPadding }: { bottomPadding: number }) {
  const [messages, setMessages] = useState(INITIAL_CLUB_CHAT_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isAttachmentOpen, setAttachmentOpen] = useState(false);
  const canSend = inputText.trim().length > 0;

  const handleSend = () => {
    const text = inputText.trim();

    if (!text) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: `club-chat-${Date.now()}`,
        mine: true,
        time: formatChatTime(),
        text,
      },
    ]);
    setInputText("");
    setAttachmentOpen(false);
  };

  return (
    <View style={[styles.chatContent, { paddingBottom: bottomPadding }]}>
      <View style={styles.chatDateBlock}>
        <Text style={styles.chatDate}>2026년 5월 2일</Text>
        <Text style={styles.chatNotice}>루시님이 들어왔어요.</Text>
      </View>

      {messages.slice(0, 5).map((message) => (
        <ChatBubble
          key={message.id}
          mine={message.mine}
          name={message.name}
          time={message.time}
          text={message.text}
        />
      ))}

      <Text style={styles.chatEnterNotice}>안녕하세요54님이 들어왔어요.</Text>

      {messages.slice(5).map((message) => (
        <ChatBubble
          key={message.id}
          mine={message.mine}
          name={message.name}
          time={message.time}
          text={message.text}
        />
      ))}

      <View style={styles.chatInputBar}>
        <Pressable
          style={styles.chatIconButton}
          onPress={() => setAttachmentOpen((prevOpen) => !prevOpen)}
          hitSlop={8}
        >
          <Ionicons
            name={isAttachmentOpen ? "close" : "add"}
            size={28}
            color="#8E9AA3"
          />
        </Pressable>
        <TextInput
          style={styles.chatInputBox}
          value={inputText}
          onChangeText={setInputText}
          placeholder="대화 내용을 입력하세요."
          placeholderTextColor="#A6AFB6"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          style={styles.chatIconButton}
          onPress={handleSend}
          hitSlop={8}
        >
          <Ionicons
            name="send"
            size={24}
            color={canSend ? PINK : "#A6AFB6"}
          />
        </Pressable>
      </View>

      {isAttachmentOpen ? (
        <View style={styles.clubChatAttachmentPanel}>
          <ClubChatAttachmentAction iconName="camera" label="카메라" />
          <ClubChatAttachmentAction iconName="image" label="갤러리" />
        </View>
      ) : null}
    </View>
  );
}

function ClubChatAttachmentAction({
  iconName,
  label,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <Pressable style={styles.clubChatAttachmentAction}>
      <View style={styles.clubChatAttachmentIcon}>
        <Ionicons name={iconName} size={24} color="#6F7780" />
      </View>
      <Text style={styles.clubChatAttachmentLabel}>{label}</Text>
    </Pressable>
  );
}

function ChatBubble({
  mine = false,
  name,
  time,
  text,
}: {
  mine?: boolean;
  name?: string;
  time?: string;
  text: string;
}) {
  return (
    <View style={[styles.chatBubbleRow, mine && styles.chatBubbleRowMine]}>
      {!mine && name ? <View style={styles.chatAvatar} /> : null}
      <View style={styles.chatBubbleColumn}>
        {!mine && name ? <Text style={styles.chatName}>{name}</Text> : null}
        <View style={styles.chatMessageLine}>
          {mine && time ? <Text style={styles.chatTime}>{time}</Text> : null}
          <View style={[styles.chatBubble, mine ? styles.myChatBubble : styles.otherChatBubble]}>
            <Text style={[styles.chatBubbleText, mine && styles.myChatBubbleText]}>
              {text}
            </Text>
          </View>
          {!mine && time ? <Text style={styles.chatTime}>{time}</Text> : null}
        </View>
      </View>
    </View>
  );
}

function JoinRequestModal({
  visible,
  message,
  showMessageRequired,
  bottomPadding,
  onChangeMessage,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  message: string;
  showMessageRequired: boolean;
  bottomPadding: number;
  onChangeMessage: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const sheetProgress = useRef(new Animated.Value(1)).current;

  // 모달 배경은 고정하고, 하단 시트만 아래에서 위로 올라오게 분리합니다.
  useEffect(() => {
    if (!visible) return;

    sheetProgress.setValue(1);
    Animated.timing(sheetProgress, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetProgress, visible]);

  const sheetTranslateY = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 420],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheetAnimation,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <Pressable
            style={[styles.joinSheet, { paddingBottom: bottomPadding }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.modalClubCard}>
              <View style={styles.modalClubImage} />
              <View style={styles.modalClubInfo}>
                <Text style={styles.modalClubTitle}>새벽 등산 동호회</Text>
                <Text style={styles.modalClubMeta}>서울시 서대문구 · 운동/스포츠</Text>
              </View>
            </View>

            <View style={styles.messageHeaderRow}>
              <Text style={styles.messageLabel}>가입 메세지</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <Text style={styles.messageDescription}>
              운영자에게 전달 되는 메시지예요.
            </Text>

            <View style={styles.messageInputBox}>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={(value) => onChangeMessage(value.slice(0, 30))}
                placeholder="가입하고 싶은 이유나 간단한 자기소개를 작성해주세요 :)"
                placeholderTextColor="#A6AFB6"
                multiline
                textAlignVertical="top"
                maxLength={30}
              />
              <Text style={styles.messageCount}>{message.length}/30</Text>
            </View>

            {showMessageRequired ? (
              <View style={styles.requiredNotice}>
                <Text style={styles.requiredNoticeText}>
                  가입 메시지를 입력해주세요.
                </Text>
              </View>
            ) : null}

            <Pressable style={styles.requestButton} onPress={onSubmit}>
              <Text style={styles.requestButtonText}>가입 신청하기</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function LeaveActionSheet({
  visible,
  onClose,
  onPressLeave,
}: {
  visible: boolean;
  onClose: () => void;
  onPressLeave: () => void;
}) {
  const sheetProgress = useRef(new Animated.Value(1)).current;

  // 배경은 고정하고 탈퇴 액션 시트만 올라오게 합니다.
  useEffect(() => {
    if (!visible) return;

    sheetProgress.setValue(1);
    Animated.timing(sheetProgress, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetProgress, visible]);

  const sheetTranslateY = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheetAnimation,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <Pressable
            style={styles.leaveSheet}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.sheetHandle} />
            <Pressable style={styles.leaveActionRow} onPress={onPressLeave}>
              <View style={styles.leaveActionIconBox}>
                <Ionicons name="exit-outline" size={28} color="#F03F40" />
              </View>
              <View style={styles.leaveActionTextBox}>
                <Text style={styles.leaveActionTitle}>동호회 탈퇴</Text>
                <Text style={styles.leaveActionDescription}>
                  탈퇴 후 복구가 불가능해요
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={26} color={GRAY} />
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function LeaveConfirmModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.confirmBackdrop}>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>동호회 탈퇴</Text>
          <Text style={styles.confirmDescription}>
            정말 탈퇴하시나요.{"\n"}한번 동호회를 탈퇴하면 재가입이 어려워요.
          </Text>
          <View style={styles.confirmButtonRow}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.leaveConfirmButton} onPress={onConfirm}>
              <Text style={styles.leaveConfirmButtonText}>탈퇴</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 48,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  heroImage: {
    width: "100%",
    height: 264,
    backgroundColor: "#D9DEE1",
  },
  summary: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  categoryChip: {
    alignSelf: "flex-start",
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFB",
  },
  categoryText: {
    color: "#636970",
    fontSize: 11,
    fontWeight: "600",
  },
  clubTitle: {
    marginTop: 14,
    color: BLACK,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  metaText: {
    color: "#636970",
    fontSize: 13,
    fontWeight: "500",
  },
  metaDot: {
    color: "#636970",
    fontSize: 13,
    fontWeight: "500",
  },
  memberText: {
    color: "#8E9AA3",
    fontSize: 13,
    fontWeight: "500",
  },
  dividerBand: {
    height: 8,
    backgroundColor: "#F8FAFB",
  },
  tabBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#FFFFFF",
  },
  tabButton: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    color: GRAY,
    fontSize: 16,
    fontWeight: "700",
  },
  tabTextActive: {
    color: BLACK,
    fontWeight: "800",
  },
  chatDot: {
    position: "absolute",
    top: 15,
    right: 31,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PINK,
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    width: 92,
    height: 2,
    backgroundColor: BLACK,
  },
  homeContent: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },
  descriptionText: {
    color: "#565F66",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 24,
  },
  meetingSection: {
    marginTop: 48,
  },
  sectionTitle: {
    color: BLACK,
    fontSize: 20,
    fontWeight: "800",
  },
  meetingCard: {
    marginTop: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  meetingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dDayBadge: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PINK,
  },
  dDayText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  meetingTitle: {
    flex: 1,
    color: BLACK,
    fontSize: 18,
    fontWeight: "800",
  },
  meetingInfoList: {
    marginTop: 18,
    gap: 7,
  },
  meetingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  meetingInfoLabel: {
    width: 40,
    color: "#6A747C",
    fontSize: 14,
    fontWeight: "700",
  },
  meetingInfoValue: {
    flex: 1,
    color: BLACK,
    fontSize: 14,
    fontWeight: "700",
  },
  attendeeRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  attendeeAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D1D5D8",
  },
  attendeeOverlap: {
    marginLeft: -3,
  },
  attendeeText: {
    marginLeft: 14,
    color: "#8E9AA3",
    fontSize: 13,
    fontWeight: "700",
  },
  attendanceButton: {
    height: 46,
    marginTop: 22,
    borderWidth: 1,
    borderColor: PINK,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  attendanceButtonText: {
    color: PINK,
    fontSize: 15,
    fontWeight: "800",
  },
  boardContent: {
    backgroundColor: "#FFFFFF",
  },
  boardCategoryList: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 18,
    gap: 10,
  },
  boardCategoryChip: {
    height: 32,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  boardCategoryChipActive: {
    backgroundColor: "#E9ECED",
  },
  boardCategoryText: {
    color: BLACK,
    fontSize: 13,
    fontWeight: "700",
  },
  boardCategoryTextActive: {
    color: "#636970",
  },
  pinnedList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  pinnedPost: {
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#D7DEE2",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFB",
  },
  pinnedPostText: {
    color: "#636970",
    fontSize: 14,
    fontWeight: "800",
  },
  postList: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  boardPost: {
    paddingBottom: 20,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  boardPostTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  boardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#D9D9D9",
  },
  boardPostMeta: {
    flex: 1,
    minWidth: 0,
  },
  boardAuthor: {
    color: BLACK,
    fontSize: 13,
    fontWeight: "800",
  },
  boardMetaText: {
    marginTop: 5,
    color: "#A6AFB6",
    fontSize: 12,
    fontWeight: "700",
  },
  boardPostBody: {
    marginTop: 16,
    flexDirection: "row",
    gap: 16,
  },
  boardPostText: {
    flex: 1,
    color: BLACK,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
  },
  boardPostTextWithImage: {
    paddingTop: 3,
  },
  boardPostImage: {
    width: 114,
    height: 114,
    borderRadius: 6,
    backgroundColor: "#D9D9D9",
  },
  reactionSummaryRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  reactionSummaryText: {
    marginRight: 4,
    color: "#636970",
    fontSize: 13,
    fontWeight: "600",
  },
  statusBox: {
    minHeight: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  moreButton: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#E9ECED",
  },
  moreButtonText: {
    color: "#636970",
    fontSize: 14,
    fontWeight: "800",
  },
  boardFab: {
    position: "absolute",
    right: 20,
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PINK,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 7,
  },
  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
  },
  albumItem: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#DDE2E4",
  },
  preJoinChatPlaceholder: {
    minHeight: 240,
    backgroundColor: "#FFFFFF",
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "#FFFFFF",
  },
  chatDateBlock: {
    alignItems: "center",
    marginBottom: 28,
  },
  chatDate: {
    color: "#6A747C",
    fontSize: 16,
    fontWeight: "700",
  },
  chatNotice: {
    marginTop: 12,
    color: "#A6AFB6",
    fontSize: 13,
    fontWeight: "600",
  },
  chatEnterNotice: {
    marginTop: 12,
    marginBottom: 18,
    color: "#A6AFB6",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  chatBubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 18,
  },
  chatBubbleRowMine: {
    justifyContent: "flex-end",
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#D1D5D8",
  },
  chatBubbleColumn: {
    maxWidth: "82%",
  },
  chatName: {
    marginBottom: 6,
    color: BLACK,
    fontSize: 13,
    fontWeight: "800",
  },
  chatMessageLine: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  chatBubble: {
    maxWidth: 250,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 12,
  },
  myChatBubble: {
    backgroundColor: PINK,
  },
  otherChatBubble: {
    backgroundColor: "#E9ECED",
  },
  chatBubbleText: {
    color: BLACK,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  myChatBubbleText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  chatTime: {
    color: "#A6AFB6",
    fontSize: 12,
    fontWeight: "600",
  },
  chatInputBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  chatIconButton: {
    width: 28,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  chatInputBox: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: BLACK,
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: "#F0F2F3",
  },
  clubChatAttachmentPanel: {
    height: 104,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 28,
    paddingTop: 14,
    backgroundColor: "#FFFFFF",
  },
  clubChatAttachmentAction: {
    width: 56,
    alignItems: "center",
  },
  clubChatAttachmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF0F2",
  },
  clubChatAttachmentLabel: {
    color: BLACK,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  favoriteButton: {
    width: 36,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  joinButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PINK,
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheetAnimation: {
    width: "100%",
  },
  joinSheet: {
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    backgroundColor: "#DEE3E5",
  },
  modalClubCard: {
    minHeight: 72,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FAFB",
  },
  modalClubImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#D9D9D9",
  },
  modalClubInfo: {
    flex: 1,
    minWidth: 0,
  },
  modalClubTitle: {
    color: BLACK,
    fontSize: 17,
    fontWeight: "800",
  },
  modalClubMeta: {
    marginTop: 5,
    color: "#636970",
    fontSize: 12,
    fontWeight: "600",
  },
  messageHeaderRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  messageLabel: {
    color: BLACK,
    fontSize: 16,
    fontWeight: "800",
  },
  requiredMark: {
    color: PINK,
    fontSize: 16,
    fontWeight: "800",
  },
  messageDescription: {
    marginTop: 8,
    color: "#8E9AA3",
    fontSize: 14,
    fontWeight: "600",
  },
  messageInputBox: {
    minHeight: 94,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: "#F8FAFB",
  },
  messageInput: {
    minHeight: 48,
    padding: 0,
    color: BLACK,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  messageCount: {
    alignSelf: "flex-end",
    color: "#9BA5AD",
    fontSize: 14,
    fontWeight: "600",
  },
  requiredNotice: {
    minHeight: 34,
    marginTop: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE8EE",
  },
  requiredNoticeText: {
    color: PINK,
    fontSize: 13,
    fontWeight: "800",
  },
  requestButton: {
    height: 56,
    marginTop: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PINK,
  },
  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  leaveSheet: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  leaveActionRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  leaveActionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE8EE",
  },
  leaveActionTextBox: {
    flex: 1,
  },
  leaveActionTitle: {
    color: "#F03F40",
    fontSize: 16,
    fontWeight: "800",
  },
  leaveActionDescription: {
    marginTop: 6,
    color: "#FF7A8D",
    fontSize: 13,
    fontWeight: "700",
  },
  confirmBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 38,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  confirmCard: {
    width: "100%",
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  confirmTitle: {
    color: BLACK,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  confirmDescription: {
    marginTop: 16,
    color: "#636970",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  confirmButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9ECED",
  },
  cancelButtonText: {
    color: "#636970",
    fontSize: 16,
    fontWeight: "800",
  },
  leaveConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F03F40",
  },
  leaveConfirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
