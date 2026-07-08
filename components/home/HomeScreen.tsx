import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import FoodCategoryIcon from "@/assets/images/club-categories/figma-food.svg";
import HobbyCategoryIcon from "@/assets/images/club-categories/figma-hobby.svg";
import OthersCategoryIcon from "@/assets/images/club-categories/figma-others.svg";
import SocialCategoryIcon from "@/assets/images/club-categories/figma-social.svg";
import SportsCategoryIcon from "@/assets/images/club-categories/figma-sports.svg";
import StudyCategoryIcon from "@/assets/images/club-categories/figma-study.svg";
import VolunteerCategoryIcon from "@/assets/images/club-categories/figma-volunteer.svg";
import {
  useRecommendationsInfiniteQuery,
  useSendRecommendationHeartMutation,
} from "@/hooks/api/useRecommendations";
import { useNotificationsInfiniteQuery } from "@/hooks/api/useNotifications";
import {
  useCreateProfileVisitMutation,
  useMyProfileQuery,
  useMyProfileVisitorsQuery,
} from "@/hooks/api/useUsers";
import { DEFAULT_PROFILE_IMAGE_URI } from "@/constants/defaultProfileImage";
import { TAB_SCREEN_BOTTOM_PADDING } from "@/constants/layout";
import ClubRow, { ClubRowItem } from "@/components/search/ClubRow";
import { IconVerifiedBadge } from "@/components/SvgIcons";
import {
  ClubRowListSkeleton,
  HomeInitialSkeleton,
  MyClubCardListSkeleton,
  RecommendCardSkeleton,
  ViewerListSkeleton,
} from "@/components/skeletons";
import {
  useMyClubsQuery,
  useRecommendedClubsQuery,
  useTodayRecommendedClubsQuery,
} from "@/hooks/api/useClub";
import { useAuthStore } from "@/stores/authStore";
import { useClubLocationStore } from "@/stores/clubLocationStore";
import { useNotificationSettingsStore } from "@/stores/notificationSettingsStore";
import { chunk, uniqueBy } from "@/utils/array";

const PINK = "#FF1B4D";
const BLACK = "#202020";
const GRAY = "#A0A0A0";
const LIGHT_GRAY = "#E8E8E8";

type HomeTab = "home" | "club";
type ClubCategoryIcon = React.ComponentType<SvgProps>;

type Profile = {
  id: string;
  targetUserId?: number;
  name: string;
  age: number;
  location: string;
  intro: string;
  images: string[];
  isLiked: boolean;
  likedHeartId: number | null;
};

const USER_NICKNAME = "루씨";
const RECOMMENDATION_COUNTDOWN_MS = 60 * 60 * 1000;
// 내 동호회 펼침 그리드(3열)의 최소 열 간격
const MY_CLUB_GRID_MIN_GAP = 12;
const CLUB_CATEGORIES = [
  {
    label: "운동 / 스포츠",
    searchLabel: "운동 / 스포츠",
    value: "SPORTS",
    Icon: SportsCategoryIcon,
  },
  {
    label: "봉사활동",
    searchLabel: "봉사활동",
    value: "VOLUNTEER",
    Icon: VolunteerCategoryIcon,
  },
  {
    label: "독서 / 공부",
    searchLabel: "독서 / 공부",
    value: "STUDY",
    Icon: StudyCategoryIcon,
  },
  {
    label: "취미 / 여가",
    searchLabel: "취미 / 여가",
    value: "HOBBY",
    Icon: HobbyCategoryIcon,
  },
  {
    label: "음식 / 맛집",
    searchLabel: "음식 / 맛집",
    value: "FOOD",
    Icon: FoodCategoryIcon,
  },
  {
    label: "문화/예술",
    searchLabel: "문화/예술",
    value: "CULTURE_ART",
    Icon: SocialCategoryIcon,
  },
  {
    label: "기타",
    searchLabel: "기타",
    value: "OTHERS",
    Icon: OthersCategoryIcon,
  },
] as const;

const getCountdownText = (endAt: number) => {
  const remainingSeconds = Math.max(
    0,
    Math.ceil((endAt - Date.now()) / 1000),
  );
  const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(remainingSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export default function HomePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const fabAnimation = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const profileListRef = useRef<FlatList<Profile>>(null);
  const countdownEndAt = useRef(Date.now() + RECOMMENDATION_COUNTDOWN_MS);
  const { tab: tabParam, tabPressAt } = useLocalSearchParams<{
    tab?: string;
    tabPressAt?: string;
  }>();
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTab>(
    tabParam === "club" ? "club" : "home",
  );
  const [profileIndex, setProfileIndex] = useState(0);
  const [countdown, setCountdown] = useState(() =>
    getCountdownText(countdownEndAt.current),
  );
  const [, setLikedCount] = useState(0);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const notificationEnabled = useNotificationSettingsStore(
    (state) => state.enabled,
  );
  const myProfileQuery = useMyProfileQuery();
  const clubAreaCode = useClubLocationStore((state) => state.areaCode);
  const clubAreaName = useClubLocationStore((state) => state.areaName);
  const activeClubAreaCode = clubAreaCode || myProfileQuery.data?.area?.code || undefined;
  const clubLocationLabel =
    clubAreaName || myProfileQuery.data?.area?.name || "지역 선택";
  const visitorsQuery = useMyProfileVisitorsQuery({ size: 12 });
  const recommendationsQuery = useRecommendationsInfiniteQuery();
  const refetchRecommendations = recommendationsQuery.refetch;
  const heartNotificationsQuery = useNotificationsInfiniteQuery(
    "heart",
    undefined,
    notificationEnabled,
  );
  // 알림 화면(app/notifications.tsx)이 마음/동호회 탭만 제공하므로 dot 기준도 heart+club로 맞춘다.
  // (chat unread는 하단 navbar 채팅 badge가 별도로 표시)
  const clubNotificationsQuery = useNotificationsInfiniteQuery(
    "club",
    undefined,
    notificationEnabled,
  );
  const clubRecommendationsQuery = useRecommendedClubsQuery(
    {
      ...(activeClubAreaCode ? { areaCode: activeClubAreaCode } : {}),
      size: 10,
    },
    activeHomeTab === "club",
  );
  const sendHeartMutation = useSendRecommendationHeartMutation();
  const createProfileVisitMutation = useCreateProfileVisitMutation();

  const recommendedProfiles = useMemo(
    () => mapRecommendationProfiles(recommendationsQuery.data),
    [recommendationsQuery.data],
  );
  const visitors = visitorsQuery.data?.items ?? [];
  const heartUnreadCount = useMemo(
    () => countUnreadNotifications(heartNotificationsQuery.data),
    [heartNotificationsQuery.data],
  );
  const clubUnreadCount = useMemo(
    () => countUnreadNotifications(clubNotificationsQuery.data),
    [clubNotificationsQuery.data],
  );
  const profiles = recommendedProfiles;
  const profile =
    profiles.length > 0
      ? profiles[Math.min(profileIndex, profiles.length - 1)]
      : null;
  const nickname = myProfileQuery.data?.nickname ?? USER_NICKNAME;
  const isWaitingForMyProfile =
    !isAuthInitialized ||
    (isAuthenticated && !myProfileQuery.data && !myProfileQuery.isError);
  const cardWidth = width - 40;
  const hasNotificationBadge =
    notificationEnabled && heartUnreadCount + clubUnreadCount > 0;

  // 마이페이지 등에서 ?tab=club 으로 진입하면 동호회 탭을 엽니다.
  useEffect(() => {
    if (tabParam === "club") setActiveHomeTab("club");
  }, [tabParam]);

  useEffect(() => {
    if (!tabPressAt) return;

    lastScrollY.current = 0;
    setProfileIndex(0);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    profileListRef.current?.scrollToOffset({ offset: 0, animated: false });
    fabAnimation.setValue(1);
  }, [fabAnimation, tabPressAt]);

  // 추천 마감 카운트다운이 끝나면 추천 목록을 새로 받아옵니다.
  useEffect(() => {
    const tick = () => {
      const now = Date.now();

      if (now >= countdownEndAt.current) {
        countdownEndAt.current = now + RECOMMENDATION_COUNTDOWN_MS;
        setProfileIndex(0);
        profileListRef.current?.scrollToOffset({ offset: 0, animated: false });
        void refetchRecommendations();
      }

      setCountdown(getCountdownText(countdownEndAt.current));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [refetchRecommendations]);

  // 추천 목록 길이가 변해도 현재 인덱스가 유효한 카드만 가리키도록 보정합니다.
  useEffect(() => {
    setProfileIndex((currentIndex) => {
      if (profiles.length === 0) return 0;
      return Math.min(currentIndex, profiles.length - 1);
    });
  }, [profiles.length]);

  // 아래로 스크롤하면 음성 입력 버튼을 살짝 숨기고, 위로 올리면 다시 보여줍니다.
  const handleMainScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const isScrollingDown = currentY > lastScrollY.current + 8;
    const isScrollingUp = currentY < lastScrollY.current - 8;

    if (isScrollingDown || isScrollingUp) {
      Animated.timing(fabAnimation, {
        toValue: isScrollingDown ? 0 : 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = Math.max(0, currentY);
  };

  const fetchMoreRecommendationsIfNeeded = (nextIndex: number) => {
    if (
      nextIndex >= profiles.length - 2 &&
      recommendationsQuery.hasNextPage &&
      !recommendationsQuery.isFetchingNextPage
    ) {
      recommendationsQuery.fetchNextPage();
    }
  };

  // 추천 카드를 좌우 스와이프할 때 현재 프로필 인덱스를 맞춥니다.
  const handleProfileListScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (profiles.length === 0) return;

    const nextIndex = Math.min(
      profiles.length - 1,
      Math.max(0, Math.round(event.nativeEvent.contentOffset.x / width)),
    );
    setProfileIndex(nextIndex);
    fetchMoreRecommendationsIfNeeded(nextIndex);
  };

  // 별로예요를 누르면 다음 추천 프로필로 넘깁니다.
  const handleDislike = () => {
    if (profiles.length === 0) return;

    const nextIndex = (profileIndex + 1) % profiles.length;
    setProfileIndex(nextIndex);
    fetchMoreRecommendationsIfNeeded(nextIndex);
    profileListRef.current?.scrollToOffset({
      offset: width * nextIndex,
      animated: true,
    });
  };

  // 마음이들어요를 누르면 내부 카운트를 올리고 마음 탭으로 이동합니다.
  const handleLike = (selectedProfile: Profile) => {
    setLikedCount((prev) => prev + 1);
    if (selectedProfile.targetUserId && !selectedProfile.isLiked) {
      sendHeartMutation.mutate(selectedProfile.targetUserId);
    }
    router.replace({
      pathname: "/(tabs)/heart",
      params: { tab: "sent" },
    } as never);
  };

  // 상대 프로필 상세로 진입할 때 방문 기록을 서버에 남깁니다.
  const handleOpenProfileDetail = (targetUserId?: number, fallback?: Profile) => {
    if (targetUserId) {
      createProfileVisitMutation.mutate(targetUserId);
    }

    router.push({
      pathname: "/profile-detail",
      params: {
        ...(targetUserId ? { userId: String(targetUserId) } : {}),
        ...(fallback
          ? {
              name: fallback.name,
              age: fallback.age ? String(fallback.age) : "",
              image: fallback.images[0] ?? "",
              location: fallback.location,
              intro: fallback.intro,
              isLiked: String(fallback.isLiked),
              ...(fallback.likedHeartId
                ? { heartId: String(fallback.likedHeartId) }
                : {}),
            }
          : {}),
      },
    } as never);
  };

  if (isWaitingForMyProfile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.screen}>
          <HomeInitialSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleMainScroll}
        >
          {/* 홈 상단 헤더: 닉네임과 알림 진입 버튼을 노출합니다. */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>환영합니다 {nickname}님!</Text>
            <View style={styles.headerActions}>
              {activeHomeTab === "club" ? (
                <Pressable
                  style={styles.headerIconButton}
                  onPress={() => router.push("/search" as never)}
                  hitSlop={10}
                >
                  <Ionicons name="search" size={25} color={BLACK} />
                </Pressable>
              ) : null}
              <Pressable
                style={styles.headerIconButton}
                onPress={() => router.push("/notifications" as never)}
                hitSlop={10}
              >
                <Ionicons name="notifications-outline" size={23} color={BLACK} />
                {hasNotificationBadge ? <View style={styles.headerBadgeDot} /> : null}
              </Pressable>
            </View>
          </View>

          {/* 홈/동호회 전환 탭입니다. */}
          <View style={styles.homeTabs}>
            <HomeTabButton
              label="홈"
              isActive={activeHomeTab === "home"}
              onPress={() => setActiveHomeTab("home")}
            />
            <HomeTabButton
              label="동호회"
              isActive={activeHomeTab === "club"}
              onPress={() => setActiveHomeTab("club")}
            />
          </View>

          {activeHomeTab === "home" ? (
            <>
              {/* 오늘 추천 영역: 제목과 실시간 카운트다운을 한 줄에 배치합니다. */}
              <View style={styles.recommendHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="sparkles" size={24} color={PINK} />
                  <Text style={styles.sectionTitle}>오늘의 이상형 추천</Text>
                </View>
                <View style={styles.countdownRow}>
                  <Text style={styles.countdown}>{countdown}</Text>
                  <Ionicons name="help-circle-outline" size={14} color={GRAY} />
                </View>
              </View>

              {recommendationsQuery.isLoading && profiles.length === 0 ? (
                <RecommendCardSkeleton />
              ) : profile ? (
                <>
                  {recommendationsQuery.isError ? (
                    <View style={styles.recommendWarning}>
                      <Text style={styles.recommendWarningText}>
                        최신 추천을 불러오지 못해 이전 추천을 표시하고 있어요.
                      </Text>
                    </View>
                  ) : null}
                  <FlatList
                    ref={profileListRef}
                    data={profiles}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleProfileListScroll}
                    getItemLayout={(_, index) => ({
                      length: width,
                      offset: width * index,
                      index,
                    })}
                    renderItem={({ item }) => (
                      <ProfileCard
                        profile={item}
                        screenWidth={width}
                        cardWidth={cardWidth}
                        onPress={() =>
                          handleOpenProfileDetail(item.targetUserId, item)
                        }
                        onDislike={handleDislike}
                        onLike={() => handleLike(item)}
                      />
                    )}
                  />
                </>
              ) : (
                <View style={styles.recommendEmptyCard}>
                  <Ionicons name="heart-outline" size={34} color="#CBD5E1" />
                  <Text style={styles.recommendEmptyTitle}>
                    오늘 추천할 인연이 없어요
                  </Text>
                  <Text style={styles.recommendEmptyDescription}>
                    {recommendationsQuery.isError
                      ? "추천 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
                      : "새로운 추천이 준비되면 이곳에서 확인할 수 있어요."}
                  </Text>
                </View>
              )}

              {/* 내 프로필 조회자 목록입니다. */}
              <View style={styles.viewerSection}>
                <Text style={styles.viewerTitle}>내 프로필을 본 인연들</Text>
                {visitorsQuery.isLoading ? (
                  <ViewerListSkeleton />
                ) : visitors.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.viewerList}
                  >
                    {visitors.map((visitor) => (
                      <Pressable
                        key={`${visitor.userId}-${visitor.visitedAt}`}
                        style={styles.viewerItem}
                        onPress={() => handleOpenProfileDetail(visitor.userId)}
                      >
                        <ImageBackground
                          source={{
                            uri: visitor.profileImageUrl || DEFAULT_PROFILE_IMAGE_URI,
                          }}
                          style={styles.viewerImage}
                          imageStyle={styles.viewerImageRadius}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={150}
                        />
                        <View style={styles.viewerMetaRow}>
                          <Text style={styles.viewerName} numberOfLines={1}>
                            {visitor.nickname}
                          </Text>
                          <Text style={styles.viewerDot}>·</Text>
                          <Text style={styles.viewerAge}>{visitor.age}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.viewerEmptyBox}>
                    <Ionicons name="eye-outline" size={28} color="#CBD5E1" />
                    <Text style={styles.viewerEmptyText}>
                      {visitorsQuery.isError
                        ? "방문자 목록을 불러오지 못했어요"
                        : "아직 내 프로필을 본 인연이 없어요"}
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <ClubHomeContent
              nickname={nickname}
              activeAreaCode={activeClubAreaCode}
              locationLabel={clubLocationLabel}
              recommendedData={clubRecommendationsQuery.data}
              isRecommendedLoading={clubRecommendationsQuery.isLoading}
              onOpenClub={(clubId) =>
                router.push({
                  pathname: "/club/detail",
                  params: { clubId: parseClubId(clubId) },
                } as never)
              }
            />
          )}
        </ScrollView>

        {/* 음성 입력 FAB: 스크롤 방향에 따라 opacity/translateY가 바뀝니다. */}
        {activeHomeTab === "home" ? (
          <Animated.View
            style={[
              styles.fabWrap,
              {
                opacity: fabAnimation,
                transform: [
                  {
                    translateY: fabAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [28, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              style={styles.fab}
              onPress={() => router.push("/ideal-recording" as never)}
            >
              <Ionicons name="mic-outline" size={36} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        ) : null}

        {activeHomeTab === "club" ? (
          <Pressable
            style={styles.clubCreateFab}
            onPress={() => router.push("/club/create" as never)}
            hitSlop={10}
          >
            <Ionicons name="add" size={38} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>

    </SafeAreaView>
  );
}

function parseClubId(value: string) {
  const match = value.match(/\d+/);
  return match?.[0] ?? value;
}

function countUnreadNotifications(data?: {
  pages?: {
    items: {
      isRead?: boolean;
      read?: boolean;
      readAt?: string | null;
    }[];
  }[];
}) {
  return (
    data?.pages?.reduce(
      (total, page) =>
        total +
        page.items.filter((item) => {
          if (typeof item.isRead === "boolean") return !item.isRead;
          if (typeof item.read === "boolean") return !item.read;
          if ("readAt" in item) return !item.readAt;
          return false;
        }).length,
      0,
    ) ?? 0
  );
}

function mapRecommendationProfiles(data?: {
  pages?: {
    items: {
      userId: number;
      nickname: string;
      age: number;
      // 서버가 평면(areaName)과 중첩(area.name) 두 형태로 지역을 내려줘 둘 다 지원한다.
      areaName?: string | null;
      area?: { name?: string | null } | null;
      addressName?: string | null;
      address?: { fullName?: string | null; name?: string | null } | null;
      introText: string;
      profileImageUrl: string;
      isLiked: boolean;
      likedHeartId: number | null;
    }[];
  }[];
}): Profile[] {
  return (
    uniqueBy(
      data?.pages?.flatMap((page) =>
        page.items.map((item) => ({
          id: `recommendation-${item.userId}`,
          targetUserId: item.userId,
          name: item.nickname,
          age: item.age,
          location: getProfileLocation(item),
          intro: item.introText,
          isLiked: item.isLiked,
          likedHeartId: item.likedHeartId,
          images: item.profileImageUrl ? [item.profileImageUrl] : [DEFAULT_PROFILE_IMAGE_URI],
        })),
      ) ?? [],
      (item) => item.id,
    )
  );
}

function getProfileLocation(profile: {
  areaName?: string | null;
  area?: { name?: string | null } | null;
  addressName?: string | null;
  address?: { fullName?: string | null; name?: string | null } | null;
}) {
  return (
    profile.areaName?.trim() ||
    profile.area?.name?.trim() ||
    profile.addressName?.trim() ||
    profile.address?.fullName?.trim() ||
    profile.address?.name?.trim() ||
    ""
  );
}

type HomeTabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function HomeTabButton({ label, isActive, onPress }: HomeTabButtonProps) {
  return (
    <Pressable
      style={styles.homeTabButton}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.homeTabText, isActive && styles.homeTabTextActive]}>
        {label}
      </Text>
      {isActive ? (
        <View
          style={[
            styles.homeTabUnderline,
            label === "동호회" && styles.homeTabUnderlineWide,
          ]}
        />
      ) : null}
    </Pressable>
  );
}

function ClubHomeContent({
  nickname,
  activeAreaCode,
  locationLabel,
  recommendedData,
  isRecommendedLoading,
  onOpenClub,
}: {
  nickname: string;
  activeAreaCode?: string;
  locationLabel: string;
  recommendedData?: ClubRowsData;
  isRecommendedLoading?: boolean;
  onOpenClub: (clubId: string) => void;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [showAllMyClubs, setShowAllMyClubs] = useState(false);
  const myClubsQuery = useMyClubsQuery();
  const todayRecommendedQuery = useTodayRecommendedClubsQuery(10);

  const myClubs = uniqueBy(
    myClubsQuery.data?.items ?? [],
    (item) => item.clubId,
  );
  // 펼친 그리드: 3열 고정. 작은 화면에서는 카드 폭을 줄이고, 남는 폭은 열 간격으로 배분해
  // 마지막 행이 1~2개여도 왼쪽부터 같은 간격으로 정렬되게 한다.
  const gridAvailableWidth = width - 40; // styles.myClubGrid paddingHorizontal(20) * 2
  const myClubCardWidth = Math.min(
    108,
    Math.floor((gridAvailableWidth - MY_CLUB_GRID_MIN_GAP * 2) / 3),
  );
  const myClubColumnGap = Math.max(
    MY_CLUB_GRID_MIN_GAP,
    Math.floor((gridAvailableWidth - myClubCardWidth * 3) / 2),
  );
  const recommendedClubs = mapClubRows(recommendedData, activeAreaCode);
  const todayClubs = mapClubRows(todayRecommendedQuery.data, activeAreaCode);

  return (
    <View style={styles.clubHomeContent}>
      {/* 지역 선택 — 온보딩식 picker로 조회 지역을 고릅니다. */}
      <Pressable
        style={styles.clubLocationButton}
        onPress={() => router.push("/profile/location?mode=club" as never)}
        hitSlop={8}
      >
        <Ionicons name="location-sharp" size={20} color={BLACK} />
        <Text style={styles.clubLocationText}>{locationLabel}</Text>
        <Ionicons name="chevron-down" size={16} color={BLACK} />
      </Pressable>

      <View style={styles.clubSectionHeader}>
        <Text style={styles.clubSectionTitle}>내 동호회</Text>
        {/* 3개 이하면 접힌 미리보기로 전부 보이므로 전체보기를 숨긴다. */}
        {myClubs.length > 3 ? (
          <Pressable onPress={() => setShowAllMyClubs((current) => !current)}>
            <Text style={styles.clubSectionLink}>
              {showAllMyClubs ? "접기" : "전체보기"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* ponytail: my-clubs API에 가입대기(PENDING) 정보가 없어 status 배지 미표시 — 서버 추가 시 복원 */}
      {myClubsQuery.isLoading ? (
        <MyClubCardListSkeleton />
      ) : showAllMyClubs ? (
        <View style={styles.myClubGrid}>
          {/* API items 순서 그대로 3개씩 끊어 row-major(1 2 3 / 4 5 6)로 렌더링 */}
          {chunk(myClubs, 3).map((row) => (
            <View
              key={row[0].clubId}
              style={[styles.myClubGridRow, { columnGap: myClubColumnGap }]}
            >
              {row.map((club) => (
                <MyClubCard
                  key={club.clubId}
                  title={club.name}
                  image={club.thumbnailUrl}
                  cardWidth={myClubCardWidth}
                  onPress={() => onOpenClub(String(club.clubId))}
                />
              ))}
            </View>
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.myClubList}
        >
          {myClubs.map((club) => (
            <MyClubCard
              key={club.clubId}
              title={club.name}
              image={club.thumbnailUrl}
              onPress={() => onOpenClub(String(club.clubId))}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.clubDivider} />

      <View style={styles.clubCategorySection}>
        <Text style={styles.clubSectionTitle}>추천 카테고리</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.clubCategoryRow}
        >
          {CLUB_CATEGORIES.map((category) => (
            <ClubCategoryButton
              key={category.label}
              label={category.label}
              Icon={category.Icon}
              onPress={() =>
                router.push({
                  pathname: "/search",
                  params: {
                    category: category.value,
                    categoryLabel: category.searchLabel,
                  },
                } as never)
              }
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.clubDivider} />

      <ClubSection
        title={`${nickname} 님을 위한 동호회`}
        accent={nickname}
        icon="sparkles"
        clubs={recommendedClubs}
        isLoading={isRecommendedLoading}
        onClubPress={onOpenClub}
      />

      <ClubSection
        title="오늘의 추천 동호회"
        icon="sparkles"
        clubs={todayClubs}
        isLoading={todayRecommendedQuery.isLoading}
        onClubPress={onOpenClub}
      />
    </View>
  );
}

type ClubRowSource = {
  clubId: number | string;
  name: string;
  introText?: string | null;
  thumbnailUrl?: string | null;
  areaName?: string | null;
  addressCode?: string | null;
  addressName?: string | null;
  sidoCode?: string | null;
  sigunguCode?: string | null;
  district?: string | null;
};

type ClubRowsData = {
  items?: ClubRowSource[];
  pages?: { items: ClubRowSource[] }[];
};

function mapClubRows(
  data?: ClubRowsData,
  areaCode?: string | null,
): ClubRowItem[] {
  const clubs = data?.items ?? data?.pages?.flatMap((page) => page.items) ?? [];

  return uniqueBy(
    clubs
      .filter((club) => isClubInArea(club, areaCode))
      .map((club) => ({
        id: String(club.clubId),
        title: club.name,
        description: club.introText ?? undefined,
        district:
          club.areaName?.trim() ||
          club.addressName?.trim() ||
          club.district?.trim() ||
          undefined,
        thumbnailUrl: club.thumbnailUrl,
      })),
    (item) => item.id,
  );
}

function isClubInArea(club: ClubRowSource, areaCode?: string | null) {
  const target = areaCode?.replace(/\D/g, "");
  if (!target) return true;

  const targetDistrictPrefix = target.slice(0, 5);
  const addressCode = club.addressCode?.replace(/\D/g, "");
  if (addressCode) return addressCode.startsWith(targetDistrictPrefix);

  const sidoCode = club.sidoCode?.replace(/\D/g, "");
  const sigunguCode = club.sigunguCode?.replace(/\D/g, "");
  if (sidoCode && sigunguCode) {
    return targetDistrictPrefix === `${sidoCode}${sigunguCode}`;
  }

  return false;
}

function MyClubCard({
  title,
  image,
  status,
  onPress,
  cardWidth = 108,
}: {
  title: string;
  image?: string | null;
  status?: string;
  onPress: () => void;
  cardWidth?: number;
}) {
  return (
    <Pressable
      style={[styles.myClubCard, { width: cardWidth }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.myClubImageWrap,
          { width: cardWidth, height: cardWidth },
        ]}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.myClubImage} contentFit="cover" />
        ) : null}
        {status ? (
          <View style={styles.myClubStatusOverlay}>
            <Text style={styles.myClubStatus}>{status}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.myClubTitle} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

function ClubCategoryButton({
  label,
  Icon,
  onPress,
}: {
  label: string;
  Icon: ClubCategoryIcon;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.clubCategoryItem}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.clubCategoryIconBox}>
        <Icon width="100%" height="100%" />
      </View>
      <Text style={styles.clubCategoryLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function ClubSection({
  title,
  accent,
  icon,
  clubs,
  isLoading = false,
  showMore = false,
  onClubPress,
}: {
  title: string;
  accent?: string;
  icon?: "sparkles";
  clubs: ClubRowItem[];
  isLoading?: boolean;
  showMore?: boolean;
  onClubPress: (clubId: string) => void;
}) {
  return (
    <View style={styles.clubListSection}>
      <View style={styles.clubListTitleRow}>
        {icon ? <Ionicons name={icon} size={15} color={PINK} /> : null}
        <Text style={styles.clubSectionTitle}>
          {accent ? <Text style={styles.clubAccentText}>{accent}</Text> : null}
          {accent ? title.replace(accent, "") : title}
        </Text>
      </View>

      {isLoading && clubs.length === 0 ? (
        <ClubRowListSkeleton />
      ) : (
        <View style={styles.clubList}>
          {clubs.map((club) => (
            <ClubRow
              key={club.id}
              club={club}
              onPress={() => onClubPress(club.id)}
            />
          ))}
        </View>
      )}

      {showMore ? (
        <Pressable style={styles.clubMoreButton}>
          <Text style={styles.clubMoreButtonText}>더보기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type ProfileCardProps = {
  profile: Profile;
  screenWidth: number;
  cardWidth: number;
  onPress: () => void;
  onDislike: () => void;
  onLike: () => void;
};

function ProfileCard({
  profile,
  screenWidth,
  cardWidth,
  onPress,
  onDislike,
  onLike,
}: ProfileCardProps) {
  return (
    <Pressable
      style={[styles.profileCard, { width: screenWidth }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${profile.name} 프로필 상세 보기`}
    >
      {/* 추천 프로필 카드는 좌우 스와이프와 상세 진입을 함께 제공합니다. */}
      <View style={styles.profilePressable}>
        <ImageBackground
          source={{ uri: profile.images[0] ?? DEFAULT_PROFILE_IMAGE_URI }}
          style={[styles.profileImage, { width: cardWidth }]}
          imageStyle={styles.profileImageRadius}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
        >
          <ProfileCardGradient />
        </ImageBackground>

        <Pressable style={styles.profileInfo} onPress={onPress}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>
              {profile.name} {profile.age}
            </Text>
            <IconVerifiedBadge width={17} height={17} />
          </View>
          {profile.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={18} color="#FFFFFF" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          ) : null}
          <Text style={styles.introText}>{profile.intro}</Text>
        </Pressable>
      </View>

      {/* 추천 프로필에 대한 즉시 액션 버튼입니다. */}
      <View style={styles.actionRow}>
        <Pressable style={[styles.actionButton, styles.dislikeButton]} onPress={onDislike}>
          <Text style={styles.dislikeText}>별로에요</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.likeButton]} onPress={onLike}>
          <Text style={styles.likeText}>마음에들어요</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function ProfileCardGradient() {
  return (
    <Svg pointerEvents="none" style={styles.imageScrim}>
      <Defs>
        <LinearGradient id="homeProfileGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0" />
          <Stop offset="0.62" stopColor="#000000" stopOpacity="0" />
          <Stop offset="0.79" stopColor="#000000" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.9" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#homeProfileGradient)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: TAB_SCREEN_BOTTOM_PADDING,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    color: BLACK,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerBadgeDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PINK,
  },
  homeTabs: {
    height: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    paddingHorizontal: 20,
  },
  homeTabButton: {
    minWidth: 44,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  homeTabText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#737780",
  },
  homeTabTextActive: {
    fontWeight: "700",
    color: PINK,
  },
  homeTabUnderline: {
    position: "absolute",
    bottom: -1,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: PINK,
  },
  homeTabUnderlineWide: {
    width: 58,
  },
  recommendHeader: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    marginLeft: 4,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
    color: BLACK,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  countdown: {
    marginRight: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: GRAY,
  },
  recommendationState: {
    height: 492,
    marginHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFB",
  },
  recommendationStateText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: GRAY,
  },
  profileCard: {
    width: "100%",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  profilePressable: {
    height: 492,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: LIGHT_GRAY,
  },
  recommendEmptyCard: {
    height: 492,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F8FAFB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  recommendEmptyTitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    color: BLACK,
    textAlign: "center",
  },
  recommendEmptyDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: GRAY,
    textAlign: "center",
  },
  recommendWarning: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#FFF4F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  recommendWarningText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: PINK,
    textAlign: "center",
  },
  profileImage: {
    height: 492,
    justifyContent: "flex-end",
  },
  profileImageRadius: {
    borderRadius: 14,
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  profileInfo: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 82,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileName: {
    marginRight: 6,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  locationRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 4,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  introText: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  actionRow: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 16,
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dislikeButton: {
    backgroundColor: "#F1F3F5",
  },
  likeButton: {
    backgroundColor: PINK,
  },
  dislikeText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#6F7780",
  },
  likeText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  viewerSection: {
    paddingTop: 32,
  },
  viewerTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
    color: BLACK,
  },
  viewerEmptyBox: {
    minHeight: 104,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F8FAFB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  viewerEmptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: GRAY,
    textAlign: "center",
  },
  viewerList: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  viewerItem: {
    width: 84,
    marginRight: 12,
  },
  viewerImage: {
    width: 84,
    height: 84,
    overflow: "hidden",
    backgroundColor: LIGHT_GRAY,
  },
  viewerImageRadius: {
    borderRadius: 14,
  },
  viewerMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  viewerName: {
    maxWidth: 49,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: BLACK,
  },
  viewerDot: {
    width: 16,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#636970",
    textAlign: "center",
  },
  viewerAge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#636970",
  },
  fabWrap: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PINK,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  clubHomeContent: {
    paddingTop: 28,
  },
  clubLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  clubLocationText: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    color: BLACK,
  },
  clubSectionHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clubSectionTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
    color: BLACK,
  },
  clubSectionLink: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#A6AFB6",
  },
  myClubList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  myClubGrid: {
    paddingHorizontal: 20,
    paddingTop: 16,
    rowGap: 18,
  },
  myClubGridRow: {
    flexDirection: "row",
  },
  myClubCard: {
    width: 108,
  },
  myClubImageWrap: {
    width: 108,
    height: 108,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  myClubImage: {
    width: "100%",
    height: "100%",
  },
  myClubStatusOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(2, 2, 2, 0.6)",
  },
  myClubStatus: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
  },
  myClubTitle: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: BLACK,
    textAlign: "center",
  },
  clubDivider: {
    height: 8,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#F8FAFB",
  },
  clubCategorySection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  clubCategoryRow: {
    flexDirection: "row",
    gap: 12,
  },
  clubCategoryItem: {
    width: 64,
    alignItems: "center",
    gap: 4,
  },
  clubCategoryIconBox: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F8",
  },
  clubCategoryLabel: {
    width: 76,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: BLACK,
    textAlign: "center",
  },
  clubListSection: {
    marginBottom: 32,
  },
  clubListTitleRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clubAccentText: {
    color: PINK,
  },
  clubList: {
    gap: 4,
  },
  clubMoreButton: {
    height: 42,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9EEF1",
  },
  clubMoreButtonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: "#A6AFB6",
  },
  clubCreateFab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "#FFA0B4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PINK,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
});
