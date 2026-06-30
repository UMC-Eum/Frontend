import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  usePatchHeartMutation,
  useReceivedHeartsInfiniteQuery,
  useSendHeartMutation,
  useSentHeartsInfiniteQuery,
} from "@/hooks/api/useSocials";

const PINK = "#FF3E70";
const BLACK = "#202020";
const GRAY_100 = "#F8FAFB";
const GRAY_150 = "#E9ECED";
const GRAY_700 = "#636970";
const FALLBACK_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=1200&auto=format&fit=crop";

type HeartTab = "received" | "sent";

type HeartProfile = {
  id: string;
  name: string;
  age: number | null;
  location: string;
  image: string | null;
  isLiked: boolean;
};

type ScreenHeartProfile = HeartProfile & {
  heartId?: number;
  targetUserId?: number;
};

type OptimisticHeartState = {
  isLiked: boolean;
  heartId?: number;
};

export default function HeartScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<HeartTab>("received");
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [optimisticHeartState, setOptimisticHeartState] = useState<
    Record<string, OptimisticHeartState>
  >({});
  const receivedQuery = useReceivedHeartsInfiniteQuery();
  const sentQuery = useSentHeartsInfiniteQuery();
  const sendHeartMutation = useSendHeartMutation();
  const patchHeartMutation = usePatchHeartMutation();

  const cardWidth = useMemo(() => (width - 40 - 12) / 2, [width]);
  const receivedProfiles = useMemo(
    () => mapReceivedHeartProfiles(receivedQuery.data),
    [receivedQuery.data],
  );
  const sentProfiles = useMemo(
    () => mapSentHeartProfiles(sentQuery.data),
    [sentQuery.data],
  );
  const profiles =
    activeTab === "received"
      ? applyOptimisticHeartState(receivedProfiles, optimisticHeartState)
      : applyOptimisticHeartState(sentProfiles, optimisticHeartState);
  const activeQuery = activeTab === "received" ? receivedQuery : sentQuery;
  const isLoading = activeQuery.isLoading && profiles.length === 0;
  const receivedCount = receivedProfiles.length;

  const handleOpenProfileDetail = useCallback(
    (profile: ScreenHeartProfile) => {
      router.push({
        pathname: "/profile-detail",
        params: buildProfileDetailParams(profile),
      } as never);
    },
    [router],
  );

  // 하트 액션은 서버 반영 후 관련 목록을 invalidate하는 mutation 훅에서 동기화합니다.
  const handleToggleHeart = useCallback(
    (profile: ScreenHeartProfile) => {
      const profileId = profile.id;
      if (pendingIds.has(profileId)) return;

      const nextLiked = !profile.isLiked;

      setPendingIds((prev) => new Set(prev).add(profileId));
      setOptimisticHeartState((prev) => ({
        ...prev,
        [profileId]: { isLiked: nextLiked, heartId: profile.heartId },
      }));

      const resetPending = () => {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
      };
      const rollbackHeartState = () => {
        setOptimisticHeartState((prev) => ({
          ...prev,
          [profileId]: { isLiked: profile.isLiked, heartId: profile.heartId },
        }));
      };

      if (profile.isLiked && profile.heartId) {
        patchHeartMutation.mutate(profile.heartId, {
          onError: rollbackHeartState,
          onSettled: resetPending,
        });
        return;
      }

      if (profile.targetUserId) {
        sendHeartMutation.mutate(profile.targetUserId, {
          onSuccess: (response) => {
            setOptimisticHeartState((prev) => ({
              ...prev,
              [profileId]: { isLiked: true, heartId: response.heartId },
            }));
          },
          onError: rollbackHeartState,
          onSettled: resetPending,
        });
        return;
      }

      resetPending();
    },
    [patchHeartMutation, pendingIds, sendHeartMutation],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마음</Text>
      </View>

      <View style={styles.tabGroup}>
        <HeartTabButton
          label="받은 마음"
          isActive={activeTab === "received"}
          onPress={() => setActiveTab("received")}
        />
        <HeartTabButton
          label="보낸 마음"
          isActive={activeTab === "sent"}
          onPress={() => setActiveTab("sent")}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={PINK} />
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <HeartProfileCard
              profile={item}
              width={cardWidth}
              isPending={pendingIds.has(item.id)}
              onPress={() => handleOpenProfileDetail(item)}
              onPressHeart={() => handleToggleHeart(item)}
            />
          )}
          columnWrapperStyle={styles.cardRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
              activeQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            activeQuery.isFetchingNextPage ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={PINK} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons
                name={activeTab === "received" ? "heart-outline" : "send-outline"}
                size={34}
                color="#CBD5E1"
              />
              <Text style={styles.emptyTitle}>
                {activeTab === "received"
                  ? "아직 받은 마음이 없어요"
                  : "아직 보낸 마음이 없어요"}
              </Text>
              <Text style={styles.emptyDescription}>
                {activeQuery.isError
                  ? "마음 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
                  : "새로운 인연이 생기면 이곳에서 확인할 수 있어요."}
              </Text>
            </View>
          }
          ListHeaderComponent={
            activeTab === "received" ? (
              <View style={styles.receivedSummary}>
                <Text style={styles.receivedSummaryText}>
                  총 <Text style={styles.receivedSummaryCount}>{receivedCount}명</Text>이
                  마음을 보냈어요💕
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function applyOptimisticHeartState<T extends HeartProfile>(
  profiles: T[],
  optimisticState: Record<string, OptimisticHeartState>,
) {
  return profiles.map((profile) => {
    const optimisticProfile = optimisticState[profile.id];

    if (!optimisticProfile) return profile;

    return {
      ...profile,
      isLiked: optimisticProfile.isLiked,
      heartId: optimisticProfile.heartId,
    };
  });
}

function mapReceivedHeartProfiles(data?: {
  pages: {
    items: {
      heartId: number;
      fromUserId: number;
      fromUser: {
        nickname: string;
        age?: number | string | null;
        birthDate?: string | null;
        profileImageUrl?: string | null;
        areaName?: string | null;
      };
    }[];
  }[];
}): ScreenHeartProfile[] {
  return (
    data?.pages.flatMap((page) =>
      page.items.map((item) => ({
        id: `received-${item.heartId}`,
        heartId: item.heartId,
        targetUserId: item.fromUserId,
        name: item.fromUser.nickname,
        age: normalizeAge(item.fromUser.age, item.fromUser.birthDate),
        location: item.fromUser.areaName ?? "",
        image: item.fromUser.profileImageUrl ?? null,
        isLiked: false,
      })),
    ) ?? []
  );
}

function mapSentHeartProfiles(data?: {
  pages: {
    items: {
      heartId: number;
      targetUserId: number;
      targetUser: {
        nickname: string;
        age?: number | string | null;
        birthDate?: string | null;
        profileImageUrl?: string | null;
        areaName?: string | null;
      };
    }[];
  }[];
}): ScreenHeartProfile[] {
  return (
    data?.pages.flatMap((page) =>
      page.items.map((item) => ({
        id: `sent-${item.heartId}`,
        heartId: item.heartId,
        targetUserId: item.targetUserId,
        name: item.targetUser.nickname,
        age: normalizeAge(item.targetUser.age, item.targetUser.birthDate),
        location: item.targetUser.areaName ?? "",
        image: item.targetUser.profileImageUrl ?? null,
        isLiked: true,
      })),
    ) ?? []
  );
}

function buildProfileDetailParams(profile: ScreenHeartProfile) {
  const params: Record<string, string> = {
    name: profile.name,
    isLiked: String(profile.isLiked),
  };

  if (profile.targetUserId) params.userId = String(profile.targetUserId);
  if (profile.heartId) params.heartId = String(profile.heartId);
  if (profile.age) params.age = String(profile.age);
  if (profile.image) params.image = profile.image;
  if (profile.location) params.location = profile.location;

  return params;
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

type HeartTabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function HeartTabButton({ label, isActive, onPress }: HeartTabButtonProps) {
  return (
    <Pressable
      style={styles.tabButton}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>{label}</Text>
      {isActive ? <View style={styles.tabUnderline} /> : null}
    </Pressable>
  );
}

type HeartProfileCardProps = {
  profile: HeartProfile;
  width: number;
  isPending: boolean;
  onPress: () => void;
  onPressHeart: () => void;
};

function HeartProfileCard({
  profile,
  width,
  isPending,
  onPress,
  onPressHeart,
}: HeartProfileCardProps) {
  const ageLabel = profile.age ? `${profile.age}세` : null;

  return (
    <Pressable style={[styles.card, { width, height: width * 1.38 }]} onPress={onPress}>
      <ImageBackground
        source={{ uri: profile.image || FALLBACK_PROFILE_IMAGE }}
        style={styles.cardImage}
        imageStyle={styles.cardRadius}
      >
        <View style={styles.cardBottomOverlay} />
        <Pressable
          style={[styles.heartButton, isPending ? styles.heartButtonPending : null]}
          onPress={(event) => {
            event.stopPropagation();
            onPressHeart();
          }}
          hitSlop={8}
        >
          <Ionicons
            name={profile.isLiked ? "heart" : "heart-outline"}
            size={19}
            color={profile.isLiked ? PINK : "#FFFFFF"}
          />
        </Pressable>

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {profile.name}
            </Text>
            {ageLabel ? (
              <>
                <View style={styles.nameDot} />
                <Text style={styles.cardName}>{ageLabel}</Text>
              </>
            ) : null}
          </View>
          <Text style={styles.cardLocation} numberOfLines={1}>
            {profile.location}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: BLACK,
  },
  tabGroup: {
    height: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_150,
    backgroundColor: "#FFFFFF",
  },
  tabButton: {
    flex: 1,
    height: 40,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: GRAY_700,
  },
  tabTextActive: {
    fontWeight: "700",
    color: BLACK,
  },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
    backgroundColor: BLACK,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerLoading: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    color: BLACK,
    textAlign: "center",
  },
  emptyDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: GRAY_700,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  receivedSummary: {
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: GRAY_100,
  },
  receivedSummaryText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: GRAY_700,
  },
  receivedSummaryCount: {
    color: PINK,
  },
  cardRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: GRAY_150,
  },
  cardImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardRadius: {
    borderRadius: 14,
  },
  cardBottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.46)",
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  heartButtonPending: {
    opacity: 0.64,
  },
  cardInfo: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardName: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  nameDot: {
    width: 2,
    height: 2,
    marginHorizontal: 6,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
  },
  cardLocation: {
    marginTop: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
