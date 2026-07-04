import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ImageBackground,
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
import { TAB_SCREEN_BOTTOM_PADDING } from "@/constants/layout";
import { CLUBS, RECOMMENDED_CLUBS } from "@/constants/search";
import ClubRow from "@/components/search/ClubRow";
import { uniqueBy } from "@/utils/array";

const PINK = "#FF1B4D";
const BLACK = "#202020";
const GRAY = "#A0A0A0";
const LIGHT_GRAY = "#E8E8E8";

type HomeTab = "home" | "club";

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
const FALLBACK_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=1200&auto=format&fit=crop";
const RECOMMENDATION_COUNTDOWN_MS = 60 * 60 * 1000;
type HomeMockClub = {
  id: string;
  title: string;
  image: string;
  status?: string;
};

const MY_CLUBS: HomeMockClub[] = [
  {
    id: "my-club-1",
    title: "우리집 강아지 산책 동호회",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80&auto=format&fit=crop",
    status: "가입 대기",
  },
  {
    id: "my-club-2",
    title: "압백 등반 동호회",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "my-club-3",
    title: "새벽 등산 동호회",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "my-club-4",
    title: "한강 러닝 크루",
    image:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "my-club-5",
    title: "동작구 요가 모임",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "my-club-6",
    title: "주말 독서 모임",
    image:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&q=80&auto=format&fit=crop",
  },
] as const;
const CLUB_CATEGORIES = [
  {
    label: "운동, 스포츠",
    image: require("../../assets/images/club-categories/sports.png"),
  },
  {
    label: "봉사활동",
    image: require("../../assets/images/club-categories/volunteer.png"),
  },
  {
    label: "자기개발",
    image: require("../../assets/images/club-categories/self-development.png"),
  },
  {
    label: "취미생활",
    image: require("../../assets/images/club-categories/hobby.png"),
  },
  {
    label: "사교",
    image: require("../../assets/images/club-categories/social.png"),
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
  const lastScrollY = useRef(0);
  const profileListRef = useRef<FlatList<Profile>>(null);
  const countdownEndAt = useRef(Date.now() + RECOMMENDATION_COUNTDOWN_MS);
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTab>("home");
  const [profileIndex, setProfileIndex] = useState(0);
  const [countdown, setCountdown] = useState(() =>
    getCountdownText(countdownEndAt.current),
  );
  const [, setLikedCount] = useState(0);
  const myProfileQuery = useMyProfileQuery();
  const visitorsQuery = useMyProfileVisitorsQuery({ limit: 12 });
  const recommendationsQuery = useRecommendationsInfiniteQuery();
  const refetchRecommendations = recommendationsQuery.refetch;
  const heartNotificationsQuery = useNotificationsInfiniteQuery("heart");
  const chatNotificationsQuery = useNotificationsInfiniteQuery("chat");
  const sendHeartMutation = useSendRecommendationHeartMutation();
  const createProfileVisitMutation = useCreateProfileVisitMutation();

  const recommendedProfiles = useMemo(
    () => mapRecommendationProfiles(recommendationsQuery.data),
    [recommendationsQuery.data],
  );
  const visitors = visitorsQuery.data?.visitors ?? [];
  const heartUnreadCount = useMemo(
    () => countUnreadNotifications(heartNotificationsQuery.data),
    [heartNotificationsQuery.data],
  );
  const chatUnreadCount = useMemo(
    () => countUnreadNotifications(chatNotificationsQuery.data),
    [chatNotificationsQuery.data],
  );
  const profiles = recommendedProfiles;
  const profile =
    profiles.length > 0
      ? profiles[Math.min(profileIndex, profiles.length - 1)]
      : null;
  const nickname = myProfileQuery.data?.nickname ?? USER_NICKNAME;
  const cardWidth = width - 40;
  const hasNotificationBadge = heartUnreadCount + chatUnreadCount > 0;

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
    router.replace("/(tabs)/heart" as never);
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <ScrollView
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
                <View style={styles.recommendEmptyCard}>
                  <Ionicons name="sparkles-outline" size={34} color="#CBD5E1" />
                  <Text style={styles.recommendEmptyTitle}>
                    추천 인연을 불러오는 중이에요
                  </Text>
                </View>
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
                  <View style={styles.viewerEmptyBox}>
                    <ActivityIndicator color={PINK} />
                    <Text style={styles.viewerEmptyText}>
                      방문한 인연을 불러오는 중이에요
                    </Text>
                  </View>
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
                            uri: visitor.profileImageUrl || FALLBACK_PROFILE_IMAGE,
                          }}
                          style={styles.viewerImage}
                          imageStyle={styles.viewerImageRadius}
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
  pages: {
    items: {
      isRead?: boolean;
      read?: boolean;
      readAt?: string | null;
    }[];
  }[];
}) {
  return (
    data?.pages.reduce(
      (total, page) =>
        total +
        page.items.filter((item) => {
          if (typeof item.isRead === "boolean") return !item.isRead;
          if (typeof item.read === "boolean") return !item.read;
          return !item.readAt;
        }).length,
      0,
    ) ?? 0
  );
}

function mapRecommendationProfiles(data?: {
  pages: {
    items: {
      userId: number;
      nickname: string;
      age: number;
      areaName: string;
      introText: string;
      profileImageUrl: string;
      isLiked: boolean;
      likedHeartId: number | null;
    }[];
  }[];
}): Profile[] {
  return (
    uniqueBy(
      data?.pages.flatMap((page) =>
        page.items.map((item) => ({
          id: `recommendation-${item.userId}`,
          targetUserId: item.userId,
          name: item.nickname,
          age: item.age,
          location: item.areaName,
          intro: item.introText,
          isLiked: item.isLiked,
          likedHeartId: item.likedHeartId,
          images: item.profileImageUrl ? [item.profileImageUrl] : [FALLBACK_PROFILE_IMAGE],
        })),
      ) ?? [],
      (item) => item.id,
    )
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
  onOpenClub,
}: {
  onOpenClub: (clubId: string) => void;
}) {
  const [showAllMyClubs, setShowAllMyClubs] = useState(false);
  const localClubs = CLUBS.slice(0, 3);
  const todayClubs = RECOMMENDED_CLUBS.slice(0, 3);

  return (
    <View style={styles.clubHomeContent}>
      <View style={styles.clubSectionHeader}>
        <Text style={styles.clubSectionTitle}>내 동호회</Text>
        <Pressable onPress={() => setShowAllMyClubs((current) => !current)}>
          <Text style={styles.clubSectionLink}>
            {showAllMyClubs ? "접기" : "전체보기"}
          </Text>
        </Pressable>
      </View>

      {showAllMyClubs ? (
        <View style={styles.myClubGrid}>
          {MY_CLUBS.map((club) => (
            <MyClubCard
              key={club.id}
              title={club.title}
              image={club.image}
              status={club.status}
            />
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.myClubList}
        >
          {MY_CLUBS.map((club) => (
            <MyClubCard
              key={club.id}
              title={club.title}
              image={club.image}
              status={club.status}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.clubDivider} />

      <View style={styles.clubCategorySection}>
        <Text style={styles.clubSectionTitle}>추천 카테고리</Text>
        <View style={styles.clubCategoryRow}>
          {CLUB_CATEGORIES.map((category) => (
            <ClubCategoryButton
              key={category.label}
              label={category.label}
              image={category.image}
            />
          ))}
        </View>
      </View>

      <View style={styles.clubDivider} />

      <ClubSection
        title="루씨 님을 위한 동호회"
        accent="루씨"
        icon="sparkles"
        clubs={localClubs}
        showMore
        onClubPress={onOpenClub}
      />

      <ClubSection
        title="오늘의 추천 동호회"
        icon="sparkles"
        clubs={todayClubs}
        onClubPress={onOpenClub}
      />
    </View>
  );
}

function MyClubCard({
  title,
  image,
  status,
}: {
  title: string;
  image: string;
  status?: string;
}) {
  return (
    <Pressable style={styles.myClubCard}>
      <View style={styles.myClubImageWrap}>
        <Image source={{ uri: image }} style={styles.myClubImage} contentFit="cover" />
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
  image,
}: {
  label: string;
  image: (typeof CLUB_CATEGORIES)[number]["image"];
}) {
  return (
    <View style={styles.clubCategoryItem}>
      <View style={styles.clubCategoryIconBox}>
        <Image source={image} style={styles.clubCategoryIcon} contentFit="contain" />
      </View>
      <Text style={styles.clubCategoryLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function ClubSection({
  title,
  accent,
  icon,
  clubs,
  showMore = false,
  onClubPress,
}: {
  title: string;
  accent?: string;
  icon?: "sparkles";
  clubs: typeof CLUBS;
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

      <View style={styles.clubList}>
        {clubs.map((club) => (
          <ClubRow
            key={club.id}
            club={club}
            onPress={() => onClubPress(club.id)}
          />
        ))}
      </View>

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
          source={{ uri: profile.images[0] ?? FALLBACK_PROFILE_IMAGE }}
          style={[styles.profileImage, { width: cardWidth }]}
          imageStyle={styles.profileImageRadius}
        >
          <ProfileCardGradient />
        </ImageBackground>

        <Pressable style={styles.profileInfo} onPress={onPress}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>
              {profile.name} {profile.age}
            </Text>
            <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={18} color="#FFFFFF" />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
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
    justifyContent: "space-between",
  },
  clubCategoryItem: {
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
  clubCategoryIcon: {
    width: 52,
    height: 52,
  },
  clubCategoryLabel: {
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
