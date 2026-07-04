import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { KeyboardAvoidingView } from "@/components/KeyboardCompat";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { KEYBOARD_AVOIDING_BEHAVIOR } from "@/constants/keyboard";
import { CLUB_CATEGORY_LABELS } from "@/constants/club";
import {
  useArticleArchiveInfiniteQuery,
  useArticlesInfiniteQuery,
} from "@/hooks/api/useArticles";
import {
  useClubDetailQuery,
  useJoinClubMutation,
  useLeaveClubMutation,
} from "@/hooks/api/useClub";
import { useMeetingsInfiniteQuery } from "@/hooks/api/useMeetings";
import { IArticleListItem } from "@/types/api/articles/articlesDTO";
import { ClubMemberStatus } from "@/types/api/club/clubDTO";
import { ClubPostCategory } from "@/types/api/clubs/clubPostsDTO";
import { IMeetingListItem } from "@/types/api/meetings/meetingsDTO";
<<<<<<< Updated upstream
import type { ApiFailResponse } from "@/types/api/api";
=======
import { uniqueBy } from "@/utils/array";
>>>>>>> Stashed changes

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

/**
 * 동호회 상세 화면입니다.
 * - 상단 소개 영역과 탭 본문(홈/게시판/사진첩/채팅)을 한 화면에서 확인합니다.
 * - 하단 가입 CTA는 스크롤과 분리해 항상 화면 아래에 고정합니다.
 */
export default function ClubDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clubId?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const clubId = parseClubId(params.clubId);
  const [activeTab, setActiveTab] = useState<ClubDetailTab>("home");
  const [isFavorite, setFavorite] = useState(false);
  const [isJoinModalVisible, setJoinModalVisible] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [hasTriedJoinSubmit, setTriedJoinSubmit] = useState(false);
  const [joinStatus, setJoinStatus] = useState<ClubMemberStatus | null>(null);
  const [isLeaveSheetVisible, setLeaveSheetVisible] = useState(false);
  const [isLeaveConfirmVisible, setLeaveConfirmVisible] = useState(false);

  const detailQuery = useClubDetailQuery(clubId);
  const joinMutation = useJoinClubMutation(clubId);
  const leaveMutation = useLeaveClubMutation();
  const meetingsQuery = useMeetingsInfiniteQuery(clubId, { filter: "upcoming" });
  const archivesQuery = useArticleArchiveInfiniteQuery(
    clubId,
    {},
    activeTab === "album",
  );
  const detail = detailQuery.data;

  const isJoined =
    joinStatus === "ACTIVE" || Boolean(detail?.isJoined && joinStatus !== "LEFT");
  const isJoinPending = joinStatus === "PENDING";
  const bottomBarHeight = isJoined
    ? insets.bottom + (activeTab === "board" ? 110 : 24)
    : insets.bottom + 96;
  const albumItemSize = width / 3;
  const trimmedJoinMessage = joinMessage.trim();
  const meetings: IMeetingListItem[] =
    meetingsQuery.data?.pages.flatMap((page) => page.meetings) ?? [];
  const archives =
    archivesQuery.data?.pages.flatMap((page) =>
      page.items.map((item) => ({
        archiveId: item.photoId,
        imageUrl: item.photoUrl,
      })),
    ) ?? [];
  const isHost = detail?.myAuthority === "HOST";
  // ponytail: 상세 API에 이미지/주소 필드가 없어 히어로는 placeholder 유지, 지역 표기는 생략
  const heroImage = HERO_IMAGE;
  const clubTitle = detail?.name ?? "";
  const categoryText = detail
    ? (CLUB_CATEGORY_LABELS[detail.category] ?? detail.category)
    : "";
  const hostName = detail?.host.nickname ?? "";
  const memberCount = detail?.memberCount ?? 0;
  const maxMemberCount = detail?.capacity ?? 0;
  const description = detail?.introText ?? "";

  const handleFavoritePress = () => {
    setFavorite((prev) => !prev);
  };

  const handleJoinSubmit = () => {
    if (trimmedJoinMessage.length === 0) {
      setTriedJoinSubmit(true);
      return;
    }

    joinMutation.mutate(
      { message: trimmedJoinMessage },
      {
        onSuccess: (result) => {
          setJoinModalVisible(false);
          setTriedJoinSubmit(false);
          setJoinStatus(result.status);
          if (result.status === "PENDING") {
            Alert.alert("가입 신청 완료", "운영자 승인 후 활동할 수 있어요.");
          } else {
            setActiveTab("home");
          }
        },
        onError: (error) => {
          Alert.alert(
            "가입 신청 실패",
            getApiErrorMessage(error) ?? "잠시 후 다시 시도해주세요.",
          );
        },
      },
    );
  };

  const handleLeaveConfirm = () => {
    leaveMutation.mutate(clubId, {
      onSuccess: () => {
        setLeaveConfirmVisible(false);
        setJoinStatus("LEFT");
        setActiveTab("home");
      },
      onError: () => {
        Alert.alert("탈퇴 실패", "잠시 후 다시 시도해주세요.");
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

        {activeTab === "home" ? (
          <ClubHomeTab
            description={description}
            isJoined={isJoined}
            isHost={isHost}
            meetings={meetings}
            onPressCreateMeeting={() =>
              router.push({
                pathname: "/meeting-create",
                params: { clubId: String(clubId) },
              } as never)
            }
          />
        ) : null}
        {activeTab === "board" ? (
          <BoardTab
            clubId={clubId}
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
            style={[styles.joinButton, isJoinPending && styles.joinButtonDisabled]}
            disabled={isJoinPending}
            onPress={() => {
              setTriedJoinSubmit(false);
              setJoinModalVisible(true);
            }}
          >
            <Text style={styles.joinButtonText}>
              {isJoinPending ? "가입 대기중" : "가입"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <JoinRequestModal
        visible={isJoinModalVisible}
        clubTitle={clubTitle}
        clubMeta={categoryText}
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
        isSubmitting={leaveMutation.isPending}
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

function getApiErrorMessage(error: unknown) {
  const apiError = error as { response?: { data?: ApiFailResponse } };
  return apiError.response?.data?.error?.message;
}

function ClubHomeTab({
  description,
  isJoined,
  isHost,
  meetings,
  onPressCreateMeeting,
}: {
  description: string;
  isJoined: boolean;
  isHost: boolean;
  meetings: IMeetingListItem[];
  onPressCreateMeeting: () => void;
}) {
  const firstMeeting = meetings[0];

  return (
    <View style={styles.homeContent}>
      <Text style={styles.descriptionText}>{description}</Text>

      <View style={styles.meetingSection}>
        <View style={styles.meetingSectionHeader}>
          <Text style={styles.sectionTitle}>정기모임</Text>
          {isHost ? (
            <Pressable
              style={styles.meetingCreateButton}
              onPress={onPressCreateMeeting}
              hitSlop={8}
            >
              <Ionicons name="add" size={16} color={PINK} />
              <Text style={styles.meetingCreateButtonText}>정기모임 만들기</Text>
            </Pressable>
          ) : null}
        </View>

        {firstMeeting ? (
          <View style={styles.meetingCard}>
            <View style={styles.meetingTitleRow}>
              <View style={styles.dDayBadge}>
                <Text style={styles.dDayText}>{formatDday(firstMeeting.date)}</Text>
              </View>
              <Text style={styles.meetingTitle}>{firstMeeting.name}</Text>
            </View>

            <View style={styles.meetingInfoList}>
              <MeetingInfo
                label="일시"
                value={formatDateTime(firstMeeting.date) ?? "-"}
              />
              <MeetingInfo label="위치" value={firstMeeting.spot} />
              <MeetingInfo label="비용" value={firstMeeting.cost ?? "없음"} />
            </View>

            <View style={styles.attendeeRow}>
              {Array.from({
                length: Math.min(firstMeeting.attendeeCount, 3),
              }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.attendeeAvatar,
                    index > 0 && styles.attendeeOverlap,
                  ]}
                />
              ))}
              <Text style={styles.attendeeText}>
                {firstMeeting.attendeeCount}명 참석중 (
                {firstMeeting.attendeeCount}/{firstMeeting.capacity ?? "-"})
              </Text>
            </View>

            {isJoined ? (
              <Pressable style={styles.attendanceButton}>
                <Text style={styles.attendanceButtonText}>참석 현황 확인</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={[styles.meetingCard, styles.meetingEmptyCard]}>
            <Text style={styles.meetingEmptyText}>
              아직 예정된 정기모임이 없어요.
            </Text>
            {isHost ? (
              <Pressable
                style={styles.meetingEmptyCreateButton}
                onPress={onPressCreateMeeting}
              >
                <Text style={styles.meetingEmptyCreateButtonText}>
                  첫 정기모임 만들기
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
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
  onPostPress,
}: {
  clubId: number;
  onPostPress: (postId: number) => void;
}) {
  const [activeCategory, setActiveCategory] =
    useState<ClubPostCategory | "ALL">("ALL");
  const articlesQuery = useArticlesInfiniteQuery(clubId, {
    category: activeCategory === "ALL" ? undefined : activeCategory,
  });
  const articles = uniqueBy(
    articlesQuery.data?.pages.flatMap((page) => page.articles) ?? [],
    (article) => article.articleId,
  );
  const pinnedArticles = articles.filter((article) => article.isPinned);
  const normalArticles = articles.filter((article) => !article.isPinned);

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

      {pinnedArticles.length > 0 ? (
        <View style={styles.pinnedList}>
          {pinnedArticles.map((article) => (
            <PinnedPost
              key={`pinned-${article.articleId}`}
              text={`[필독] ${article.title ?? article.preview}`}
              onPress={() => onPostPress(article.articleId)}
            />
          ))}
        </View>
      ) : null}

      {articlesQuery.isLoading ? (
        <View style={styles.statusBox}>
          <ActivityIndicator color={PINK} />
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.statusBox}>
          <Text style={styles.emptyStateText}>
            {articlesQuery.isError
              ? "게시글을 불러오지 못했어요. 잠시 후 다시 시도해주세요."
              : "아직 게시글이 없어요."}
          </Text>
        </View>
      ) : (
        <View style={styles.postList}>
          {normalArticles.map((article) => (
            <BoardPostItem
              key={article.articleId}
              article={article}
              onPress={() => onPostPress(article.articleId)}
            />
          ))}
          {articlesQuery.hasNextPage ? (
            <Pressable
              style={styles.moreButton}
              onPress={() => articlesQuery.fetchNextPage()}
              disabled={articlesQuery.isFetchingNextPage}
            >
              {articlesQuery.isFetchingNextPage ? (
                <ActivityIndicator color={PINK} />
              ) : (
                <Text style={styles.moreButtonText}>더보기</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

function PinnedPost({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable style={styles.pinnedPost} onPress={onPress}>
      <Ionicons name="megaphone-outline" size={20} color="#636970" />
      <Text style={styles.pinnedPostText} numberOfLines={1}>
        {text}
      </Text>
    </Pressable>
  );
}

function BoardPostItem({
  article,
  onPress,
}: {
  article: IArticleListItem;
  onPress: () => void;
}) {
  const hasReactions = article.likeCount > 0 || article.commentCount > 0;
  const hasImage = Boolean(article.thumbnailUrl);
  const categoryLabel =
    CATEGORY_LABELS[article.category as ClubPostCategory] ?? article.category;

  return (
    <Pressable style={styles.boardPost} onPress={onPress}>
      <View style={styles.boardPostTop}>
        {article.author.profileImageUrl ? (
          <Image
            source={{ uri: article.author.profileImageUrl }}
            style={styles.boardAvatar}
            contentFit="cover"
          />
        ) : (
          <View style={styles.boardAvatar} />
        )}
        <View style={styles.boardPostMeta}>
          <Text style={styles.boardAuthor}>{article.author.nickname}</Text>
          <Text style={styles.boardMetaText}>
            {formatRelativeTime(article.createdAt)} · {categoryLabel}
          </Text>
        </View>
      </View>

      <View style={styles.boardPostBody}>
        <Text
          style={[styles.boardPostText, hasImage && styles.boardPostTextWithImage]}
          numberOfLines={hasImage ? 3 : 4}
        >
          {article.preview}
        </Text>
        {article.thumbnailUrl ? (
          <Image
            source={{ uri: article.thumbnailUrl }}
            style={styles.boardPostImage}
            contentFit="cover"
          />
        ) : null}
      </View>

      {hasReactions ? (
        <View style={styles.reactionSummaryRow}>
          <Ionicons name="heart-outline" size={18} color="#A6AFB6" />
          <Text style={styles.reactionSummaryText}>{article.likeCount}</Text>
          <Ionicons name="chatbubble-outline" size={18} color="#A6AFB6" />
          <Text style={styles.reactionSummaryText}>{article.commentCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 8) return `${diffDays}일전`;

  return `${date.getMonth() + 1}/${date.getDate()}`;
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

  if (isLoading && !hasArchives) {
    return (
      <View style={styles.statusBox}>
        <ActivityIndicator color={PINK} />
      </View>
    );
  }

  if (!hasArchives) {
    return (
      <View style={styles.statusBox}>
        <Text style={styles.emptyStateText}>아직 등록된 사진이 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.albumGrid}>
      {archives.map((archive) => (
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

// ponytail: 동호회 단체 채팅 API가 아직 없어 화면 안에서만 동작하는 임시 UI로 유지
const INITIAL_CLUB_CHAT_MESSAGES: ClubChatMessage[] = [];

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
      {messages.length === 0 ? (
        <View style={styles.statusBox}>
          <Text style={styles.emptyStateText}>
            아직 대화가 없어요. 첫 메시지를 남겨보세요.
          </Text>
        </View>
      ) : null}

      {messages.map((message) => (
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
  clubTitle,
  clubMeta,
  message,
  showMessageRequired,
  bottomPadding,
  onChangeMessage,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  clubTitle: string;
  clubMeta: string;
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
        <KeyboardAvoidingView
          style={styles.modalKeyboardView}
          behavior={KEYBOARD_AVOIDING_BEHAVIOR}
          pointerEvents="box-none"
        >
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
                  <Text style={styles.modalClubTitle}>{clubTitle}</Text>
                  <Text style={styles.modalClubMeta}>{clubMeta}</Text>
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
        </KeyboardAvoidingView>
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
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  isSubmitting: boolean;
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
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable
              style={styles.leaveConfirmButton}
              onPress={onConfirm}
              disabled={isSubmitting}
            >
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
  meetingSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meetingCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: PINK,
    borderRadius: 14,
  },
  meetingCreateButtonText: {
    color: PINK,
    fontSize: 13,
    fontWeight: "700",
  },
  meetingEmptyCard: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 16,
  },
  meetingEmptyText: {
    color: "#636970",
    fontSize: 14,
    fontWeight: "500",
  },
  meetingEmptyCreateButton: {
    height: 44,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: PINK,
  },
  meetingEmptyCreateButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyStateText: {
    paddingHorizontal: 24,
    color: "#636970",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
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
  joinButtonDisabled: {
    backgroundColor: GRAY,
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
  modalKeyboardView: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
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
