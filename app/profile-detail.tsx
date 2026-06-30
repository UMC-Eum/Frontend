import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

import { Chip } from "@/components/Chip";
import Cta from "@/components/Cta";
import { useCreateChatRoomMutation } from "@/hooks/api/useChats";
import {
  useBlockUserMutation,
  useCreateReportMutation,
  useSendHeartMutation,
} from "@/hooks/api/useSocials";
import { useUserProfileQuery } from "@/hooks/api/useUsers";
import type { IUserProfile } from "@/types/user";

const FALLBACK_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=1200&auto=format&fit=crop";

type ProfileDetailParams = {
  userId?: string | string[];
  name?: string | string[];
  age?: string | string[];
  image?: string | string[];
  location?: string | string[];
  intro?: string | string[];
  isLiked?: string | string[];
};

type ProfileViewData = {
  name: string;
  age: number | null;
  location: string;
  distance: string;
  intro: string;
  image: string;
  interests: string[];
  preferences: string[];
  joinedClubs: ProfileClub[];
  hostedClubs: ProfileClub[];
};

type ProfileClub = {
  id: string;
  title: string;
  location: string;
  category: string;
  memberLabel: string;
};

// TODO: 프로필 상세 조회 API가 준비되면 목데이터와 USE_PROFILE_DETAIL_MOCK 분기를 제거합니다.
const USE_PROFILE_DETAIL_MOCK = true;

const MOCK_PROFILE_DETAIL: ProfileViewData = {
  name: "루시",
  age: 55,
  location: "서울시 서대문구",
  distance: "7km",
  intro:
    "안녕하세요.\n하루를 마무리하며 나누는 소소한 대화를 좋아합니다. 서두르지 않고, 편안하게 이야기할 수 있는 인연을 만나고 싶어요. 먼저 대화를 주도하는 편입니다! 친하게 지내봐요 ㅎㅎ",
  image:
    "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=85&w=1200&auto=format&fit=crop",
  interests: ["헬스", "요리", "여행", "음악듣기"],
  preferences: ["귀여운", "다정한", "친절한", "가까이 사는", "솔직한", "친절한"],
  joinedClubs: [
    {
      id: "joined-1",
      title: "새벽 등산 동호회",
      location: "서울시 서대문구",
      category: "루씨",
      memberLabel: "6명 참석중 (6/15)",
    },
    {
      id: "joined-2",
      title: "새벽 등산 동호회",
      location: "서울시 서대문구",
      category: "루씨",
      memberLabel: "6명 참석중 (6/15)",
    },
  ],
  hostedClubs: [
    {
      id: "hosted-1",
      title: "새벽 등산 동호회",
      location: "서울시 서대문구",
      category: "루씨",
      memberLabel: "6명 참석중 (6/15)",
    },
    {
      id: "hosted-2",
      title: "새벽 등산 동호회",
      location: "서울시 서대문구",
      category: "루씨",
      memberLabel: "6명 참석중 (6/15)",
    },
  ],
};

export default function ProfileDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ProfileDetailParams>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const userId = parsePositiveInt(firstParam(params.userId));
  const fallbackProfile = useMemo(() => mapParamsToProfile(params), [params]);
  const profileQuery = useUserProfileQuery(USE_PROFILE_DETAIL_MOCK ? null : userId);
  const profile = useMemo(
    () =>
      USE_PROFILE_DETAIL_MOCK
        ? MOCK_PROFILE_DETAIL
        : mapProfileToViewData(profileQuery.data, fallbackProfile),
    [fallbackProfile, profileQuery.data],
  );
  const [liked, setLiked] = useState(
    USE_PROFILE_DETAIL_MOCK || firstParam(params.isLiked) === "true",
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const sendHeartMutation = useSendHeartMutation();
  const createChatRoomMutation = useCreateChatRoomMutation();
  const blockUserMutation = useBlockUserMutation();
  const createReportMutation = useCreateReportMutation();

  const getTargetUserId = () => {
    if (userId) return userId;

    Alert.alert("프로필 정보를 확인할 수 없어요", "사용자 ID가 없어 다시 시도해주세요.");
    return null;
  };

  const handleToggleLike = () => {
    if (!USE_PROFILE_DETAIL_MOCK && !liked && userId) {
      sendHeartMutation.mutate(userId);
    }

    setLiked((prev) => !prev);
  };

  const handleShareProfile = async () => {
    const targetUserId = getTargetUserId();
    if (!targetUserId) return;

    const profileUrl = Linking.createURL("/profile-detail", {
      queryParams: { userId: String(targetUserId) },
    });
    const profileName = profile?.name ?? "상대";

    try {
      await Share.share({
        title: `${profileName}님의 프로필`,
        message: `${profileName}님의 프로필을 확인해보세요.\n${profileUrl}`,
        url: profileUrl,
      });
    } catch {
      Alert.alert("공유 실패", "프로필을 공유하지 못했어요.");
    }
  };

  const handleStartChat = async () => {
    const targetUserId = getTargetUserId();
    if (!targetUserId || createChatRoomMutation.isPending) return;

    try {
      const room = await createChatRoomMutation.mutateAsync({ targetUserId });
      router.push({
        pathname: "/chat/[id]",
        params: { id: String(room.chatRoomId) },
      } as never);
    } catch {
      Alert.alert("대화 시작 실패", "대화방을 여는 중 문제가 발생했어요.");
    }
  };

  const handleReportProfile = () => {
    const targetUserId = getTargetUserId();
    if (!targetUserId || createReportMutation.isPending) return;

    Alert.alert("신고하기", "이 사용자를 신고할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "신고하기",
        style: "destructive",
        onPress: () => {
          createReportMutation.mutate(
            {
              targetUserId,
              category: "PROFILE",
              reason: "프로필 상세에서 신고",
            },
            {
              onSuccess: () => Alert.alert("신고가 접수되었습니다"),
              onError: () => Alert.alert("신고 실패", "잠시 후 다시 시도해주세요."),
            },
          );
        },
      },
    ]);
  };

  const handleBlockProfile = () => {
    const targetUserId = getTargetUserId();
    if (!targetUserId || blockUserMutation.isPending) return;

    Alert.alert("차단하기", "이 사용자를 차단할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "차단하기",
        style: "destructive",
        onPress: () => {
          blockUserMutation.mutate(
            {
              targetUserId,
              reason: "프로필 상세에서 차단",
            },
            {
              onSuccess: () => Alert.alert("차단되었습니다"),
              onError: () => Alert.alert("차단 실패", "잠시 후 다시 시도해주세요."),
            },
          );
        },
      },
    ]);
  };

  if (!profile && profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <ActivityIndicator color="#FF3E70" />
          <Text style={styles.stateText}>프로필을 불러오는 중이에요</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topActionsStatic}>
          <TouchableOpacity
            style={styles.iconButtonDark}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color="#202020" />
          </TouchableOpacity>
        </View>
        <View style={styles.stateWrap}>
          <Text style={styles.stateTitle}>프로필 정보를 불러올 수 없어요</Text>
          <Text style={styles.stateText}>다시 시도해주세요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 104 },
        ]}
      >
        {/* 프로필 대표 사진과 상단 액션 영역입니다. */}
        <ImageBackground
          source={{ uri: profile.image }}
          style={[styles.hero, { height: Math.round(windowHeight * 0.665) }]}
          imageStyle={styles.heroImage}
        >
          <View style={[styles.topActions, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={handleShareProfile}
              >
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => setMenuVisible(true)}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroGradient} />

          <View style={styles.profileSummary}>
            <ProfileHeroMeta profile={profile} />
            <HeroLikeButton liked={liked} onPress={handleToggleLike} />
          </View>

          <View style={styles.pagination}>
            <View style={styles.activeDot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </ImageBackground>

        {/* 소개와 사용자 성향을 카드/칩 형태로 보여주는 본문입니다. */}
        <View style={styles.content}>
          <SectionTitle title="소개" />
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              {profile.intro || "아직 작성된 소개가 없어요."}
            </Text>
          </View>

          <ProfileChipSection
            title="저의 관심사에요."
            items={profile.interests}
            activeIndices={[0]}
          />
          <ProfileChipSection
            title="이런 사람이 좋아요."
            items={profile.preferences}
            activeIndices={[1, 2]}
          />

          <View style={styles.bodyDivider} />

          <ProfileClubSection
            title="이런 동호회를 참여하고있어요"
            clubs={profile.joinedClubs}
          />
          <ProfileClubSection
            title="이런 동호회를 운영해요"
            clubs={profile.hostedClubs}
          />
        </View>
      </ScrollView>

      <Cta
        label={createChatRoomMutation.isPending ? "대화방 여는 중..." : "바로 대화하기"}
        onPress={handleStartChat}
        disabled={createChatRoomMutation.isPending}
        containerStyle={styles.ctaWrap}
        buttonStyle={styles.ctaButton}
        labelStyle={styles.ctaText}
      />

      <ActionSheetModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onReport={() => {
          setMenuVisible(false);
          handleReportProfile();
        }}
        onBlock={() => {
          setMenuVisible(false);
          handleBlockProfile();
        }}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ProfileHeroMeta({ profile }: { profile: ProfileViewData }) {
  return (
    <View style={styles.heroMeta}>
      <View style={styles.nameRow}>
        <Text style={styles.profileName}>{profile.name}</Text>
        {profile.age ? <Text style={styles.profileName}>{profile.age}</Text> : null}
        <View style={styles.verifiedIconWrap}>
          <VerifiedBadgeIcon />
        </View>
      </View>

      {profile.location ? (
        <View style={styles.locationRow}>
          <View style={styles.locationIconBox}>
            <Ionicons name="location-sharp" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.locationTextRow}>
            <Text style={styles.locationText}>{profile.location}</Text>
            {profile.distance ? (
              <>
                <View style={styles.locationDotBox}>
                  <View style={styles.locationDot} />
                </View>
                <Text style={styles.locationText}>{profile.distance}</Text>
              </>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function VerifiedBadgeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M8.82134 0.358948C9.26152 -0.119656 10.0169 -0.119643 10.4571 0.358948L11.4698 1.45953C11.7482 1.76226 12.1715 1.88692 12.5694 1.78278L14.0167 1.40387C14.6455 1.2394 15.2809 1.64731 15.3926 2.28766L15.6495 3.76227C15.7202 4.16722 16.0086 4.50006 16.3995 4.6275L17.8213 5.09137C18.4394 5.2929 18.7532 5.97956 18.501 6.57867L17.92 7.95758C17.7603 8.33654 17.8231 8.77272 18.0831 9.09137L19.0284 10.2505C19.4395 10.7544 19.3323 11.5021 18.796 11.8697L17.5616 12.7154C17.2225 12.9479 17.0396 13.3489 17.086 13.7574L17.2549 15.2437C17.3284 15.8898 16.8336 16.4608 16.1836 16.48L14.6885 16.524C14.2776 16.5362 13.9065 16.7744 13.7247 17.1431L13.0635 18.4849C12.776 19.0682 12.0514 19.2811 11.4942 18.9459L10.212 18.1754C9.85955 17.9634 9.41886 17.9633 9.06646 18.1754L7.78521 18.9459C7.22802 19.2811 6.50338 19.0682 6.21588 18.4849L5.55377 17.1431C5.37184 16.7745 5.00085 16.5362 4.5899 16.524L3.09478 16.48C2.44497 16.4606 1.95007 15.8897 2.02349 15.2437L2.19341 13.7574C2.23986 13.3487 2.05611 12.9479 1.71685 12.7154L0.483454 11.8697C-0.0529125 11.5021 -0.160995 10.7544 0.250055 10.2505L1.19634 9.09137C1.45616 8.77273 1.51908 8.33647 1.35943 7.95758L0.778375 6.57867C0.526138 5.97953 0.839965 5.29291 1.45806 5.09137L2.87994 4.6275C3.27079 4.50004 3.55924 4.16723 3.62994 3.76227L3.88677 2.28766C3.99851 1.64727 4.63382 1.23925 5.26275 1.40387L6.71002 1.78278C7.10782 1.88683 7.53027 1.76217 7.80865 1.45953L8.82134 0.358948ZM13.3858 7.29742C13.0605 6.97209 12.5325 6.97229 12.2071 7.29742L8.58697 10.9156L7.07232 9.40094C6.74708 9.07609 6.21995 9.07629 5.89459 9.40094C5.56915 9.72638 5.56915 10.2542 5.89459 10.5797L7.9981 12.6841C8.3235 13.0095 8.85138 13.0094 9.17681 12.6841L13.3858 8.47516C13.7104 8.1498 13.7106 7.62267 13.3858 7.29742Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function HeroLikeButton({
  liked,
  onPress,
}: {
  liked: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.likeButton}
      activeOpacity={0.82}
      onPress={onPress}
    >
      <HeroHeartIcon liked={liked} />
    </TouchableOpacity>
  );
}

function HeroHeartIcon({ liked }: { liked: boolean }) {
  const heartFill = liked ? "#FF3E70" : "none";
  const heartStroke = liked ? "#FF3E70" : "#FFFFFF";

  return (
    <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <Rect width={64} height={64} rx={32} fill="#FFFFFF" fillOpacity={0.24} />
      <G clipPath="url(#profileDetailHeartClip)">
        <Path
          d="M36.8887 22.7959C40.0095 22.796 42.5 25.3821 42.5 28.6377C42.5 30.1513 41.9616 31.4535 41.0312 32.7412C40.0978 34.0332 38.7757 35.3015 37.2188 36.749L37.2168 36.751L33.0645 40.5625C32.8625 40.7479 32.7147 40.8825 32.5908 40.9795C32.4631 41.0795 32.3683 41.1336 32.2754 41.1621C32.0957 41.2171 31.9033 41.2171 31.7236 41.1621C31.6307 41.1336 31.5359 41.0794 31.4082 40.9795C31.3463 40.931 31.2788 40.8726 31.2012 40.8037L30.9346 40.5625L26.7812 36.751H26.7822L26.7803 36.749C25.2236 35.3017 23.9022 34.0331 22.9688 32.7412C22.0384 31.4535 21.5 30.1513 21.5 28.6377C21.5 25.3822 23.9897 22.7961 27.1104 22.7959C28.7065 22.7959 30.1307 23.4687 31.1465 24.5586C31.3672 24.7954 31.6763 24.9297 32 24.9297C32.3235 24.9296 32.6329 24.7953 32.8535 24.5586C33.8693 23.4689 35.2927 22.7959 36.8887 22.7959Z"
          fill={heartFill}
          stroke={heartStroke}
          strokeWidth={2.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="profileDetailHeartClip">
          <Rect
            width={23.3333}
            height={23.3333}
            fill="#FFFFFF"
            transform="translate(20.333 20.333)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

function ProfileChipSection({
  title,
  items,
  activeIndices,
}: {
  title: string;
  items: string[];
  activeIndices: number[];
}) {
  if (items.length === 0) return null;

  return (
    <>
      <SectionTitle title={title} />
      <View style={styles.chipList}>
        {items.map((item, index) => {
          const isActive = activeIndices.includes(index);

          return (
            <Chip
              key={`${item}-${index}`}
              label={item}
              variant={isActive ? "outlineActive" : "outline"}
              shape="rect"
              size="small"
              style={StyleSheet.flatten([
                styles.profileChip,
                isActive ? styles.profileChipActive : styles.profileChipInactive,
              ])}
              textStyle={StyleSheet.flatten([
                styles.profileChipText,
                isActive ? styles.profileChipTextActive : styles.profileChipTextInactive,
              ])}
            />
          );
        })}
      </View>
    </>
  );
}

function ProfileClubSection({
  title,
  clubs,
}: {
  title: string;
  clubs: ProfileClub[];
}) {
  if (clubs.length === 0) return null;

  return (
    <View style={styles.clubSection}>
      <SectionTitle title={title} />
      {clubs.map((club) => (
        <View key={club.id} style={styles.clubCard}>
          <View style={styles.clubThumbnail} />
          <View style={styles.clubInfo}>
            <Text style={styles.clubTitle} numberOfLines={1}>
              {club.title}
            </Text>
            <Text style={styles.clubMeta} numberOfLines={1}>
              {club.location} · {club.category}
            </Text>
            <View style={styles.memberRow}>
              <Ionicons name="person" size={18} color="#A6AFB6" />
              <Text style={styles.memberText}>{club.memberLabel}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function firstParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePositiveInt(value?: string) {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function mapParamsToProfile(params: ProfileDetailParams): ProfileViewData | null {
  const name = firstParam(params.name);
  const image = firstParam(params.image);
  const age = normalizeAge(firstParam(params.age));

  if (!name && !image && !age) return null;

  return {
    name: name || "프로필",
    age,
    location: firstParam(params.location) ?? "",
    distance: "",
    intro: firstParam(params.intro) ?? "",
    image: image || FALLBACK_PROFILE_IMAGE,
    interests: [],
    preferences: [],
    joinedClubs: [],
    hostedClubs: [],
  };
}

function mapProfileToViewData(
  profile: IUserProfile | undefined,
  fallback: ProfileViewData | null,
): ProfileViewData | null {
  if (!profile) return fallback;

  return {
    name: profile.nickname || fallback?.name || "프로필",
    age: normalizeAge(profile.age, profile.birthDate) ?? fallback?.age ?? null,
    location: profile.area?.name || fallback?.location || "",
    distance: fallback?.distance || "",
    intro: profile.introText || fallback?.intro || "",
    image: profile.profileImageUrl || fallback?.image || FALLBACK_PROFILE_IMAGE,
    interests: profile.keywords ?? [],
    preferences: profile.idealPersonalities ?? [],
    joinedClubs: fallback?.joinedClubs ?? [],
    hostedClubs: fallback?.hostedClubs ?? [],
  };
}

function normalizeAge(age?: number | string | null, birthDate?: string | null) {
  const parsedAge =
    typeof age === "string" && age.trim() ? Number(age) : age;

  if (
    typeof parsedAge === "number" &&
    Number.isFinite(parsedAge) &&
    parsedAge > 0
  ) {
    return Math.floor(parsedAge);
  }

  if (!birthDate) return null;

  const birthday = new Date(birthDate);
  if (Number.isNaN(birthday.getTime())) return null;

  const today = new Date();
  let calculatedAge = today.getFullYear() - birthday.getFullYear();
  const birthdayThisYear = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate(),
  );

  if (today < birthdayThisYear) calculatedAge -= 1;

  return calculatedAge > 0 ? calculatedAge : null;
}

function ActionSheetModal({
  visible,
  onClose,
  onReport,
  onBlock,
}: {
  visible: boolean;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.actionSheet}>
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.75}
              onPress={onReport}
            >
              <Text style={styles.reportText}>신고하기</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.75}
              onPress={onBlock}
            >
              <Text style={styles.actionText}>차단하기</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.75}
            onPress={onClose}
          >
            <Text style={styles.actionText}>취소</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    backgroundColor: "#FFFFFF",
  },
  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202020",
  },
  stateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#636970",
    textAlign: "center",
  },
  topActionsStatic: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  iconButtonDark: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
  },
  hero: {
    justifyContent: "flex-end",
    backgroundColor: "#D9D9D9",
  },
  heroImage: {
    resizeMode: "cover",
  },
  topActions: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.14)",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  profileSummary: {
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  heroMeta: {
    alignItems: "flex-start",
    gap: 8,
    flexShrink: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  verifiedIconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 24,
  },
  locationIconBox: {
    width: 14,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  locationTextRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 24,
  },
  locationText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  locationDotBox: {
    width: 16,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  locationDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.24)",
  },
  pagination: {
    position: "absolute",
    bottom: 22,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.48)",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
    color: "#202020",
  },
  introCard: {
    padding: 20,
    marginBottom: 32,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#636970",
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  profileChip: {
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  profileChipActive: {
    backgroundColor: "#FFE3E7",
    borderWidth: 0,
  },
  profileChipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE3E5",
  },
  profileChipText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  profileChipTextActive: {
    color: "#FC3367",
  },
  profileChipTextInactive: {
    color: "#636970",
  },
  bodyDivider: {
    height: 40,
    marginHorizontal: -20,
    marginTop: -8,
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 8,
    borderTopColor: "#F8FAFB",
  },
  clubSection: {
    marginBottom: 32,
  },
  clubCard: {
    minHeight: 124,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  clubThumbnail: {
    width: 82,
    height: 82,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: "#D9D9D9",
  },
  clubInfo: {
    flex: 1,
  },
  clubTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#202020",
  },
  clubMeta: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#636970",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  memberText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#A6AFB6",
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E9ECED",
    backgroundColor: "#FFFFFF",
  },
  ctaButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3E70",
  },
  ctaText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 48,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  actionSheet: {
    gap: 12,
  },
  actionGroup: {
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  actionItem: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDivider: {
    height: 1,
    backgroundColor: "#EEF0F2",
  },
  actionText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#202020",
  },
  reportText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#FC3367",
  },
  cancelButton: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
});
