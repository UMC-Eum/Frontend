import { Ionicons } from "@expo/vector-icons";
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";
import { useSendHeartMutation } from "@/hooks/api/useSocials";
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
  intro: string;
  image: string;
  interests: string[];
  preferences: string[];
};

export default function ProfileDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ProfileDetailParams>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const userId = parsePositiveInt(firstParam(params.userId));
  const fallbackProfile = useMemo(() => mapParamsToProfile(params), [params]);
  const profileQuery = useUserProfileQuery(userId);
  const profile = useMemo(
    () => mapProfileToViewData(profileQuery.data, fallbackProfile),
    [fallbackProfile, profileQuery.data],
  );
  const [liked, setLiked] = useState(firstParam(params.isLiked) === "true");
  const [menuVisible, setMenuVisible] = useState(false);
  const sendHeartMutation = useSendHeartMutation();

  const handleComingSoon = (message: string) => {
    Alert.alert(message);
  };

  const handleToggleLike = () => {
    if (!liked && userId) {
      sendHeartMutation.mutate(userId);
    }

    setLiked((prev) => !prev);
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

  const ageLabel = profile.age ? `${profile.age}세` : null;

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
                onPress={() => handleComingSoon("공유 기능은 준비 중입니다.")}
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
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  {ageLabel ? `${profile.name} ${ageLabel}` : profile.name}
                </Text>
                <Ionicons name="checkmark-circle" size={18} color="#FF3E70" />
              </View>
              {profile.location ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-sharp" size={18} color="#FFFFFF" />
                  <Text style={styles.locationText}>{profile.location}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.likeButton}
              activeOpacity={0.82}
              onPress={handleToggleLike}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={28}
                color="#FF3E70"
              />
            </TouchableOpacity>
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

          <ProfileChipSection title="저의 관심사에요." items={profile.interests} />
          <ProfileChipSection title="이런 사람이 좋아요." items={profile.preferences} />
        </View>
      </ScrollView>

      {/* 스크롤 위치와 상관없이 하단에 붙어 있는 CTA입니다. */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => handleComingSoon("대화 기능은 준비 중입니다.")}
        >
          <Text style={styles.ctaText}>바로 대화하기</Text>
        </TouchableOpacity>
      </View>

      <ActionSheetModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onReport={() => {
          setMenuVisible(false);
          handleComingSoon("신고 기능은 준비 중입니다.");
        }}
        onBlock={() => {
          setMenuVisible(false);
          handleComingSoon("차단 기능은 준비 중입니다.");
        }}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ProfileChipSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <>
      <SectionTitle title={title} />
      <View style={styles.chipList}>
        {items.map((item, index) => (
          <Chip
            key={`${item}-${index}`}
            label={item}
            variant={index === 0 ? "outlineActive" : "outline"}
            shape="rect"
            size="small"
            style={styles.profileChip}
            textStyle={styles.profileChipText}
          />
        ))}
      </View>
    </>
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
    intro: firstParam(params.intro) ?? "",
    image: image || FALLBACK_PROFILE_IMAGE,
    interests: [],
    preferences: [],
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
    intro: profile.introText || fallback?.intro || "",
    image: profile.profileImageUrl || fallback?.image || FALLBACK_PROFILE_IMAGE,
    interests: profile.keywords ?? [],
    preferences: profile.idealPersonalities ?? [],
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
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 46,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#FFFFFF",
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
    paddingTop: 24,
  },
  sectionTitle: {
    marginBottom: 14,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
    color: "#202020",
  },
  introCard: {
    minHeight: 118,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 26,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    backgroundColor: "#FFFFFF",
  },
  introText: {
    fontSize: 13,
    lineHeight: 23,
    fontWeight: "500",
    color: "#636970",
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 26,
  },
  profileChip: {
    minHeight: 34,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  profileChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    height: 8,
    marginTop: 2,
    backgroundColor: "#F4F6F8",
  },
  clubCard: {
    minHeight: 122,
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
    marginRight: 14,
    backgroundColor: "#D9D9D9",
  },
  clubInfo: {
    flex: 1,
  },
  clubTitle: {
    marginBottom: 7,
    fontSize: 18,
    fontWeight: "600",
    color: "#202020",
  },
  clubMeta: {
    marginBottom: 11,
    fontSize: 14,
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
    fontWeight: "500",
    color: "#A6AFB6",
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: "#FFFFFF",
  },
  ctaButton: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3E70",
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingBottom: 32,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  actionSheet: {
    gap: 8,
  },
  actionGroup: {
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  actionItem: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDivider: {
    height: 1,
    backgroundColor: "#EEF0F2",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#202020",
  },
  reportText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FC3367",
  },
  cancelButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
});
