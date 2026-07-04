import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import {
  usePatchHeartMutation,
  useReceivedHeartsInfiniteQuery,
  useSendHeartMutation,
  useSentHeartsInfiniteQuery,
} from "@/hooks/api/useSocials";
import { DEFAULT_PROFILE_IMAGE_URI } from "@/constants/defaultProfileImage";
import { TAB_SCREEN_BOTTOM_PADDING } from "@/constants/layout";
import { useHeartBadgeStore } from "@/stores/heartBadgeStore";
import { getAgeFromBirthdate } from "@/utils/age";
import type {
  IHeartreceivedResponse,
  IHeartsentResponse,
  IProfileSummary,
} from "@/types/api/socials/socialsDTO";
import { uniqueBy } from "@/utils/array";

const PINK = "#FF3E70";
const BLACK = "#202020";
const GRAY_100 = "#F8FAFB";
const GRAY_150 = "#E9ECED";
const GRAY_700 = "#636970";

type HeartTab = "received" | "sent";

type HeartProfile = {
  id: string;
  targetUserId: number;
  name: string;
  age: number | null;
  location: string;
  image: string;
  isLiked: boolean;
  likedHeartId?: number;
};

type ScreenHeartProfile = HeartProfile & {
  receivedHeartId?: number;
};

type OptimisticHeartState = {
  isLiked: boolean;
  likedHeartId?: number;
};

export default function HeartScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<HeartTab>("received");
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [pendingUserIds, setPendingUserIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [optimisticHeartState, setOptimisticHeartState] = useState<
    Record<number, OptimisticHeartState>
  >({});
  const receivedQuery = useReceivedHeartsInfiniteQuery();
  const sentQuery = useSentHeartsInfiniteQuery();
  const sendHeartMutation = useSendHeartMutation();
  const patchHeartMutation = usePatchHeartMutation();

  const cardWidth = useMemo(() => (width - 40 - 12) / 2, [width]);
  const sentProfiles = useMemo(
    () => mapSentHeartProfiles(sentQuery.data),
    [sentQuery.data],
  );
  const sentHeartIdsByTargetUserId = useMemo(() => {
    const heartIds = new Map<number, number>();

    sentProfiles.forEach((profile) => {
      if (profile.likedHeartId != null) {
        heartIds.set(profile.targetUserId, profile.likedHeartId);
      }
    });

    return heartIds;
  }, [sentProfiles]);
  const receivedProfiles = useMemo(
    () => mapReceivedHeartProfiles(receivedQuery.data, sentHeartIdsByTargetUserId),
    [receivedQuery.data, sentHeartIdsByTargetUserId],
  );
  const displayedReceivedProfiles = applyOptimisticHeartState(
    receivedProfiles,
    optimisticHeartState,
  );
  const displayedSentProfiles = applyOptimisticHeartState(
    sentProfiles,
    optimisticHeartState,
  ).filter((profile) => profile.isLiked);
  const profiles =
    activeTab === "received"
      ? displayedReceivedProfiles
      : displayedSentProfiles;
  const activeQuery = activeTab === "received" ? receivedQuery : sentQuery;
  const isInitialLoading = activeQuery.isLoading && profiles.length === 0;
  const receivedCount = receivedProfiles.length;

  // 마음함이 포커스되면 현재까지 받은 마음을 읽음 처리해 navbar dot을 끈다.
  const markHeartsSeen = useHeartBadgeStore((state) => state.markHeartsSeen);
  const latestReceivedHeartId = useMemo(
    () =>
      receivedProfiles.reduce(
        (max, profile) => Math.max(max, profile.receivedHeartId ?? 0),
        0,
      ),
    [receivedProfiles],
  );

  useFocusEffect(
    useCallback(() => {
      markHeartsSeen(latestReceivedHeartId);
    }, [latestReceivedHeartId, markHeartsSeen]),
  );

  const handleRefresh = useCallback(() => {
    setIsPullRefreshing(true);
    void activeQuery.refetch().finally(() => {
      setIsPullRefreshing(false);
    });
  }, [activeQuery]);

  useEffect(() => {
    setOptimisticHeartState((prev) => {
      const profilesByUserId = new Map<number, ScreenHeartProfile>();

      receivedProfiles.forEach((profile) => {
        profilesByUserId.set(profile.targetUserId, profile);
      });
      sentProfiles.forEach((profile) => {
        profilesByUserId.set(profile.targetUserId, profile);
      });

      let hasSyncedState = false;
      const next = { ...prev };

      Object.entries(prev).forEach(([targetUserIdKey, optimisticState]) => {
        const targetUserId = Number(targetUserIdKey);
        const profile = profilesByUserId.get(targetUserId);
        const isSynced = profile
          ? profile.isLiked === optimisticState.isLiked &&
            (optimisticState.likedHeartId == null ||
              profile.likedHeartId === optimisticState.likedHeartId)
          : !optimisticState.isLiked;

        if (isSynced) {
          delete next[targetUserId];
          hasSyncedState = true;
        }
      });

      return hasSyncedState ? next : prev;
    });
  }, [receivedProfiles, sentProfiles]);

  // 하트 액션은 즉시 화면에 반영하고, 성공 후 받은/보낸 마음 목록을 다시 맞춥니다.
  const handleToggleHeart = useCallback(
    (profile: ScreenHeartProfile) => {
      const { targetUserId } = profile;
      if (pendingUserIds.has(targetUserId)) return;

      const nextLiked = !profile.isLiked;
      const previousState = {
        isLiked: profile.isLiked,
        likedHeartId: profile.likedHeartId,
      };

      setPendingUserIds((prev) => new Set(prev).add(targetUserId));
      setOptimisticHeartState((prev) => ({
        ...prev,
        [targetUserId]: {
          isLiked: nextLiked,
          likedHeartId: nextLiked ? profile.likedHeartId : undefined,
        },
      }));

      const resetPending = () => {
        setPendingUserIds((prev) => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      };
      const rollbackHeartState = () => {
        setOptimisticHeartState((prev) => ({
          ...prev,
          [targetUserId]: previousState,
        }));
      };

      if (profile.isLiked) {
        if (profile.likedHeartId == null) {
          rollbackHeartState();
          resetPending();
          return;
        }

        patchHeartMutation.mutate(profile.likedHeartId, {
          onError: rollbackHeartState,
          onSettled: resetPending,
        });
        return;
      }

      sendHeartMutation.mutate(targetUserId, {
        onSuccess: (response) => {
          setOptimisticHeartState((prev) => ({
            ...prev,
            [targetUserId]: {
              isLiked: true,
              likedHeartId: response.heartId,
            },
          }));
        },
        onError: rollbackHeartState,
        onSettled: resetPending,
      });
    },
    [patchHeartMutation, pendingUserIds, sendHeartMutation],
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

      <FlatList
        data={isInitialLoading ? [] : profiles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <HeartProfileCard
            profile={item}
            width={cardWidth}
            isPending={pendingUserIds.has(item.targetUserId)}
            onPress={() =>
              router.push({
                pathname: "/profile-detail",
                params: buildProfileDetailParams(item),
              } as never)
            }
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
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handleRefresh}
            tintColor={PINK}
            colors={[PINK]}
          />
        }
        ListFooterComponent={
          activeQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={PINK} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {isInitialLoading ? (
              <ActivityIndicator color={PINK} />
            ) : (
              <>
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
              </>
            )}
          </View>
        }
        ListHeaderComponent={
          activeTab === "received" ? (
            <View style={styles.receivedSummary}>
              <Text style={styles.receivedSummaryText}>
                {isInitialLoading ? (
                  "받은 마음을 불러오는 중이에요"
                ) : (
                  <>
                    총 <Text style={styles.receivedSummaryCount}>{receivedCount}명</Text>이
                    마음을 보냈어요💕
                  </>
                )}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function applyOptimisticHeartState<T extends ScreenHeartProfile>(
  profiles: T[],
  optimisticState: Record<number, OptimisticHeartState>,
) {
  return profiles.map((profile) => {
    const state = optimisticState[profile.targetUserId];

    return state
      ? {
          ...profile,
          isLiked: state.isLiked,
          likedHeartId: state.likedHeartId,
        }
      : profile;
  });
}

// 받은 마음 응답엔 좋아요 여부가 없어, 보낸 마음 목록과 대조해 맞하트를 판단
function mapReceivedHeartProfiles(
  data: { pages: IHeartreceivedResponse[] } | undefined,
  sentHeartIdsByTargetUserId: Map<number, number>,
): ScreenHeartProfile[] {
  return (
    uniqueBy(
      data?.pages.flatMap((page) =>
        page.items.map((item) => {
          const likedHeartId =
            item.likedHeartId ?? sentHeartIdsByTargetUserId.get(item.fromUserId);

          return {
            id: `received-${item.heartId}`,
            receivedHeartId: item.heartId,
            likedHeartId,
            targetUserId: item.fromUserId,
            name: item.fromUser.nickname,
            age: getProfileAge(item.fromUser),
            location: getProfileLocation(item.fromUser),
            image: item.fromUser.profileImageUrl || DEFAULT_PROFILE_IMAGE_URI,
            isLiked: item.isLiked ?? likedHeartId != null,
          };
        }),
      ) ?? [],
      (item) => item.id,
    )
  );
}

function mapSentHeartProfiles(
  data: { pages: IHeartsentResponse[] } | undefined,
): ScreenHeartProfile[] {
  return (
    uniqueBy(
      data?.pages.flatMap((page) =>
        page.items.map((item) => ({
          id: `sent-${item.heartId}`,
          likedHeartId: item.heartId,
          targetUserId: item.targetUserId,
          name: item.targetUser.nickname,
          age: getProfileAge(item.targetUser),
          location: getProfileLocation(item.targetUser),
          image: item.targetUser.profileImageUrl || DEFAULT_PROFILE_IMAGE_URI,
          isLiked: true,
        })),
      ) ?? [],
      (item) => item.id,
    )
  );
}

function getProfileAge(profile: IProfileSummary): number | null {
  if (
    typeof profile.age === "number" &&
    Number.isFinite(profile.age) &&
    profile.age >= 0
  ) {
    return Math.floor(profile.age);
  }

  return getAgeFromBirthdate(profile.birthdate ?? profile.birthDate);
}

function getProfileLocation(profile: IProfileSummary) {
  return (
    profile.address?.fullName?.trim() ||
    profile.areaName?.trim() ||
    profile.area?.name?.trim() ||
    ""
  );
}

function buildProfileDetailParams(profile: ScreenHeartProfile) {
  const params: Record<string, string> = {
    userId: String(profile.targetUserId),
    name: profile.name,
    image: profile.image,
    location: profile.location,
    isLiked: String(profile.isLiked),
  };

  if (profile.age != null) {
    params.age = String(profile.age);
  }

  if (profile.likedHeartId) {
    params.heartId = String(profile.likedHeartId);
  }

  return params;
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
  return (
    <Pressable style={[styles.card, { width, height: width * 1.38 }]} onPress={onPress}>
      <ImageBackground source={{ uri: profile.image }} style={styles.cardImage} imageStyle={styles.cardRadius}>
        <CardBottomGradient />
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
            {profile.age != null ? (
              <>
                <View style={styles.nameDot} />
                <Text style={styles.cardName}>{profile.age}세</Text>
              </>
            ) : null}
          </View>
          {profile.location ? (
            <Text style={styles.cardLocation} numberOfLines={1}>
              {profile.location}
            </Text>
          ) : null}
        </View>
      </ImageBackground>
    </Pressable>
  );
}

function CardBottomGradient() {
  return (
    <Svg pointerEvents="none" style={styles.cardBottomOverlay}>
      <Defs>
        <LinearGradient id="heartCardGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0" />
          <Stop offset="0.62" stopColor="#000000" stopOpacity="0.36" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#heartCardGradient)" />
    </Svg>
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: TAB_SCREEN_BOTTOM_PADDING,
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
    height: 96,
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
