import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Image } from "@/components/Image";
import { SafeAreaView } from "react-native-safe-area-context";

import { MyClubRowListSkeleton } from "@/components/skeletons";
import { useMyClubsQuery } from "@/hooks/api/useClub";
import { useLogoutMutation } from "@/hooks/api/useAuth";
import { useRecommendationsInfiniteQuery } from "@/hooks/api/useRecommendations";
import { useReceivedHeartsInfiniteQuery } from "@/hooks/api/useSocials";
import {
  useDeleteAccountMutation,
  useMyProfileQuery,
} from "@/hooks/api/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationSettingsStore } from "@/stores/notificationSettingsStore";
import { uniqueBy } from "@/utils/array";

const ACCENT = "#FC3367";
const TEXT = "#202020";
const SUB_TEXT = "#636970";
const MUTED = "#A6AFB6";
const TERMS_URL = "https://eum-dating.com/terms";
const PRIVACY_URL = "https://eum-dating.com/privacy";
const SUPPORT_URL = "https://eum-dating.com/support";

export default function MyTabScreen() {
  const router = useRouter();
  const notificationEnabled = useNotificationSettingsStore(
    (state) => state.enabled,
  );
  const setNotificationEnabled = useNotificationSettingsStore(
    (state) => state.setEnabled,
  );
  const myProfileQuery = useMyProfileQuery();
  const receivedHeartsQuery = useReceivedHeartsInfiniteQuery();
  const recommendationsQuery = useRecommendationsInfiniteQuery();
  const myClubsQuery = useMyClubsQuery();
  const logoutMutation = useLogoutMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const authProvider = useAuthStore((state) => state.provider);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // 홈 추천(recommendations)은 1시간 유지 정책이라 수동 새로고침 대상에서 제외한다.
  const handleRefresh = useCallback(() => {
    setIsPullRefreshing(true);
    void Promise.allSettled([
      myProfileQuery.refetch(),
      receivedHeartsQuery.refetch(),
      myClubsQuery.refetch(),
    ]).finally(() => {
      setIsPullRefreshing(false);
    });
  }, [myClubsQuery, myProfileQuery, receivedHeartsQuery]);

  const profile = myProfileQuery.data;
  const receivedHeartCount =
    receivedHeartsQuery.data?.pages.reduce(
      (total, page) => total + page.items.length,
      0,
    ) ?? (receivedHeartsQuery.isSuccess ? 0 : undefined);

  // 현재 매칭 = 나에게 추천된 이상형 수
  const matchCount =
    recommendationsQuery.data?.pages.reduce(
      (total, page) => total + page.items.length,
      0,
    ) ?? (recommendationsQuery.isSuccess ? 0 : undefined);
  // ponytail: 엔드포인트에 페이지네이션이 없어 slice로 기존 5개 노출 유지
  // 마이페이지는 가입 확정(ACTIVE)만 표시. status가 없는 응답(구버전)은 확정으로 간주.
  const myClubs = uniqueBy(
    myClubsQuery.data?.items ?? [],
    (item) => item.clubId,
  )
    .filter((item) => !item.status || item.status === "ACTIVE")
    .slice(0, 5);

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationEnabled(enabled);
  };

  // 계정 액션은 mutation으로 서버에 반영하고 로컬 Query 캐시를 정리합니다.
  const handleLogout = () => {
    if (logoutMutation.isPending) return;

    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.replace("/onboarding/login" as never);
        Alert.alert("로그아웃", "로그아웃되었습니다.");
      },
    });
  };

  const handleDeactivate = () => {
    if (deleteAccountMutation.isPending) return;
    setShowWithdrawModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (deleteAccountMutation.isPending) return;

    let appleAuthorizationCode: string | undefined;

    if (authProvider === "APPLE") {
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [],
        });
        appleAuthorizationCode = credential.authorizationCode ?? undefined;
      } catch (error) {
        if ((error as { code?: string }).code === "ERR_REQUEST_CANCELED") {
          return;
        }
        Alert.alert(
          "Apple 인증 실패",
          "탈퇴를 위해 Apple 인증을 다시 진행해주세요.",
        );
        return;
      }

      if (!appleAuthorizationCode) {
        Alert.alert("Apple 인증 실패", "Apple 인증 코드를 가져오지 못했어요.");
        return;
      }
    }

    deleteAccountMutation.mutate(
      { appleAuthorizationCode },
      {
        onSuccess: () => {
          setShowWithdrawModal(false);
          router.replace("/onboarding/login" as never);
        },
        onError: () => Alert.alert("탈퇴 실패", "다시 시도해주세요."),
      },
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        bounces
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handleRefresh}
            tintColor={ACCENT}
            colors={[ACCENT]}
          />
        }
      >
        <Text style={styles.screenTitle}>마이페이지</Text>

        <View style={[styles.card, styles.profileCard]}>
          <View style={styles.profileTop}>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.82}
              onPress={() => router.push("/profile/edit" as any)}
            >
              <View style={styles.avatarImageClip}>
                {profile?.profileImageUrl ? (
                  <Image
                    source={{ uri: profile.profileImageUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#A6AFB6" />
                  </View>
                )}
              </View>
              <View style={styles.editBadge}>
                <Ionicons
                  name="pencil"
                  size={15}
                  color="#6D747B"
                />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile?.nickname ?? "-"}</Text>
                {profile?.age != null && (
                  <Text style={styles.age}> · {profile.age}세</Text>
                )}
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={21} color="#687076" />
                <Text style={styles.location}>
                  {profile?.area?.name ?? "지역 미설정"}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/profile/location" as any)}
                >
                  <Text style={styles.editText}>수정</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bioBox}
            activeOpacity={0.82}
            onPress={() => router.push("/profile/edit" as any)}
          >
            <Text style={styles.bioLabel}>나의 소개</Text>
            <Text style={styles.bioText} numberOfLines={2}>
              {profile?.introText || "아직 소개가 없어요. 소개를 작성해보세요."}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileEditButton}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/edit" as any)}
          >
            <Text style={styles.profileEditText}>프로필 수정</Text>
            <Ionicons name="chevron-forward" size={18} color={ACCENT} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>매칭 현황</Text>
          <View style={styles.matchPanel}>
            <View style={styles.matchItem}>
              <Text style={styles.matchNumber}>
                {matchCount ?? "-"}
              </Text>
              <Text style={styles.matchLabel}>현재 매칭</Text>
            </View>
            <View style={styles.matchDivider} />
            <View style={styles.matchItem}>
              <Text style={styles.matchNumber}>
                {receivedHeartCount ?? "-"}
              </Text>
              <Text style={styles.matchLabel}>받은 마음</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>이상형 설정</Text>

          <TouchableOpacity
            style={[styles.settingRow, styles.voiceSettingRow]}
            activeOpacity={0.7}
            onPress={() => router.push("/ideal-recording" as any)}
          >
            <View style={[styles.settingIcon, styles.voiceIcon]}>
              <Ionicons name="mic" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.settingTextBlock}>
              <Text style={styles.settingTitle}>음성으로 말하기</Text>
              <Text style={[styles.settingSubtitle, styles.voiceSubtitle]}>
                이상형 음성을 녹음해보세요
              </Text>
            </View>
            <Text style={styles.reRecordText}>녹음</Text>
            <Ionicons name="chevron-forward" size={20} color={ACCENT} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>내 동호회</Text>

          {myClubsQuery.isLoading ? (
            <MyClubRowListSkeleton />
          ) : myClubs.length > 0 ? (
            myClubs.map((club, index) => (
              <ClubRow
                key={club.clubId}
                title={club.name || "이름 없는 동호회"}
                subtitle={`${club.authority === "HOST" ? "동호회장" : "멤버"} · 멤버 ${club.memberCount ?? 0}명`}
                image={club.thumbnailUrl}
                variant={index % 2 === 0 ? "running" : "mountain"}
                onPress={() =>
                  router.push({
                    pathname: "/club/detail",
                    params: { clubId: String(club.clubId) },
                  } as never)
                }
              />
            ))
          ) : (
            <Text style={styles.clubEmptyText}>
              {myClubsQuery.isError
                ? "내 동호회를 불러오지 못했어요."
                : "가입한 동호회가 없어요."}
            </Text>
          )}

          <TouchableOpacity
            style={styles.viewAllButton}
            activeOpacity={0.75}
            onPress={() => router.push("/(tabs)?tab=club" as any)}
          >
            <Text style={styles.viewAllText}>전체 보기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.notificationRow}>
            <Text style={styles.notificationText}>알림 설정</Text>
            <Switch
              value={notificationEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: "#E5E7EB", true: ACCENT }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </View>
          <View style={styles.thinDivider} />
          {/* Apple 심사: 로그인 이후에도 약관/개인정보처리방침 접근이 가능해야 한다 */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL(TERMS_URL)}
          >
            <Text style={styles.policyLinkText}>서비스 이용약관</Text>
          </TouchableOpacity>
          <View style={styles.thinDivider} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL(PRIVACY_URL)}
          >
            <Text style={styles.policyLinkText}>개인정보처리방침</Text>
          </TouchableOpacity>
          <View style={styles.thinDivider} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL(SUPPORT_URL)}
          >
            <Text style={styles.policyLinkText}>고객지원</Text>
          </TouchableOpacity>
          <View style={styles.thinDivider} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <Text style={styles.logoutText}>
              {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.withdrawCard}
          activeOpacity={0.7}
          onPress={handleDeactivate}
          disabled={deleteAccountMutation.isPending}
        >
          <Text style={styles.withdrawText}>
            {deleteAccountMutation.isPending ? "탈퇴 처리 중..." : "탈퇴하기"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <WithdrawConfirmModal
        visible={showWithdrawModal}
        isPending={deleteAccountMutation.isPending}
        onCancel={() => setShowWithdrawModal(false)}
        onConfirm={handleConfirmDeactivate}
      />
    </SafeAreaView>
  );
}

function WithdrawConfirmModal({
  visible,
  isPending,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.withdrawModalOverlay}>
        <View style={styles.withdrawModalBox}>
          <Text style={styles.withdrawModalTitle}>정말 탈퇴 하시겠어요?</Text>
          <Text style={styles.withdrawModalDescription}>
            탈퇴하면 프로필과 매칭 기록이 사라져요{"\n"}탈퇴 후 30일간 재가입이 불가능해요
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.withdrawKeepButton,
              pressed && styles.withdrawModalButtonPressed,
            ]}
            onPress={onCancel}
            disabled={isPending}
          >
            <Text style={styles.withdrawKeepButtonText}>아뇨, 더 써볼래요</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.withdrawConfirmButton,
              pressed && styles.withdrawModalButtonPressed,
              isPending && styles.withdrawModalButtonDisabled,
            ]}
            onPress={onConfirm}
            disabled={isPending}
          >
            <Text style={styles.withdrawConfirmButtonText}>
              {isPending ? "탈퇴 처리 중..." : "탈퇴하기"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ClubRow({
  title,
  subtitle,
  image,
  variant,
  onPress,
}: {
  title: string;
  subtitle: string;
  image?: string | null;
  variant: "running" | "mountain";
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.clubRow} activeOpacity={0.82} onPress={onPress}>
      <View
        style={[
          styles.clubThumb,
          variant === "running" ? styles.runningThumb : styles.mountainThumb,
        ]}
      >
        {/* API 썸네일 우선, 없을 때만 기존 일러스트 fallback */}
        {image ? (
          <Image source={{ uri: image }} style={styles.clubThumbImage} />
        ) : variant === "running" ? (
          <>
            <Ionicons name="walk" size={16} color="#5E321E" />
            <View style={styles.runnerDot} />
          </>
        ) : (
          <>
            <View style={styles.mountainSky} />
            <View style={styles.mountainShape} />
            <View style={styles.mountainGround} />
          </>
        )}
      </View>
      <View style={styles.clubTextBlock}>
        <Text style={styles.clubTitle}>{title}</Text>
        <Text style={styles.clubSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F8",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
  },
  screenTitle: {
    marginBottom: 27,
    color: TEXT,
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 32,
  },
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 13,
    elevation: 4,
  },
  profileCard: {
    paddingBottom: 14,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 82,
    height: 82,
    marginRight: 18,
    overflow: "visible",
  },
  avatarImageClip: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 41,
    backgroundColor: "#DCE7EC",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  editBadge: {
    position: "absolute",
    right: -1,
    bottom: 3,
    width: 29,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    color: TEXT,
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 31,
  },
  age: {
    color: "#636970",
    fontSize: 22,
    fontWeight: "500",
    lineHeight: 30,
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    marginLeft: 3,
    marginRight: 8,
    color: SUB_TEXT,
    fontSize: 12,
    fontWeight: "500",
  },
  editText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  bioBox: {
    minHeight: 84,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    borderRadius: 6,
    backgroundColor: "#F9FAFB",
  },
  bioLabel: {
    marginBottom: 5,
    color: MUTED,
    fontSize: 13,
    fontWeight: "500",
  },
  bioText: {
    color: SUB_TEXT,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 21,
  },
  profileEditButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 9,
  },
  profileEditText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionTitle: {
    marginBottom: 14,
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  matchPanel: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#FAFBFC",
  },
  matchItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  matchNumber: {
    color: ACCENT,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 29,
  },
  matchLabel: {
    color: SUB_TEXT,
    fontSize: 12,
    fontWeight: "500",
  },
  matchDivider: {
    width: 1,
    height: 46,
    backgroundColor: "#E8ECEF",
  },
  settingRow: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  voiceSettingRow: {
    marginBottom: 10,
    borderColor: "#FF7698",
    backgroundColor: "#FFF0F4",
  },
  settingIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderRadius: 17,
    backgroundColor: "#F2F4F5",
  },
  voiceIcon: {
    backgroundColor: ACCENT,
  },
  settingTextBlock: {
    flex: 1,
  },
  settingTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
  },
  settingSubtitle: {
    marginTop: 2,
    color: SUB_TEXT,
    fontSize: 11,
    fontWeight: "500",
  },
  voiceSubtitle: {
    color: ACCENT,
  },
  reRecordText: {
    marginRight: 3,
    color: ACCENT,
    fontSize: 15,
    fontWeight: "700",
  },
  clubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  clubThumb: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
    borderRadius: 6,
  },
  clubThumbImage: {
    width: "100%",
    height: "100%",
  },
  runningThumb: {
    backgroundColor: "#EFD7BA",
  },
  runnerDot: {
    position: "absolute",
    right: 9,
    top: 11,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#361A10",
  },
  mountainThumb: {
    backgroundColor: "#B9DEE0",
  },
  mountainSky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "#BBDDE0",
  },
  mountainShape: {
    position: "absolute",
    bottom: 9,
    left: 3,
    width: 34,
    height: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#7AA183",
  },
  mountainGround: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: "#D9CEB6",
  },
  clubTextBlock: {
    flex: 1,
  },
  clubTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  clubSubtitle: {
    color: SUB_TEXT,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  clubEmptyText: {
    marginBottom: 10,
    color: SUB_TEXT,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  viewAllButton: {
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    borderRadius: 6,
    backgroundColor: "#DDE2E5",
  },
  viewAllText: {
    color: "#636970",
    fontSize: 14,
    fontWeight: "800",
  },
  notificationRow: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "500",
  },
  thinDivider: {
    height: 1,
    marginVertical: 15,
    backgroundColor: "#EEF0F2",
  },
  policyLinkText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "500",
  },
  logoutText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: "500",
  },
  withdrawCard: {
    height: 52,
    justifyContent: "center",
    marginBottom: 2,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 13,
    elevation: 4,
  },
  withdrawText: {
    color: MUTED,
    fontSize: 15,
    fontWeight: "600",
  },
  withdrawModalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.46)",
  },
  withdrawModalBox: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 34,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  withdrawModalTitle: {
    marginBottom: 14,
    color: TEXT,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 29,
    textAlign: "center",
  },
  withdrawModalDescription: {
    marginBottom: 28,
    color: SUB_TEXT,
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 27,
    textAlign: "center",
  },
  withdrawKeepButton: {
    height: 64,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: ACCENT,
  },
  withdrawKeepButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  withdrawConfirmButton: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DFDFDF",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  withdrawConfirmButtonText: {
    color: "#8F8F8F",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  withdrawModalButtonPressed: {
    opacity: 0.82,
  },
  withdrawModalButtonDisabled: {
    opacity: 0.55,
  },
});
