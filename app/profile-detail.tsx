import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
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
import { useCreateChatRoomMutation } from "@/hooks/api/useChats";
import { useRecommendationsInfiniteQuery } from "@/hooks/api/useRecommendations";
import {
  useBlockUserMutation,
  useCreateReportMutation,
  usePatchHeartMutation,
  useSendHeartMutation,
} from "@/hooks/api/useSocials";
import type { ReportCategory } from "@/types/api/socials/socialsDTO";

const PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85&auto=format&fit=crop";

type DetailProfile = {
  targetUserId?: number;
  chatRoomId?: number | null;
  name: string;
  age: number;
  location: string;
  distance: string;
  intro: string;
  interests: string[];
  preferences: string[];
  image: string;
  isLiked: boolean;
  likedHeartId: number | null;
};

const FALLBACK_PROFILE: DetailProfile = {
  name: "루시",
  age: 55,
  location: "서울시 서대문구",
  distance: "7km",
  intro:
    "안녕하세요.\n하루를 마무리하며 나누는 소소한 대화를 좋아합니다. 서두르지 않고, 편안하게 이야기할 수 있는 인연을 만나고 싶어요. 먼저 대화를 주도하는 편입니다! 친해져 지내봐요 ㅎㅎ",
  interests: ["헬스", "요리", "여행", "음악듣기"],
  preferences: ["귀여운", "다정한", "친절한", "가까이 사는", "솔직한", "친절한"],
  image: PROFILE_IMAGE,
  isLiked: false,
  likedHeartId: null,
};

const REPORT_CATEGORIES: { label: string; value: ReportCategory }[] = [
  { label: "불쾌한 메세지", value: "Inappropriate" },
  { label: "성희롱/성적 표현", value: "Sexual" },
  { label: "사기/금전 요구", value: "Fraud" },
  { label: "욕설/비하/혐오", value: "Abusive" },
  { label: "스팸/광고", value: "Spam" },
  { label: "기타", value: "Other" },
];

export default function ProfileDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    targetUserId?: string;
    chatRoomId?: string;
    heartId?: string;
    isLiked?: string;
    name?: string;
    age?: string;
    location?: string;
    intro?: string;
    image?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const recommendationsQuery = useRecommendationsInfiniteQuery();
  const sendHeartMutation = useSendHeartMutation();
  const patchHeartMutation = usePatchHeartMutation();
  const createChatRoomMutation = useCreateChatRoomMutation();
  const blockUserMutation = useBlockUserMutation();
  const createReportMutation = useCreateReportMutation();

  const targetUserId = parseOptionalNumber(params.targetUserId);
  const routeChatRoomId = parseOptionalNumber(params.chatRoomId);
  const routeHeartId = parseOptionalNumber(params.heartId);
  const routeLiked = parseOptionalBoolean(params.isLiked);
  const apiProfile = useMemo(
    () => mapRecommendationDetailProfile(recommendationsQuery.data, targetUserId),
    [recommendationsQuery.data, targetUserId],
  );
  const routeProfile = useMemo(
    () => mapRouteDetailProfile(params, targetUserId, routeChatRoomId),
    [params, routeChatRoomId, targetUserId],
  );
  const profile = apiProfile ?? routeProfile ?? FALLBACK_PROFILE;
  const chatRoomId = profile.chatRoomId ?? routeChatRoomId ?? null;
  const [liked, setLiked] = useState(profile.isLiked);
  const [likedHeartId, setLikedHeartId] = useState(profile.likedHeartId);
  const isHeartPending = sendHeartMutation.isPending || patchHeartMutation.isPending;
  const locationText = profile.distance
    ? `${profile.location} · ${profile.distance}`
    : profile.location;
  const summaryCardWidth = Math.min(Math.max(windowWidth - 40, 280), 372);
  const summaryCardHeight = Math.round(summaryCardWidth * (472 / 372));

  useEffect(() => {
    setLiked(apiProfile?.isLiked ?? routeLiked ?? profile.isLiked);
    setLikedHeartId(apiProfile?.likedHeartId ?? routeHeartId ?? profile.likedHeartId);
  }, [
    apiProfile?.isLiked,
    apiProfile?.likedHeartId,
    profile.isLiked,
    profile.likedHeartId,
    routeHeartId,
    routeLiked,
    targetUserId,
  ]);

  const handleToggleHeart = () => {
    if (!profile.targetUserId || isHeartPending) return;

    const previousLiked = liked;
    const previousHeartId = likedHeartId;
    const rollback = () => {
      setLiked(previousLiked);
      setLikedHeartId(previousHeartId);
    };

    if (previousLiked) {
      if (!previousHeartId) {
        Alert.alert("마음 정보를 찾을 수 없어요.", "잠시 후 다시 시도해 주세요.");
        return;
      }

      setLiked(false);
      setLikedHeartId(null);
      patchHeartMutation.mutate(previousHeartId, {
        onError: () => {
          rollback();
          Alert.alert("마음을 취소하지 못했어요.", "잠시 후 다시 시도해 주세요.");
        },
      });
      return;
    }

    setLiked(true);
    sendHeartMutation.mutate(profile.targetUserId, {
      onSuccess: (data) => setLikedHeartId(data.heartId),
      onError: () => {
        rollback();
        Alert.alert("마음을 보내지 못했어요.", "잠시 후 다시 시도해 주세요.");
      },
    });
  };

  const handleOpenChat = () => {
    if (!profile.targetUserId || createChatRoomMutation.isPending) {
      Alert.alert("대화할 프로필 정보를 찾을 수 없어요.");
      return;
    }

    createChatRoomMutation.mutate(
      { targetUserId: profile.targetUserId },
      {
        onSuccess: (data) => {
          router.push({
            pathname: "/chat/[id]",
            params: { id: String(data.chatRoomId) },
          });
        },
        onError: () => {
          Alert.alert("대화방을 열지 못했어요.", "잠시 후 다시 시도해 주세요.");
        },
      },
    );
  };

  const handleReportPress = () => {
    setMenuVisible(false);

    if (!profile.targetUserId) {
      Alert.alert("신고할 프로필 정보를 찾을 수 없어요.");
      return;
    }

    if (!chatRoomId) {
      Alert.alert("신고할 채팅방이 없어요.");
      return;
    }

    setReportVisible(true);
  };

  const handleReportCategory = (category: {
    label: string;
    value: ReportCategory;
  }) => {
    if (!profile.targetUserId || !chatRoomId || createReportMutation.isPending) return;

    createReportMutation.mutate(
      {
        targetUserId: profile.targetUserId,
        chatRoomId,
        category: category.value,
        reason: category.label,
      },
      {
        onSuccess: () => {
          setReportVisible(false);
          Alert.alert("신고가 접수되었습니다.");
        },
        onError: () => {
          Alert.alert("신고를 접수하지 못했어요.", "잠시 후 다시 시도해 주세요.");
        },
      },
    );
  };

  const handleBlockPress = () => {
    setMenuVisible(false);

    if (!profile.targetUserId) {
      Alert.alert("차단할 프로필 정보를 찾을 수 없어요.");
      return;
    }

    if (!chatRoomId) {
      Alert.alert("차단할 채팅방이 없어요.");
      return;
    }

    Alert.alert("차단할까요?", `${profile.name}님과 대화할 수 없게 됩니다.`, [
      { text: "취소", style: "cancel" },
      {
        text: "차단하기",
        style: "destructive",
        onPress: () => {
          blockUserMutation.mutate(
            { targetUserId: profile.targetUserId!, reason: "Other" },
            {
              onSuccess: () => {
                Alert.alert("차단되었습니다.");
                router.back();
              },
              onError: () => {
                Alert.alert("차단하지 못했어요.", "잠시 후 다시 시도해 주세요.");
              },
            },
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 104 },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color="#A6AFB6" />
          </TouchableOpacity>

          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => Alert.alert("공유 기능은 준비 중입니다.")}
            >
              <Ionicons name="share-outline" size={22} color="#202020" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#202020" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summarySection}>
          <ProfileSummaryCard
            profile={profile}
            locationText={locationText}
            liked={liked}
            isHeartPending={isHeartPending}
            width={summaryCardWidth}
            height={summaryCardHeight}
            onToggleHeart={handleToggleHeart}
          />
        </View>

        {/* 소개와 사용자 성향을 카드/칩 형태로 보여주는 본문입니다. */}
        <View style={styles.content}>
          <SectionTitle title="소개" />
          <View style={styles.introCard}>
            <Text style={styles.introText}>{profile.intro}</Text>
          </View>

          {profile.interests.length > 0 ? (
            <>
              <SectionTitle title="저의 관심사에요." />
              <View style={styles.chipList}>
                {profile.interests.map((interest, index) => (
                  <Chip
                    key={interest}
                    label={interest}
                    variant={index === 0 ? "outlineActive" : "outline"}
                    shape="rect"
                    size="small"
                    style={styles.profileChip}
                    textStyle={styles.profileChipText}
                  />
                ))}
              </View>
            </>
          ) : null}

          {profile.preferences.length > 0 ? (
            <>
              <SectionTitle title="이런 사람이 좋아요." />
              <View style={styles.chipList}>
                {profile.preferences.map((preference, index) => (
                  <Chip
                    key={`${preference}-${index}`}
                    label={preference}
                    variant={index === 1 || index === 2 ? "outlineActive" : "outline"}
                    shape="rect"
                    size="small"
                    style={styles.profileChip}
                    textStyle={styles.profileChipText}
                  />
                ))}
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.divider} />
      </ScrollView>

      {/* 스크롤 위치와 상관없이 하단에 붙어 있는 CTA입니다. */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            createChatRoomMutation.isPending ? styles.pendingButton : null,
          ]}
          activeOpacity={0.85}
          onPress={handleOpenChat}
          disabled={createChatRoomMutation.isPending}
        >
          <Text style={styles.ctaText}>
            {createChatRoomMutation.isPending ? "대화방 여는 중..." : "바로 대화하기"}
          </Text>
        </TouchableOpacity>
      </View>

      <ActionSheetModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onReport={handleReportPress}
        onBlock={handleBlockPress}
      />

      <ReportCategoryModal
        visible={reportVisible}
        isPending={createReportMutation.isPending}
        onClose={() => setReportVisible(false)}
        onSelect={handleReportCategory}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ProfileSummaryCard({
  profile,
  locationText,
  liked,
  isHeartPending,
  width,
  height,
  onToggleHeart,
}: {
  profile: DetailProfile;
  locationText: string;
  liked: boolean;
  isHeartPending: boolean;
  width: number;
  height: number;
  onToggleHeart: () => void;
}) {
  const previewInterests = profile.interests.slice(0, 4);

  return (
    <ImageBackground
      source={{ uri: profile.image }}
      style={[styles.summaryCard, { width, height }]}
      imageStyle={styles.summaryCardImage}
    >
      <View style={styles.summaryScrim} />

      <View style={styles.summaryContent}>
        <View style={styles.summaryTextBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile.name} {profile.age}세
            </Text>
            <Ionicons name="checkmark-circle" size={21} color="#FFFFFF" />
          </View>

          {locationText ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={20} color="#FFFFFF" />
              <Text style={styles.locationText} numberOfLines={1}>
                {locationText}
              </Text>
            </View>
          ) : null}

          {previewInterests.length > 0 ? (
            <View style={styles.summaryChipList}>
              {previewInterests.map((interest) => (
                <View key={interest} style={styles.summaryChip}>
                  <Text style={styles.summaryChipText} numberOfLines={1}>
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.likeButton, isHeartPending ? styles.pendingButton : null]}
          activeOpacity={0.82}
          onPress={onToggleHeart}
          disabled={isHeartPending}
        >
          {isHeartPending ? (
            <ActivityIndicator color="#FF3E70" />
          ) : (
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={28}
              color="#FF3E70"
            />
          )}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

function ReportCategoryModal({
  visible,
  isPending,
  onClose,
  onSelect,
}: {
  visible: boolean;
  isPending: boolean;
  onClose: () => void;
  onSelect: (category: { label: string; value: ReportCategory }) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.reportSheet}>
          <Text style={styles.reportTitle}>신고 사유를 선택해 주세요</Text>
          {REPORT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={styles.reportOption}
              activeOpacity={0.75}
              disabled={isPending}
              onPress={() => onSelect(category)}
            >
              <Text style={styles.actionText}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
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

function parseOptionalNumber(value?: string | string[]) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) return undefined;

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalBoolean(value?: string | string[]) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (rawValue === "true") return true;
  if (rawValue === "false") return false;
  return undefined;
}

function mapRouteDetailProfile(
  params: {
    name?: string | string[];
    age?: string | string[];
    location?: string | string[];
    intro?: string | string[];
    image?: string | string[];
    heartId?: string | string[];
    isLiked?: string | string[];
  },
  targetUserId?: number,
  chatRoomId?: number,
): DetailProfile | null {
  const name = getParamString(params.name);
  const age = parseOptionalNumber(params.age);

  if (!name || !age) return null;

  return {
    targetUserId,
    chatRoomId,
    name,
    age,
    location: getParamString(params.location) ?? "",
    distance: "",
    intro: getParamString(params.intro) ?? "",
    interests: [],
    preferences: [],
    image: getParamString(params.image) ?? PROFILE_IMAGE,
    isLiked: parseOptionalBoolean(params.isLiked) ?? false,
    likedHeartId: parseOptionalNumber(params.heartId) ?? null,
  };
}

function mapRecommendationDetailProfile(
  data:
    | {
        pages: {
          items: {
            userId: number;
            nickname: string;
            age: number;
            areaName: string;
            keywords: string[];
            introText: string;
            profileImageUrl: string;
            isLiked: boolean;
            likedHeartId: number | null;
          }[];
        }[];
      }
    | undefined,
  targetUserId?: number,
): DetailProfile | null {
  if (!targetUserId) return null;

  const item = data?.pages
    .flatMap((page) => page.items)
    .find((profile) => profile.userId === targetUserId);

  if (!item) return null;

  return {
    targetUserId: item.userId,
    name: item.nickname,
    age: item.age,
    location: item.areaName,
    distance: "",
    intro: item.introText,
    interests: item.keywords,
    preferences: [],
    image: item.profileImageUrl || PROFILE_IMAGE,
    isLiked: item.isLiked,
    likedHeartId: item.likedHeartId,
  };
}

function getParamString(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
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
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
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
  summarySection: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  summaryCard: {
    overflow: "hidden",
    justifyContent: "flex-end",
    borderRadius: 14,
    backgroundColor: "#D9D9D9",
  },
  summaryCardImage: {
    borderRadius: 14,
    resizeMode: "cover",
  },
  summaryScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "54%",
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  summaryTextBlock: {
    flex: 1,
    gap: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  locationText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  summaryChipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  summaryChip: {
    height: 32,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  summaryChipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  pendingButton: {
    opacity: 0.68,
  },
  content: {
    paddingHorizontal: 20,
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
  reportSheet: {
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  reportTitle: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#202020",
  },
  reportOption: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F2",
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
