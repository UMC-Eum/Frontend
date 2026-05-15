import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
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

import { Navbar } from "@/components/Navbar";
import {
  useRecommendationsInfiniteQuery,
  useSendRecommendationHeartMutation,
} from "@/hooks/api/useRecommendations";
import { useMyProfileQuery } from "@/hooks/api/useUsers";

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
};

type Viewer = {
  id: string;
  name: string;
  age: number;
  image: string;
};

const USER_NICKNAME = "루씨";
const FALLBACK_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=1200&auto=format&fit=crop";

const RECOMMENDED_PROFILES: Profile[] = [
  {
    id: "profile-1",
    name: "김철수",
    age: 67,
    location: "서울 광진구",
    intro: "저는 산책하는걸 즐기는 사람입니다!~~",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=85&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=85&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=85&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: "profile-2",
    name: "박영희",
    age: 63,
    location: "서울 성동구",
    intro: "따뜻한 차 한잔과 동네 산책을 좋아해요.",
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=85&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=85&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=85&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: "profile-3",
    name: "이상민",
    age: 69,
    location: "서울 송파구",
    intro: "주말마다 한강을 걷고 사진을 찍습니다.",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=85&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=85&w=1200&auto=format&fit=crop",
    ],
  },
];

const PROFILE_VIEWERS: Viewer[] = [
  {
    id: "viewer-1",
    name: "김성욱",
    age: 64,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=85&w=300&auto=format&fit=crop",
  },
  {
    id: "viewer-2",
    name: "김성욱",
    age: 64,
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=85&w=300&auto=format&fit=crop",
  },
  {
    id: "viewer-3",
    name: "김성욱",
    age: 64,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=85&w=300&auto=format&fit=crop",
  },
  {
    id: "viewer-4",
    name: "김성욱",
    age: 64,
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=85&w=300&auto=format&fit=crop",
  },
];

const getCountdownText = () => {
  const now = new Date();
  const nextNoon = new Date(now);
  nextNoon.setHours(12, 0, 0, 0);

  if (now.getTime() >= nextNoon.getTime()) {
    nextNoon.setDate(nextNoon.getDate() + 1);
  }

  const remainingSeconds = Math.max(
    0,
    Math.floor((nextNoon.getTime() - now.getTime()) / 1000),
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
  const profileImageScrollRef = useRef<ScrollView>(null);
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTab>("home");
  const [profileIndex, setProfileIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [countdown, setCountdown] = useState(getCountdownText);
  const [, setLikedCount] = useState(0);
  const myProfileQuery = useMyProfileQuery();
  const recommendationsQuery = useRecommendationsInfiniteQuery();
  const sendHeartMutation = useSendRecommendationHeartMutation();

  const recommendedProfiles = mapRecommendationProfiles(recommendationsQuery.data);
  const isRecommendationFallback =
    __DEV__ &&
    recommendationsQuery.isError &&
    recommendedProfiles.length === 0;
  const profiles = isRecommendationFallback
    ? RECOMMENDED_PROFILES
    : recommendedProfiles;
  const profile = profiles[profileIndex % profiles.length];
  const nickname = myProfileQuery.data?.nickname ?? USER_NICKNAME;
  const cardWidth = width - 40;

  // 실시간 추천 마감 카운트다운을 1초마다 갱신합니다.
  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdownText()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 프로필이 바뀌면 사진 슬라이더를 첫 장으로 초기화합니다.
  useEffect(() => {
    setImageIndex(0);
    profileImageScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [profileIndex]);

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

  // 사진 슬라이더의 현재 페이지를 점 인디케이터와 동기화합니다.
  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.min(
      profile.images.length - 1,
      Math.max(0, Math.round(event.nativeEvent.contentOffset.x / cardWidth)),
    );
    setImageIndex(nextIndex);
  };

  // 별로예요를 누르면 다음 추천 프로필로 넘깁니다.
  const handleDislike = () => {
    setProfileIndex((prev) => {
      const nextIndex = (prev + 1) % profiles.length;

      if (
        nextIndex >= profiles.length - 2 &&
        recommendationsQuery.hasNextPage &&
        !recommendationsQuery.isFetchingNextPage
      ) {
        recommendationsQuery.fetchNextPage();
      }

      return nextIndex;
    });
  };

  // 마음이들어요를 누르면 내부 카운트를 올리고 마음 탭으로 이동합니다.
  const handleLike = () => {
    setLikedCount((prev) => prev + 1);
    if (profile.targetUserId) {
      sendHeartMutation.mutate(profile.targetUserId);
    }
    router.push("/(tabs)/heart" as never);
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
            <Pressable
              style={styles.headerIconButton}
              onPress={() => router.push("/(tabs)" as never)}
              hitSlop={10}
            >
              <Ionicons name="notifications-outline" size={23} color={BLACK} />
            </Pressable>
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

          {/* 오늘 추천 영역: 제목과 실시간 카운트다운을 한 줄에 배치합니다. */}
          <View style={styles.recommendHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles" size={16} color={PINK} />
              <Text style={styles.sectionTitle}>오늘의 이상형 추천</Text>
            </View>
            <View style={styles.countdownRow}>
              <Text style={styles.countdown}>{countdown}</Text>
              <Ionicons name="help-circle-outline" size={14} color={GRAY} />
            </View>
          </View>

          <ProfileCard
            profile={profile}
            cardWidth={cardWidth}
            imageIndex={imageIndex}
            scrollRef={profileImageScrollRef}
            onImageScroll={handleImageScroll}
            onPress={() => router.push("/profile-detail" as never)}
            onDislike={handleDislike}
            onLike={handleLike}
          />

          {/* 내 프로필 조회자 목록입니다. */}
          <View style={styles.viewerSection}>
            <Text style={styles.viewerTitle}>내 프로필을 본 인연들</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.viewerList}
            >
              {PROFILE_VIEWERS.map((viewer) => (
                <Pressable
                  key={viewer.id}
                  style={styles.viewerCard}
                  onPress={() => router.push("/profile-detail" as never)}
                >
                  <Image source={{ uri: viewer.image }} style={styles.viewerImage} />
                  <Text style={styles.viewerName} numberOfLines={1}>
                    {viewer.name} <Text style={styles.viewerDot}>·</Text>{" "}
                    <Text style={styles.viewerAge}>{viewer.age}</Text>
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* 음성 입력 FAB: 스크롤 방향에 따라 opacity/translateY가 바뀝니다. */}
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
      </View>

      {/* 개발 확인 화면에서도 메인 탭과 동일한 하단 네비게이션을 보여줍니다. */}
      <View style={styles.navbarWrap}>
        <Navbar
          tabs={[
            { id: "index", iconName: "home", label: "홈" },
            { id: "heart", iconName: "heart", label: "마음", hasDotBadge: true },
            { id: "chat", iconName: "chat", label: "대화", badgeCount: 100 },
            { id: "my", iconName: "person", label: "마이" },
          ]}
          activeTabId="index"
          onTabPress={(id) => {
            if (id === "index") {
              router.push("/home" as never);
              return;
            }

            router.push(`/(tabs)/${id}` as never);
          }}
          activeColor="#1F2937"
          inactiveColor="#9CA3AF"
        />
      </View>
    </SafeAreaView>
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
    }[];
  }[];
}): Profile[] {
  return (
    data?.pages.flatMap((page) =>
      page.items.map((item) => ({
        id: `recommendation-${item.userId}`,
        targetUserId: item.userId,
        name: item.nickname,
        age: item.age,
        location: item.areaName,
        intro: item.introText,
        images: item.profileImageUrl ? [item.profileImageUrl] : [FALLBACK_PROFILE_IMAGE],
      })),
    ) ?? []
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
      {isActive ? <View style={styles.homeTabUnderline} /> : null}
    </Pressable>
  );
}

type ProfileCardProps = {
  profile: Profile;
  cardWidth: number;
  imageIndex: number;
  scrollRef: React.RefObject<ScrollView | null>;
  onImageScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onPress: () => void;
  onDislike: () => void;
  onLike: () => void;
};

function ProfileCard({
  profile,
  cardWidth,
  imageIndex,
  scrollRef,
  onImageScroll,
  onPress,
  onDislike,
  onLike,
}: ProfileCardProps) {
  return (
    <View style={styles.profileCard}>
      {/* 프로필 카드는 사진 스와이프와 상세 진입을 함께 제공합니다. */}
      <View style={styles.profilePressable}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          directionalLockEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={onImageScroll}
          onMomentumScrollEnd={onImageScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled
        >
          {profile.images.map((image) => (
            <ImageBackground
              key={image}
              source={{ uri: image }}
              style={[styles.profileImage, { width: cardWidth }]}
              imageStyle={styles.profileImageRadius}
            >
              <View style={styles.imageScrim} />
            </ImageBackground>
          ))}
        </ScrollView>

        <View style={styles.imageDots}>
          {profile.images.map((image, index) => (
            <View
              key={`${image}-dot`}
              style={[styles.imageDot, index === imageIndex && styles.imageDotActive]}
            />
          ))}
        </View>

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
          <Text style={styles.dislikeText}>별로예요</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.likeButton]} onPress={onLike}>
          <Text style={styles.likeText}>마음이들어요</Text>
        </Pressable>
      </View>
    </View>
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
    paddingBottom: 32,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#737780",
  },
  homeTabTextActive: {
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
  recommendHeader: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: BLACK,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  countdown: {
    marginRight: 4,
    fontSize: 12,
    lineHeight: 18,
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
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: LIGHT_GRAY,
  },
  profileImage: {
    height: 492,
    justifyContent: "flex-end",
  },
  profileImageRadius: {
    borderRadius: 12,
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  imageDots: {
    position: "absolute",
    top: 17,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
    backgroundColor: "#E0E0E0",
  },
  imageDotActive: {
    backgroundColor: PINK,
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
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  locationRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  introText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
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
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: "700",
    color: "#6F7780",
  },
  likeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  viewerSection: {
    paddingTop: 32,
  },
  viewerTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: BLACK,
  },
  viewerList: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  viewerCard: {
    width: 84,
  },
  viewerImage: {
    width: "100%",
    height: 84,
    borderRadius: 10,
    backgroundColor: LIGHT_GRAY,
  },
  viewerName: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: BLACK,
  },
  viewerDot: {
    fontWeight: "500",
    color: "#616872",
  },
  viewerAge: {
    fontWeight: "500",
    color: "#616872",
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
  navbarWrap: {
    backgroundColor: "#FFFFFF",
  },
});
