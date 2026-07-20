import { Ionicons } from "@expo/vector-icons";
import { Image } from "@/components/Image";
import { KeyboardAvoidingView } from "@/components/KeyboardCompat";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Path, type SvgProps } from "react-native-svg";

import ClubActionSheet, { type ActionSheetItem } from "@/components/club/ClubActionSheet";
import { AlbumGridSkeleton, BoardPostListSkeleton } from "@/components/skeletons";
import { CLUB_CATEGORY_LABELS } from "@/constants/club";
import { KEYBOARD_AVOIDING_BEHAVIOR } from "@/constants/keyboard";
import {
  useArticleArchiveInfiniteQuery,
  useArticlesInfiniteQuery,
} from "@/hooks/api/useArticles";
import {
  useCachedClubThumbnail,
  useClubDetailQuery,
  useJoinClubMutation,
  useLeaveClubMutation,
  useMyClubsQuery,
} from "@/hooks/api/useClub";
import {
  useAttendMeetingMutation,
  useMeetingAttendeesInfiniteQuery,
  useMeetingDetailQuery,
  useMeetingsInfiniteQuery,
} from "@/hooks/api/useMeetings";
import {
  useClubMembersInfiniteQuery,
  useDeleteClubMutation,
} from "@/hooks/api/useHost";
import {
  useChatRoomsInfiniteQuery,
  useClubChatRoomQuery,
} from "@/hooks/api/useChats";
import { createClubChatRoom } from "@/api/chats/chatsApi";
import { queryKeys } from "@/hooks/api/queryKeys";
import type { ApiFailResponse } from "@/types/api/api";
import { IArticleListItem } from "@/types/api/articles/articlesDTO";
import {
  ClubMemberStatus,
  IClubUserSummary,
  IClubMeetingSummary,
} from "@/types/api/club/clubDTO";
import { ClubPostCategory } from "@/types/api/clubs/clubPostsDTO";
import { MeetingLoadMoreButton } from "@/components/meeting/MeetingManageParts";
import {
  formatDday,
  formatOccurrenceDate,
} from "@/components/meeting/meetingSchedule";
import {
  IconCalendar,
  IconLocation,
  IconPerson,
  IconTrash,
  IconWallet,
  IconWrite,
} from "@/components/SvgIcons";
import type {
  MeetingAttendanceStatus,
  IMeetingDetailResponse,
  IMeetingListItem,
} from "@/types/api/meetings/meetingsDTO";
import { uniqueBy } from "@/utils/array";
import { ClubViewer, getClubViewer } from "@/utils/clubViewer";
import { shareClub } from "@/utils/shareLinks";
import {
  getClubChatRoomId,
  getClubChatRoomIdFromRooms,
} from "@/utils/clubChat";
import ClubChatTab from "@/components/club/ClubChatTab";

const PINK = "#FF3E70";
const BLACK = "#202020";
const GRAY = "#A6AFB6";
const BORDER = "#E9ECED";
const CHAT_INPUT_DOCK_BOTTOM_PADDING = 10;
const CHAT_INPUT_DOCK_HEIGHT = 140;
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
  { label: "가입인사", value: "CHECKIN" },
  { label: "자유게시판", value: "FREE" },
];

const CATEGORY_LABELS: Record<ClubPostCategory, string> = {
  NOTICE: "공지",
  CHECKIN: "가입인사",
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
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ clubId?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const clubId = parseClubId(params.clubId);
  const [activeTab, setActiveTab] = useState<ClubDetailTab>("home");
  const [isFavorite, setFavorite] = useState(false);
  const [isJoinModalVisible, setJoinModalVisible] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [hasTriedJoinSubmit, setTriedJoinSubmit] = useState(false);
  const [joinStatus, setJoinStatus] = useState<ClubMemberStatus | null>(null);
  const [isLeaveSheetVisible, setLeaveSheetVisible] = useState(false);
  const [isLeaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [isSettingsSheetVisible, setSettingsSheetVisible] = useState(false);
  const [isGuestSheetVisible, setGuestSheetVisible] = useState(false);
  const [isOpeningClubChat, setOpeningClubChat] = useState(false);

  const detailQuery = useClubDetailQuery(clubId);
  // 화면 재진입 시 로컬 joinStatus가 초기화되므로, 내 동호회 목록의 상태(PENDING 등)로 복원한다.
  const myClubsQuery = useMyClubsQuery(true, { includeInactive: true });
  const cachedThumbnail = useCachedClubThumbnail(clubId);
  const joinMutation = useJoinClubMutation(clubId);
  const leaveMutation = useLeaveClubMutation();
  const deleteClubMutation = useDeleteClubMutation();
  const archivesQuery = useArticleArchiveInfiniteQuery(
    clubId,
    {},
    activeTab === "album",
  );
  const detail = detailQuery.data;

  const myClubStatus =
    myClubsQuery.data?.items.find((item) => Number(item.clubId) === clubId)
      ?.status ?? null;
  // 이 화면에서 방금 바꾼 로컬 상태가 서버 목록 캐시보다 우선한다.
  // 단 로컬 PENDING은 예외 — 승인/거절은 서버에서 일어나므로 갱신된 서버 상태가 이긴다.
  // (이게 없으면 refetch로 ACTIVE를 받아와도 화면은 계속 "가입 대기중"으로 남는다.)
  const effectiveJoinStatus =
    joinStatus === "PENDING" && myClubStatus && myClubStatus !== "PENDING"
      ? myClubStatus
      : (joinStatus ?? myClubStatus);
  const isJoined =
    effectiveJoinStatus === "ACTIVE" ||
    Boolean(detail?.isJoined && joinStatus !== "LEFT");
  const isJoinPending = effectiveJoinStatus === "PENDING";

  // 승인은 호스트 기기에서 일어나므로 이 기기 캐시가 갱신되지 않는다.
  // 전역 staleTime이 1시간이라 PENDING 캐시를 계속 쓰게 되므로,
  // 가입 대기 중일 때만 화면 진입/재포커스 시 내 동호회 목록과 상세를 다시 불러온다.
  const refetchMyClubs = myClubsQuery.refetch;
  const refetchDetail = detailQuery.refetch;
  useFocusEffect(
    useCallback(() => {
      if (!isJoinPending) return;
      refetchMyClubs();
      refetchDetail();
    }, [isJoinPending, refetchMyClubs, refetchDetail]),
  );

  const isHost = detail?.myAuthority === "HOST";
  // 게스트/멤버/호스트 역할과 화면 권한을 한 곳에서 계산한다.
  const viewer = getClubViewer({ isJoined, isHost });
  // 단체 채팅방 id: 상세 응답에 있으면 우선 사용하고, 없으면 lazy 입장 API로 가져옵니다.
  const detailClubChatRoomId = getClubChatRoomId(detail);
  const shouldUseClubChat = activeTab === "chat" && viewer.canUseChat;
  const chatRoomsQuery = useChatRoomsInfiniteQuery(30, {
    enabled: viewer.canUseChat,
    staleTime: 15 * 1000,
    refetchOnMount: "always",
  });
  const existingClubChatRoomId = getClubChatRoomIdFromRooms(
    chatRoomsQuery.data,
    clubId,
  );
  const shouldResolveClubChatRoom =
    shouldUseClubChat && !detailClubChatRoomId && !existingClubChatRoomId;
  const clubChatRoomQuery = useClubChatRoomQuery(
    clubId,
    shouldResolveClubChatRoom,
  );
  const clubChatRoomId =
    detailClubChatRoomId ??
    existingClubChatRoomId ??
    clubChatRoomQuery.data?.chatRoomId ??
    null;
  const clubChatUnreadCount =
    chatRoomsQuery.data?.pages
      .flatMap((page) => page.items)
      .find(
        (item) =>
          item.type === "CLUB" && Number(item.club?.clubId) === clubId,
      )?.unreadCount ?? 0;
  const clubChatRoomErrorText = getClubChatRoomErrorText(
    clubChatRoomQuery.error,
  );
  const bottomBarHeight =
    activeTab === "chat"
      ? CHAT_INPUT_DOCK_HEIGHT + 8
      : viewer.isParticipant
        ? insets.bottom + (activeTab === "board" ? 110 : 24)
        : insets.bottom + 96;
  const albumItemSize = width / 3;
  const chatSectionHeight = Math.max(360, Math.min(440, height * 0.42));
  const trimmedJoinMessage = joinMessage.trim();
  const meetings = detail?.meetings ?? [];
  const archives =
    archivesQuery.data?.pages.flatMap((page) =>
      page.items.map((item) => ({
        archiveId: item.photoId,
        imageUrl: item.photoUrl,
      })),
    ) ?? [];
  // ponytail: 서버 썸네일이 없을 때만 placeholder 유지
  // 상세 응답 전에는 목록 캐시의 썸네일을 먼저 보여줘 회색 폴백 깜빡임을 없앤다
  const heroImage = detail?.thumbnailUrl ?? cachedThumbnail ?? HERO_IMAGE;
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
          if (getApiErrorCode(error) === "CLUB-004") {
            setJoinModalVisible(false);
            setTriedJoinSubmit(false);
            setJoinStatus("PENDING");
            Alert.alert("가입 신청", "이미 가입 신청 넣은 동호회입니다!");
            return;
          }

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

  const handleDeleteClub = () => {
    Alert.alert(
      "동호회 삭제",
      "정말 동호회를 삭제하시나요? 삭제 후 복구가 불가능해요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            deleteClubMutation.mutate(clubId, {
              onSuccess: () => {
                router.replace("/(tabs)?tab=club" as never);
              },
              onError: () => {
                Alert.alert("삭제 실패", "잠시 후 다시 시도해주세요.");
              },
            });
          },
        },
      ],
    );
  };

  const handleRetryClubChatRoom = () => {
    void chatRoomsQuery.refetch();
    void clubChatRoomQuery.refetch();
  };

  const handlePressClubTab = async (tabId: ClubDetailTab) => {
    if (tabId !== "chat") {
      setActiveTab(tabId);
      return;
    }

    if (!viewer.canUseChat) {
      setActiveTab("chat");
      return;
    }

    if (clubChatRoomId) {
      router.push(`/chat/${clubChatRoomId}` as never);
      return;
    }

    if (isOpeningClubChat) return;

    setOpeningClubChat(true);

    try {
      const room = await queryClient.fetchQuery({
        queryKey: queryKeys.chats.clubRoom(clubId),
        queryFn: () => createClubChatRoom(clubId),
        staleTime: 5 * 60 * 1000,
      });

      router.push(`/chat/${room.chatRoomId}` as never);
    } catch (error) {
      Alert.alert("채팅방을 열지 못했어요", getClubChatRoomErrorText(error));
    } finally {
      setOpeningClubChat(false);
    }
  };

  const settingsItems: ActionSheetItem[] = [
    {
      key: "edit",
      renderIcon: () => <IconWrite width={28} height={28} />,
      title: "동호회 정보 수정",
      description: "이름, 소개, 사진, 카테고리 등",
      onPress: () =>
        router.push({
          pathname: "/club/manage-settings",
          params: { clubId: String(clubId) },
        } as never),
    },
    {
      key: "members",
      renderIcon: () => <IconPerson width={28} height={28} color="#636970" />,
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
      onPress: handleDeleteClub,
    },
  ];

  // 신고는 가입 여부와 관계없이 누구나 할 수 있어야 한다.
  const reportClubItem: ActionSheetItem = {
    key: "report",
    renderIcon: () => (
      <Ionicons name="alert-circle-outline" size={28} color="#636970" />
    ),
    title: "동호회 신고",
    description: "부적절한 동호회를 신고해요",
    onPress: () =>
      router.push({
        pathname: "/club/report",
        params: { clubId: String(clubId) },
      } as never),
  };

  // 가입 전 게스트용 더보기 메뉴: 아직 관리 권한이 없어 신고만 제공한다.
  const guestSheetItems: ActionSheetItem[] = [reportClubItem];

  // 가입한 일반 멤버용 더보기 메뉴: 신고와 탈퇴를 함께 제공한다.
  const memberSheetItems: ActionSheetItem[] = [
    reportClubItem,
    {
      key: "leave",
      renderIcon: () => (
        <Ionicons name="exit-outline" size={28} color="#F03F40" />
      ),
      title: "동호회 탈퇴",
      description: "탈퇴 후 복구가 불가능해요",
      danger: true,
      onPress: () => setLeaveConfirmVisible(true),
    },
  ];

  const renderTopSection = () => (
    <>
      <Image
        source={{ uri: heroImage }}
        style={styles.heroImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={100}
      />

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
            onPress={() => {
              void handlePressClubTab(tab.id);
            }}
          >
            <View style={styles.tabLabelRow}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {viewer.canUseChat &&
              tab.id === "chat" &&
              clubChatUnreadCount > 0 ? (
                <View style={styles.chatDot} />
              ) : null}
            </View>
            {activeTab === tab.id ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
        ))}
      </View>
    </>
  );

  const renderChatTab = () =>
    viewer.canUseChat ? (
      clubChatRoomId ? (
        <ClubChatTab
          chatRoomId={clubChatRoomId}
          memberCount={memberCount}
          bottomPadding={CHAT_INPUT_DOCK_BOTTOM_PADDING}
          fixedInputDock
          style={[styles.chatTabFill, { height: chatSectionHeight }]}
        />
      ) : clubChatRoomQuery.isLoading || clubChatRoomQuery.isFetching ? (
        <View style={styles.preJoinChatPlaceholder}>
          <ActivityIndicator color={PINK} />
          <Text style={styles.preJoinChatText}>
            채팅방을 불러오는 중이에요.
          </Text>
        </View>
      ) : clubChatRoomQuery.isError ? (
        <Pressable
          style={styles.preJoinChatPlaceholder}
          onPress={handleRetryClubChatRoom}
        >
          <Ionicons name="alert-circle-outline" size={40} color="#C5CDD3" />
          <Text style={styles.preJoinChatText}>{clubChatRoomErrorText}</Text>
          <Text style={styles.preJoinChatRetryText}>다시 시도</Text>
        </Pressable>
      ) : (
        <View style={styles.preJoinChatPlaceholder}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={40}
            color="#C5CDD3"
          />
          <Text style={styles.preJoinChatText}>
            채팅방을 준비하고 있어요.
          </Text>
        </View>
      )
    ) : (
      <View style={styles.preJoinChatPlaceholder}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={40}
          color="#C5CDD3"
        />
        <Text style={styles.preJoinChatText}>
          가입해야 채팅을 볼 수 있어요
        </Text>
      </View>
    );

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
          <Pressable
            style={styles.headerIconButton}
            hitSlop={12}
            onPress={() => void shareClub(clubId, detail?.name)}
          >
            <Ionicons name="share-outline" size={24} color={BLACK} />
          </Pressable>
          {/* 동호회장은 설정(너트), 그 외(가입 전 게스트·일반 멤버)는 더보기(⋮) */}
          <Pressable
            style={styles.headerIconButton}
            onPress={() => {
              if (viewer.isHost) {
                setSettingsSheetVisible(true);
              } else if (viewer.isMember) {
                setLeaveSheetVisible(true);
              } else {
                setGuestSheetVisible(true);
              }
            }}
            hitSlop={12}
          >
            {viewer.showSettingsIcon ? (
              <IconClubSettings width={48} height={48} />
            ) : (
              <Ionicons name="ellipsis-vertical" size={23} color={BLACK} />
            )}
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.scrollView}
        behavior={KEYBOARD_AVOIDING_BEHAVIOR}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: bottomBarHeight }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {renderTopSection()}
          {activeTab === "home" ? (
            <ClubHomeTab
              clubId={clubId}
              description={description}
              viewer={viewer}
              meetings={meetings}
              onPressCreateMeeting={() =>
                router.push({
                  pathname: "/meeting-create",
                  params: { clubId: String(clubId) },
                } as never)
              }
              onPressMeetingManage={(meetingId) =>
                router.push({
                  pathname: "/meeting-manage",
                  params: {
                    clubId: String(clubId),
                    meetingId: String(meetingId),
                  },
                } as never)
              }
              onPressPendingMembers={() =>
                router.push({
                  pathname: "/club/manage-members",
                  params: { clubId: String(clubId) },
                } as never)
              }
            />
          ) : null}
          {activeTab === "board" ? (
            viewer.isParticipant ? (
              <BoardTab
                clubId={clubId}
                onPostPress={(postId) =>
                  router.push({
                    pathname: "/club/post-detail",
                    params: {
                      postId: String(postId),
                      clubId: String(clubId),
                      canPin: String(viewer.isHost),
                    },
                  } as never)
                }
              />
            ) : (
              <ClubLockedTab icon="document-text-outline" label="게시판" />
            )
          ) : null}
          {activeTab === "album" ? (
            viewer.isParticipant ? (
              <AlbumTab
                archives={archives}
                isLoading={archivesQuery.isLoading}
                itemSize={albumItemSize}
              />
            ) : (
              <ClubLockedTab icon="images-outline" label="사진첩" />
            )
          ) : null}
          {activeTab === "chat" ? renderChatTab() : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {viewer.canWritePost && activeTab === "board" ? (
        <Pressable
          style={[styles.boardFab, { bottom: insets.bottom + 24 }]}
          onPress={() =>
            router.push({
              pathname: "/club/post-create",
              params: { clubId: String(clubId), canPin: String(viewer.isHost) },
            } as never)
          }
        >
          <Ionicons name="add" size={38} color="#FFFFFF" />
        </Pressable>
      ) : null}

      {viewer.showJoinCta ? (
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
            style={[
              styles.joinButton,
              isJoinPending && styles.joinButtonDisabled,
            ]}
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
        clubImageUri={heroImage}
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

      <ClubActionSheet
        visible={isLeaveSheetVisible}
        items={memberSheetItems}
        onClose={() => setLeaveSheetVisible(false)}
      />

      <LeaveConfirmModal
        visible={isLeaveConfirmVisible}
        isSubmitting={leaveMutation.isPending}
        onCancel={() => setLeaveConfirmVisible(false)}
        onConfirm={handleLeaveConfirm}
      />

      <ClubActionSheet
        visible={isSettingsSheetVisible}
        items={settingsItems}
        onClose={() => setSettingsSheetVisible(false)}
      />

      <ClubActionSheet
        visible={isGuestSheetVisible}
        items={guestSheetItems}
        onClose={() => setGuestSheetVisible(false)}
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

function IconClubSettings(props: SvgProps) {
  const color = props.color ?? BLACK;

  return (
    <Svg width={48} height={48} viewBox="0 0 48 48" fill="none" {...props}>
      <Path
        d="M32.3499 20.9229L31.9837 20.7192C31.9269 20.6876 31.8989 20.6717 31.8714 20.6552C31.5983 20.4917 31.3682 20.2656 31.2002 19.9952C31.1833 19.968 31.1674 19.9395 31.1348 19.8831C31.1023 19.8268 31.0858 19.7982 31.0706 19.77C30.92 19.4887 30.8385 19.1752 30.8336 18.8561C30.8331 18.824 30.8332 18.7912 30.8343 18.726L30.8415 18.3008C30.8529 17.6203 30.8587 17.2789 30.763 16.9726C30.6781 16.7005 30.536 16.4499 30.3462 16.2373C30.1317 15.9969 29.8347 15.8253 29.2402 15.4828L28.7464 15.1982C28.1536 14.8566 27.8571 14.6857 27.5423 14.6206C27.2639 14.5629 26.9765 14.5656 26.6991 14.6279C26.3859 14.6982 26.0931 14.8735 25.5079 15.224L25.5045 15.2255L25.1507 15.4374C25.0948 15.4709 25.0665 15.4878 25.0384 15.5034C24.7601 15.6581 24.4495 15.7437 24.1312 15.7539C24.0992 15.7549 24.0665 15.7549 24.0013 15.7549C23.9365 15.7549 23.9024 15.7549 23.8704 15.7539C23.5515 15.7436 23.2402 15.6576 22.9615 15.5022C22.9334 15.4866 22.9056 15.4696 22.8496 15.4359L22.4935 15.2221C21.9042 14.8684 21.6091 14.6912 21.2943 14.6206C21.0157 14.5581 20.7274 14.5563 20.4479 14.6147C20.1324 14.6806 19.8358 14.8528 19.2426 15.197L19.2399 15.1982L18.7523 15.4812L18.7469 15.4845C18.159 15.8257 17.8644 15.9967 17.6517 16.2361C17.4629 16.4486 17.3218 16.6988 17.2374 16.9702C17.1419 17.2769 17.147 17.619 17.1585 18.3027L17.1657 18.7274C17.1668 18.7917 17.1686 18.8236 17.1682 18.8552C17.1634 19.175 17.0809 19.4891 16.9297 19.771C16.9148 19.7988 16.8987 19.8267 16.8665 19.8824C16.8344 19.9381 16.8188 19.9658 16.8021 19.9927C16.6334 20.2645 16.4021 20.4919 16.1273 20.6557C16.1001 20.6719 16.0715 20.6875 16.0152 20.7187L15.6536 20.9191C15.0521 21.2524 14.7514 21.4193 14.5326 21.6567C14.339 21.8667 14.1928 22.1158 14.1035 22.3872C14.0026 22.6939 14.0027 23.0378 14.0042 23.7255L14.0055 24.2877C14.0071 24.9708 14.0092 25.3122 14.1103 25.6168C14.1998 25.8863 14.3449 26.134 14.5374 26.3427C14.755 26.5787 15.0527 26.7445 15.6497 27.0766L16.0081 27.276C16.0691 27.3099 16.0998 27.3266 16.1292 27.3444C16.4015 27.5083 16.6309 27.735 16.7982 28.0053C16.8163 28.0345 16.8336 28.0648 16.8683 28.1255C16.9026 28.1853 16.9201 28.2152 16.9359 28.2452C17.0826 28.5229 17.1611 28.8315 17.1665 29.1455C17.1671 29.1794 17.1666 29.2137 17.1654 29.2827L17.1585 29.6902C17.147 30.3763 17.1419 30.7197 17.2379 31.0273C17.3229 31.2994 17.4648 31.55 17.6546 31.7627C17.8692 32.0031 18.1666 32.1745 18.7611 32.5171L19.2548 32.8015C19.8476 33.1432 20.1439 33.3138 20.4587 33.379C20.7371 33.4366 21.0246 33.4344 21.3021 33.3721C21.6157 33.3017 21.9095 33.1258 22.4964 32.7743L22.8502 32.5625C22.9062 32.5289 22.9346 32.5121 22.9626 32.4965C23.2409 32.3418 23.5512 32.2558 23.8695 32.2456C23.9015 32.2446 23.9342 32.2446 23.9994 32.2446C24.0648 32.2446 24.0974 32.2446 24.1295 32.2456C24.4484 32.2559 24.7607 32.3422 25.0394 32.4975C25.0639 32.5112 25.0885 32.526 25.1316 32.5519L25.5078 32.7777C26.0971 33.1315 26.3916 33.3081 26.7065 33.3788C26.985 33.4413 27.2736 33.4438 27.5531 33.3855C27.8685 33.3196 28.1657 33.1471 28.7586 32.803L29.2536 32.5157C29.8418 32.1743 30.1367 32.0031 30.3495 31.7636C30.5383 31.5512 30.6796 31.3011 30.764 31.0297C30.8588 30.7252 30.8531 30.3858 30.8417 29.7119L30.8343 29.2724C30.8332 29.2081 30.8331 29.1761 30.8336 29.1445C30.8383 28.8247 30.9195 28.5104 31.0706 28.2286C31.0856 28.2007 31.1018 28.1726 31.1338 28.1171C31.166 28.0615 31.1827 28.0337 31.1994 28.0068C31.3681 27.7349 31.5995 27.5074 31.8744 27.3435C31.9012 27.3275 31.9289 27.3122 31.9838 27.2818L31.9857 27.2809L32.3472 27.0805C32.9488 26.7472 33.2501 26.5801 33.4689 26.3427C33.6625 26.1327 33.8085 25.8839 33.8978 25.6126C33.9981 25.3077 33.9973 24.9658 33.9958 24.2861L33.9945 23.7119C33.9929 23.0287 33.9921 22.6874 33.891 22.3828C33.8015 22.1133 33.6555 21.8656 33.463 21.6568C33.2457 21.4211 32.9475 21.2553 32.3517 20.9238L32.3499 20.9229Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.0003 24C20.0003 26.2091 21.7912 28 24.0003 28C26.2095 28 28.0003 26.2091 28.0003 24C28.0003 21.7908 26.2095 20 24.0003 20C21.7912 20 20.0003 21.7908 20.0003 24Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function getApiErrorMessage(error: unknown) {
  if (!error) return undefined;

  const apiError = error as { response?: { data?: ApiFailResponse } };
  return apiError.response?.data?.error?.message;
}

function getApiErrorCode(error: unknown) {
  if (!error) return undefined;

  const apiError = error as { response?: { data?: ApiFailResponse } };
  return apiError.response?.data?.error?.code;
}

function getApiErrorStatus(error: unknown) {
  if (!error) return undefined;

  const apiError = error as { response?: { status?: number } };
  return apiError.response?.status;
}

function getClubChatRoomErrorText(error: unknown) {
  const status = getApiErrorStatus(error);
  const code = getApiErrorCode(error);
  const message = getApiErrorMessage(error);

  if (__DEV__ && error) {
    console.log("[ClubChat] room enter error", { status, code, message });
  }

  if (code === "CLUB_FORBIDDEN_NOT_MEMBER" || status === 403) {
    return "가입 승인 후 채팅에 참여할 수 있어요.";
  }

  if (code === "SYS-001" && message?.includes("Cannot POST")) {
    return "서버에 동호회 채팅방 API가 아직 배포되지 않았어요.";
  }

  if (code === "CLUB_NOT_FOUND") {
    return "동호회를 찾을 수 없어요.";
  }

  if (status === 404) {
    return "서버에서 동호회 채팅방을 찾지 못했어요.";
  }

  if (status && status >= 500) {
    return "서버에서 채팅방을 준비하지 못했어요.";
  }

  return message || "채팅방을 열지 못했어요.";
}

function ClubHomeTab({
  clubId,
  description,
  viewer,
  meetings,
  onPressCreateMeeting,
  onPressMeetingManage,
  onPressPendingMembers,
}: {
  clubId: number;
  description: string;
  viewer: ClubViewer;
  meetings: IClubMeetingSummary[];
  onPressCreateMeeting: () => void;
  onPressMeetingManage: (meetingId: number) => void;
  onPressPendingMembers: () => void;
}) {
  // 정기모임 카드는 전용 모임 목록 API를 우선 사용하고, 상세 응답의 요약(meetings)으로 보완한다.
  // 상세 응답의 meetings가 비어 오는 경우에도 목록 API 결과로 카드가 표시된다.
  const meetingsListQuery = useMeetingsInfiniteQuery(
    clubId,
    {},
    Number.isFinite(clubId),
  );
  const meetingListItems = useMemo(
    () => meetingsListQuery.data?.pages.flatMap((page) => page.meetings) ?? [],
    [meetingsListQuery.data],
  );

  const meetingCardItems = buildMeetingCardItems(meetingListItems, meetings);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(
    null,
  );
  const [isMeetingSheetVisible, setMeetingSheetVisible] = useState(false);
  // 호스트에게만 가입 대기중인 멤버 배너를 노출한다.
  const pendingMembersQuery = useClubMembersInfiniteQuery(
    clubId,
    { status: "PENDING", limit: 20 },
    viewer.showPendingMemberBanner,
  );
  const pendingMemberCount =
    pendingMembersQuery.data?.pages.reduce(
      (total, page) => total + (page.members?.length ?? 0),
      0,
    ) ?? 0;
  const meetingDetailQuery = useMeetingDetailQuery(
    clubId,
    selectedMeetingId ?? 0,
    isMeetingSheetVisible && !!selectedMeetingId,
  );
  const selectedMeeting =
    meetingDetailQuery.data ??
    meetingCardItems.find((meeting) => meeting.meetingId === selectedMeetingId);
  const selectedMeetingDdayText = getMeetingCardDdayText(selectedMeeting);

  return (
    <View style={styles.homeContent}>
      {pendingMemberCount > 0 ? (
        <Pressable
          style={styles.pendingBanner}
          onPress={onPressPendingMembers}
        >
          <Ionicons name="alert-circle-outline" size={24} color={PINK} />
          <View style={styles.pendingBannerTextBox}>
            <Text style={styles.pendingBannerTitle}>
              가입 대기중인 멤버가 있어요
            </Text>
            <Text style={styles.pendingBannerSubtitle}>
              {pendingMemberCount}명이 가입 승인을 기다리고 있어요.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#8E9AA3" />
        </Pressable>
      ) : null}

      <Text style={styles.descriptionText}>{description}</Text>

      <View style={styles.meetingSection}>
        <View style={styles.meetingSectionHeader}>
          <Text style={styles.sectionTitle}>정기모임</Text>
          {viewer.canCreateMeeting ? (
            <Pressable
              style={styles.meetingCreateButton}
              onPress={onPressCreateMeeting}
              hitSlop={8}
            >
              <Ionicons name="add" size={16} color={PINK} />
              <Text style={styles.meetingCreateButtonText}>
                정기모임 만들기
              </Text>
            </Pressable>
          ) : null}
        </View>

        {meetingCardItems.length > 0 ? (
          <View style={styles.meetingCardList}>
            {meetingCardItems.map((meeting) => (
              <MeetingCard
                key={meeting.meetingId}
                clubId={clubId}
                meeting={meeting}
                viewer={viewer}
                onPress={() => {
                  setSelectedMeetingId(meeting.meetingId);
                  setMeetingSheetVisible(true);
                }}
                onPressManage={() => onPressMeetingManage(meeting.meetingId)}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.meetingCard, styles.meetingEmptyCard]}>
            <Text style={styles.meetingEmptyText}>
              아직 예정된 정기모임이 없어요.
            </Text>
            {viewer.canCreateMeeting ? (
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

      <MeetingDetailSheet
        clubId={clubId}
        visible={isMeetingSheetVisible}
        meeting={meetingDetailQuery.data}
        fallbackMeeting={selectedMeeting}
        ddayText={selectedMeetingDdayText}
        onClose={() => setMeetingSheetVisible(false)}
        onPressManage={
          selectedMeetingId
            ? () => onPressMeetingManage(selectedMeetingId)
            : undefined
        }
        viewer={viewer}
      />
    </View>
  );
}

type MeetingCardItem = {
  meetingId: number;
  name: string;
  date?: string;
  dateLabel?: string;
  nextOccurrenceAt?: string;
  day?: string;
  time?: string;
  spot?: string;
  cost?: string | null;
  capacity?: number;
  attendeeCount?: number;
  isAttending?: boolean;
  attendeesPreview?: IClubUserSummary[];
};

function MeetingCard({
  clubId,
  meeting,
  viewer,
  onPress,
  onPressManage,
}: {
  clubId: number;
  meeting: MeetingCardItem;
  viewer: ClubViewer;
  onPress: () => void;
  onPressManage: () => void;
}) {
  const [joinStatus, setJoinStatus] = useState<MeetingAttendanceStatus | null>(
    null,
  );
  const shouldLoadDetail =
    !meeting.spot ||
    meeting.cost === undefined ||
    meeting.capacity === undefined ||
    meeting.attendeeCount === undefined ||
    meeting.isAttending === undefined;
  const meetingDetailQuery = useMeetingDetailQuery(
    clubId,
    meeting.meetingId,
    shouldLoadDetail,
  );
  const detail = meetingDetailQuery.data;
  const displayMeeting: MeetingCardItem = detail
    ? {
        meetingId: detail.meetingId,
        name: detail.name,
        dateLabel: detail.dateLabel,
        nextOccurrenceAt: detail.nextOccurrenceAt,
        spot: detail.spot,
        cost: detail.cost,
        capacity: detail.capacity,
        attendeeCount: detail.attendeeCount,
        isAttending: detail.isAttending,
        attendeesPreview: detail.attendeesPreview,
      }
    : meeting;
  const isLoadingDetail =
    shouldLoadDetail && meetingDetailQuery.isLoading && !detail;
  const attendMeetingMutation = useAttendMeetingMutation(
    clubId,
    displayMeeting.meetingId,
  );
  const isJoinPending = joinStatus === "PENDING";
  const isAttending =
    joinStatus === "ACTIVE" || (displayMeeting.isAttending ?? false);
  const attendeeCount = displayMeeting.attendeeCount ?? 0;
  const attendeeCountText =
    typeof displayMeeting.capacity === "number"
      ? `${attendeeCount}명 참석중 (${attendeeCount}/${displayMeeting.capacity})`
      : `${attendeeCount}명 참석중`;
  const ddayText = getMeetingCardDdayText(displayMeeting);
  const dateText = getMeetingCardDateText(displayMeeting);
  const attendeesPreview = displayMeeting.attendeesPreview ?? [];

  const handleAttendMeeting = () => {
    if (isAttending || isJoinPending || attendMeetingMutation.isPending) return;

    attendMeetingMutation.mutate(undefined, {
      onSuccess: (response) => {
        setJoinStatus(response?.status ?? "ACTIVE");
      },
      onError: (error) => {
        Alert.alert(
          "참석 실패",
          getApiErrorMessage(error) ?? "잠시 후 다시 시도해주세요.",
        );
      },
    });
  };

  return (
    <Pressable style={styles.meetingCard} onPress={onPress}>
      <View style={styles.meetingCardHeader}>
        <View style={styles.meetingTitleRow}>
          {ddayText ? (
            <View style={styles.dDayBadge}>
              <Text style={styles.dDayText}>{ddayText}</Text>
            </View>
          ) : null}
          <Text style={styles.meetingTitle} numberOfLines={1}>
            {displayMeeting.name}
          </Text>
        </View>
        {/* 가입 전 게스트에게는 모임 관리(⋮) 메뉴를 노출하지 않는다. */}
        {viewer.canActOnMeeting ? (
          <Pressable
            style={styles.meetingMenuButton}
            hitSlop={8}
            onPress={onPressManage}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#8E9AA3" />
          </Pressable>
        ) : null}
      </View>

      {isLoadingDetail ? (
        <View style={styles.meetingCardLoading}>
          <ActivityIndicator size="small" color={PINK} />
        </View>
      ) : (
        <>
          <View style={styles.meetingInfoList}>
            <MeetingInfo label="일시" value={dateText || "-"} />
            <MeetingInfo label="위치" value={displayMeeting.spot || "-"} />
            <MeetingInfo label="비용" value={displayMeeting.cost || "-"} />
          </View>

          <View style={styles.attendeeRow}>
            {attendeesPreview.length > 0
              ? attendeesPreview.slice(0, 3).map((attendee, index) => (
                  <Image
                    key={attendee.userId}
                    source={{ uri: attendee.profileImageUrl ?? undefined }}
                    style={[
                      styles.attendeeAvatar,
                      index > 0 && styles.attendeeOverlap,
                    ]}
                    contentFit="cover"
                  />
                ))
              : [0, 1, 2].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.attendeeAvatar,
                      index > 0 && styles.attendeeOverlap,
                    ]}
                  />
                ))}
            <Text style={styles.attendeeText}>{attendeeCountText}</Text>
          </View>
        </>
      )}

      {/* 가입 전 게스트에게는 참석/관리 버튼을 노출하지 않는다. */}
      {viewer.canActOnMeeting ? (
        <Pressable
          style={[
            styles.attendanceButton,
            !viewer.canManageMeeting &&
              (isAttending || isJoinPending) &&
              styles.attendanceButtonDisabled,
          ]}
          onPress={viewer.canManageMeeting ? onPressManage : handleAttendMeeting}
          disabled={
            !viewer.canManageMeeting &&
            (isAttending || isJoinPending || attendMeetingMutation.isPending)
          }
        >
          <Text
            style={[
              styles.attendanceButtonText,
              !viewer.canManageMeeting &&
                (isAttending || isJoinPending) &&
                styles.attendanceButtonTextDisabled,
            ]}
          >
            {viewer.canManageMeeting
              ? "참석 현황 확인"
              : isJoinPending
                ? "참석 신청됨"
                : isAttending
                ? "참석 중"
                : attendMeetingMutation.isPending
                  ? "처리 중..."
                  : "참석하기"}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

function MeetingDetailSheet({
  clubId,
  visible,
  meeting,
  fallbackMeeting,
  ddayText,
  onClose,
  onPressManage,
  viewer,
}: {
  clubId: number;
  visible: boolean;
  meeting?: IMeetingDetailResponse;
  fallbackMeeting?: MeetingCardItem;
  ddayText: string;
  onClose: () => void;
  onPressManage?: () => void;
  viewer: ClubViewer;
}) {
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);
  const [joinStatus, setJoinStatus] = useState<MeetingAttendanceStatus | null>(
    null,
  );
  const meetingId = meeting?.meetingId ?? fallbackMeeting?.meetingId ?? 0;
  const attendMeetingMutation = useAttendMeetingMutation(clubId, meetingId);
  const attendeesQuery = useMeetingAttendeesInfiniteQuery(
    clubId,
    meetingId,
    { size: 20 },
    visible && !!meetingId,
  );

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 24,
          stiffness: 240,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsMounted(false);
    });
  }, [visible, screenHeight, translateY, backdropOpacity]);

  useEffect(() => {
    setJoinStatus(null);
  }, [meetingId]);

  if (!isMounted || (!meeting && !fallbackMeeting)) return null;

  const nextOccurrenceAt =
    meeting?.nextOccurrenceAt ?? fallbackMeeting?.nextOccurrenceAt ?? fallbackMeeting?.date;
  const nextDate = new Date(nextOccurrenceAt ?? "");
  const nextDateText = Number.isNaN(nextDate.getTime())
    ? ""
    : formatOccurrenceDate(nextDate);
  const recurrenceText = meeting ? getRecurrenceText(meeting.recurrence.type) : "";
  const attendeeCount =
    attendeesQuery.data?.pages[0]?.attendeeCount ??
    meeting?.attendeeCount ??
    fallbackMeeting?.attendeeCount ??
    0;
  const capacity = meeting?.capacity ?? fallbackMeeting?.capacity;
  const attendeeCountText =
    typeof capacity === "number" ? `${attendeeCount}/${capacity}` : `${attendeeCount}`;
  const isJoinPending = joinStatus === "PENDING";
  const isAttending =
    joinStatus === "ACTIVE" ||
    (meeting?.isAttending ?? fallbackMeeting?.isAttending ?? false);
  const attendDisabled =
    isAttending || isJoinPending || attendMeetingMutation.isPending;
  const meetingTitle = meeting?.name ?? fallbackMeeting?.name ?? "";
  const meetingDateTitle =
    meeting?.dateLabel ?? getMeetingCardDateText(fallbackMeeting) ?? "-";
  const meetingSpot = meeting?.spot ?? fallbackMeeting?.spot ?? "-";
  const meetingCost = meeting?.cost ?? fallbackMeeting?.cost ?? "-";
  const attendeesPreview =
    attendeesQuery.data?.pages.flatMap((page) =>
      page.attendees.map((attendee) => attendee.user),
    ) ??
    meeting?.attendeesPreview ??
    fallbackMeeting?.attendeesPreview ??
    [];

  const handleAttend = () => {
    if (!meetingId || attendDisabled) return;

    attendMeetingMutation.mutate(undefined, {
      onSuccess: (response) => {
        setJoinStatus(response?.status ?? "ACTIVE");
      },
      onError: (error) => {
        Alert.alert(
          "참석 실패",
          getApiErrorMessage(error) ?? "잠시 후 다시 시도해주세요.",
        );
      },
    });
  };

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.meetingSheetBackdrop}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.meetingSheetDim,
            { opacity: backdropOpacity },
          ]}
          pointerEvents="none"
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[styles.meetingSheet, { transform: [{ translateY }] }]}
        >
          <View style={styles.meetingSheetHandle} />

          <View style={styles.meetingSheetTop}>
            <View style={styles.meetingSheetChipRow}>
              {ddayText ? (
                <View style={styles.dDayBadge}>
                  <Text style={styles.dDayText}>{ddayText}</Text>
                </View>
              ) : null}
              {recurrenceText ? (
                <View style={styles.repeatBadge}>
                  <Text style={styles.repeatBadgeText}>{recurrenceText}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.meetingSheetTitle}>{meetingTitle}</Text>
          </View>

          <View style={styles.meetingSheetBar} />

          <View style={styles.meetingSheetInfoList}>
            <MeetingIconInfo
              icon={IconCalendar}
              title={meetingDateTitle}
              subtitle={
                nextDateText ? `다음 모임 · ${nextDateText} · ${ddayText}` : ""
              }
              subtitleEmphasis={ddayText}
            />
            <MeetingIconInfo icon={IconLocation} title={meetingSpot} />
            <MeetingIconInfo icon={IconWallet} title={meetingCost} />
          </View>

          <View style={styles.meetingSheetDivider} />

          <Text style={styles.meetingSheetSectionTitle}>안내사항</Text>
          <View style={styles.meetingNoticeBox}>
            <Text style={styles.meetingNoticeText}>
              {meeting?.introText ?? "정기모임 상세 정보를 불러오는 중이에요."}
            </Text>
          </View>

          <View style={styles.meetingAttendeeHeader}>
            <Text style={styles.meetingSheetSectionTitle}>참석자</Text>
            <Text style={styles.meetingAttendeeCount}>{attendeeCountText}</Text>
          </View>
          <ScrollView
            style={styles.meetingAttendeeScroll}
            nestedScrollEnabled
          >
            <View style={styles.meetingAttendeeList}>
              {attendeesPreview.map((attendee) => (
                <MeetingSheetAttendee key={attendee.userId} attendee={attendee} />
              ))}
            </View>
            {attendeesQuery.hasNextPage ? (
              <MeetingLoadMoreButton
                isLoading={attendeesQuery.isFetchingNextPage}
                onPress={() => attendeesQuery.fetchNextPage()}
              />
            ) : null}
          </ScrollView>

          {/* 가입 전 게스트에게는 참석/관리 버튼을 노출하지 않는다. */}
          {viewer.canActOnMeeting ? (
            <Pressable
              style={[
                styles.meetingAttendButton,
                attendDisabled && styles.meetingAttendButtonDisabled,
              ]}
              onPress={viewer.canManageMeeting ? onPressManage : handleAttend}
              disabled={
                viewer.canManageMeeting ? !onPressManage : attendDisabled
              }
            >
              <Text style={styles.meetingAttendButtonText}>
                {viewer.canManageMeeting
                  ? "참석 현황 확인"
                  : isJoinPending
                    ? "참석 신청됨"
                    : isAttending
                    ? "참석 중"
                    : attendMeetingMutation.isPending
                      ? "처리 중..."
                      : "참석하기"}
              </Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

function MeetingIconInfo({
  icon: Icon,
  title,
  subtitle,
  subtitleEmphasis,
}: {
  icon: React.ComponentType<SvgProps>;
  title: string;
  subtitle?: string;
  subtitleEmphasis?: string;
}) {
  return (
    <View style={styles.meetingIconInfoRow}>
      <Icon width={24} height={24} color={PINK} />
      <View style={styles.meetingIconInfoText}>
        <Text style={styles.meetingIconInfoTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.meetingIconInfoSubtitle}>
            {subtitleEmphasis
              ? subtitle.replace(` · ${subtitleEmphasis}`, "")
              : subtitle}
            {subtitleEmphasis ? (
              <Text style={styles.meetingIconInfoEmphasis}>
                {" · "}
                {subtitleEmphasis}
              </Text>
            ) : null}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function MeetingSheetAttendee({ attendee }: { attendee: IClubUserSummary }) {
  return (
    <View style={styles.meetingSheetAttendee}>
      {attendee.profileImageUrl ? (
        <Image
          source={{ uri: attendee.profileImageUrl }}
          style={styles.meetingSheetAvatar}
          contentFit="cover"
        />
      ) : (
        <View style={styles.meetingSheetAvatar} />
      )}
      <Text style={styles.meetingSheetAttendeeName} numberOfLines={1}>
        {attendee.nickname}
      </Text>
    </View>
  );
}

// 요약 응답의 "HH:mm:ss" 시간에서 초를 잘라 카드용으로 다듬는다.
function formatSummaryTime(time?: string) {
  if (!time) return undefined;
  const match = time.match(/^(\d{1,2}:\d{2})/);
  return match ? match[1] : time;
}

function buildMeetingCardItems(
  listItems: IMeetingListItem[],
  summaries: IClubMeetingSummary[],
): MeetingCardItem[] {
  const listCardItems: MeetingCardItem[] = listItems.flatMap((meeting) => {
    const meetingId = normalizeMeetingId(meeting.meetingId);
    if (!meetingId) return [];

    return [
      {
        meetingId,
        name: meeting.name,
        date: meeting.date,
        spot: meeting.spot,
        capacity: meeting.capacity,
        cost: meeting.cost,
        attendeeCount: meeting.attendeeCount,
        isAttending: meeting.isAttending,
      },
    ];
  });
  const listIds = new Set(listCardItems.map((meeting) => meeting.meetingId));
  const summaryCardItems: MeetingCardItem[] = summaries.flatMap((meeting) => {
    const meetingId = normalizeMeetingId(meeting.meetingId);
    if (!meetingId || listIds.has(meetingId)) return [];

    return [
      {
        meetingId,
        name: meeting.name,
        day: meeting.day,
        time: meeting.time,
      },
    ];
  });

  return [...listCardItems, ...summaryCardItems];
}

function normalizeMeetingId(value: number | string) {
  const meetingId = Number(value);
  return Number.isFinite(meetingId) && meetingId > 0 ? meetingId : null;
}

function getMeetingCardDdayText(meeting?: MeetingCardItem) {
  if (!meeting) return "";

  const ddaySource = meeting.nextOccurrenceAt ?? meeting.date;
  if (ddaySource) return formatDday(ddaySource);

  const summaryNextOccurrence = getNextOccurrenceFromSummary(
    meeting.day,
    meeting.time,
  );

  return summaryNextOccurrence ? formatDday(summaryNextOccurrence) : "";
}

function getMeetingCardDateText(meeting?: MeetingCardItem) {
  if (!meeting) return undefined;

  return (
    meeting.dateLabel ??
    formatMeetingListDate(meeting.date) ??
    [meeting.day, formatSummaryTime(meeting.time)].filter(Boolean).join(" ")
  );
}

function formatMeetingListDate(date?: string) {
  if (!date) return undefined;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return undefined;

  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const weekday = weekdayLabels[parsedDate.getDay()];
  const hour = String(parsedDate.getHours()).padStart(2, "0");
  const minute = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${weekday} ${hour}:${minute}`;
}

function getNextOccurrenceFromSummary(day?: string, time?: string) {
  if (!day || !time) return undefined;

  const weekdayIndex = getWeekdayIndex(day);
  if (weekdayIndex === null) return undefined;

  const timeMatch = time.match(/^(\d{1,2}):(\d{2})/);
  if (!timeMatch) return undefined;

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return undefined;

  const now = new Date();
  const next = new Date(now);
  const dayDiff = (weekdayIndex - now.getDay() + 7) % 7;
  next.setDate(now.getDate() + dayDiff);
  next.setHours(hour, minute, 0, 0);

  if (next.getTime() < now.getTime()) {
    next.setDate(next.getDate() + 7);
  }

  return next;
}

function getWeekdayIndex(day: string) {
  const normalizedDay = day.trim().slice(0, 3).toUpperCase();
  const indexes: Record<string, number> = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
  };

  return normalizedDay in indexes ? indexes[normalizedDay] : null;
}

function getRecurrenceText(type: IMeetingDetailResponse["recurrence"]["type"]) {
  if (type === "DAILY") return "매일 반복";
  if (type === "MONTHLY") return "매달 반복";
  return "매주 반복";
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
  const [activeCategory, setActiveCategory] = useState<
    ClubPostCategory | "ALL"
  >("ALL");
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
              style={[
                styles.boardCategoryChip,
                isActive && styles.boardCategoryChipActive,
              ]}
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
        <BoardPostListSkeleton />
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
        <View
          style={[
            styles.boardPostTextBlock,
            hasImage && styles.boardPostTextWithImage,
          ]}
        >
          {article.title ? (
            <Text style={styles.boardPostTitle} numberOfLines={1}>
              {article.title}
            </Text>
          ) : null}
          <Text style={styles.boardPostText} numberOfLines={hasImage ? 2 : 3}>
            {article.preview}
          </Text>
        </View>
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

// 가입 전 게스트에게 게시판/사진첩 대신 보여주는 잠금 안내 화면입니다.
function ClubLockedTab({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.preJoinChatPlaceholder}>
      <Ionicons name={icon} size={40} color="#C5CDD3" />
      <Text style={styles.preJoinChatText}>
        가입해야 {label}을 볼 수 있어요
      </Text>
    </View>
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

  if (isLoading && !hasArchives) {
    return <AlbumGridSkeleton itemSize={itemSize} />;
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

function JoinRequestModal({
  visible,
  clubImageUri,
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
  clubImageUri: string;
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
                <Image
                  source={{ uri: clubImageUri }}
                  style={styles.modalClubImage}
                  contentFit="cover"
                />
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
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 2,
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
    top: -2,
    right: -8,
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
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: PINK,
    backgroundColor: "#FFF0F2",
  },
  pendingBannerTextBox: {
    flex: 1,
  },
  pendingBannerTitle: {
    color: BLACK,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  pendingBannerSubtitle: {
    marginTop: 2,
    color: "#636970",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
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
  meetingCardList: {
    gap: 14,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  meetingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  meetingTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  meetingMenuButton: {
    padding: 4,
    marginRight: -4,
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
  repeatBadge: {
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#E9ECED",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  repeatBadgeText: {
    color: "#636970",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 20,
  },
  meetingTitle: {
    flex: 1,
    color: BLACK,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 23,
  },
  meetingInfoList: {
    marginTop: 16,
    gap: 4,
  },
  meetingCardLoading: {
    height: 94,
    alignItems: "center",
    justifyContent: "center",
  },
  meetingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  meetingInfoLabel: {
    width: 40,
    color: "#636970",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  meetingInfoValue: {
    flex: 1,
    color: BLACK,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  attendeeRow: {
    marginTop: 14,
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
    marginLeft: -6,
  },
  attendeeText: {
    marginLeft: 12,
    color: "#8E9AA3",
    fontSize: 13,
    fontWeight: "700",
  },
  attendanceButton: {
    height: 42,
    marginTop: 16,
    borderWidth: 1,
    borderColor: PINK,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0F2",
  },
  attendanceButtonText: {
    color: PINK,
    fontSize: 16,
    fontWeight: "700",
  },
  attendanceButtonDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F4F5F6",
  },
  attendanceButtonTextDisabled: {
    color: "#B0B8BF",
  },
  meetingSheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  meetingSheetDim: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  meetingSheet: {
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  meetingSheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DEE3E5",
    marginBottom: 12,
  },
  meetingSheetTop: {
    gap: 12,
    paddingBottom: 16,
  },
  meetingSheetChipRow: {
    flexDirection: "row",
    gap: 6,
  },
  meetingSheetTitle: {
    color: BLACK,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 30,
  },
  meetingSheetDivider: {
    height: 1,
    backgroundColor: "#DEE3E5",
    // 구분선과 "안내사항" 제목이 붙어 보여서 아래쪽 여백을 준다.
    marginBottom: 24,
  },
  meetingSheetBar: {
    alignSelf: "stretch",
    height: 8,
    backgroundColor: "#F8FAFB",
  },
  meetingSheetInfoList: {
    gap: 16,
    paddingVertical: 12,
  },
  meetingIconInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  meetingIconInfoText: {
    flex: 1,
    minWidth: 0,
  },
  meetingIconInfoTitle: {
    color: BLACK,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23,
  },
  meetingIconInfoSubtitle: {
    color: "#636970",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  meetingIconInfoEmphasis: {
    color: PINK,
  },
  meetingSheetSectionTitle: {
    color: BLACK,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  meetingNoticeBox: {
    minHeight: 48,
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFCBD6",
    backgroundColor: "#FFF0F2",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  meetingNoticeText: {
    color: BLACK,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  meetingAttendeeHeader: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  meetingAttendeeCount: {
    color: GRAY,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23,
  },
  meetingAttendeeScroll: {
    maxHeight: 260,
  },
  meetingAttendeeList: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 20,
    columnGap: 16,
  },
  meetingSheetAttendee: {
    width: 65,
    alignItems: "center",
    gap: 4,
  },
  meetingSheetAvatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#D9D9D9",
  },
  meetingSheetAttendeeName: {
    width: "100%",
    color: "#636970",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
  },
  meetingAttendButton: {
    height: 54,
    marginTop: 32,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PINK,
  },
  meetingAttendButtonDisabled: {
    opacity: 0.55,
  },
  meetingAttendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
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
  boardPostTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  boardPostTitle: {
    color: BLACK,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  boardPostText: {
    color: "#565F66",
    fontSize: 15,
    fontWeight: "500",
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
    flex: 1,
    minHeight: 240,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  chatTabFill: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  preJoinChatText: {
    color: "#8E9AA3",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  preJoinChatRetryText: {
    color: PINK,
    fontSize: 14,
    fontWeight: "700",
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
  chatSelectedImageList: {
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,
  },
  chatSelectedImageWrap: {
    width: 76,
    height: 76,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
  },
  chatSelectedImage: {
    width: "100%",
    height: "100%",
  },
  chatSelectedImageRemove: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
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
