import { Ionicons } from "@expo/vector-icons";
import { Image } from "@/components/Image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useClubMembersInfiniteQuery,
  useKickClubMemberMutation,
  useUpdateClubMemberStatusMutation,
} from "@/hooks/api/useHost";
import type { IClubMemberItem } from "@/types/api/host/hostDTO";

const COLORS = {
  pink: "#FF3E70",
  pink50: "#FFF0F2",
  pink400: "#FF6B8E",
  text: "#202020",
  gray700: "#636970",
  gray500: "#A6AFB6",
  gray300: "#DEE3E5",
  gray150: "#E9ECED",
  gray100: "#F8FAFB",
  white: "#FFFFFF",
};

function parseClubId(value?: string) {
  if (!value) return NaN;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : NaN;
}

function isClubMemberItem(member: unknown): member is IClubMemberItem {
  return (
    !!member &&
    typeof member === "object" &&
    typeof (member as IClubMemberItem).userId === "number"
  );
}

// 탈퇴/강퇴/거절된 멤버는 목록에서 제외한다. status가 없으면 활성으로 간주한다.
const INACTIVE_MEMBER_STATUSES = new Set(["LEFT", "KICKED", "REJECTED"]);
function isActiveMember(member: IClubMemberItem) {
  return !member.status || !INACTIVE_MEMBER_STATUSES.has(member.status);
}

// "2026-05-10T..." → "2026.05.10", 신청 목록은 "05.10 신청" 형태로 다듬는다.
function formatJoinedDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function formatRequestedDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day} 신청`;
}

function formatNameAge(member: IClubMemberItem) {
  return typeof member.age === "number"
    ? `${member.nickname} · ${member.age}세`
    : member.nickname;
}

export default function ClubManageMembersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ clubId?: string }>();
  const clubId = parseClubId(params.clubId);
  const hasValidClub = Number.isFinite(clubId);

  const requestsQuery = useClubMembersInfiniteQuery(
    clubId,
    { status: "PENDING", limit: 20 },
    hasValidClub,
  );
  const membersQuery = useClubMembersInfiniteQuery(
    clubId,
    { status: "ACTIVE", limit: 20 },
    hasValidClub,
  );
  const statusMutation = useUpdateClubMemberStatusMutation(clubId);
  const kickMutation = useKickClubMemberMutation(clubId);
  const isMutating = statusMutation.isPending || kickMutation.isPending;

  // 다른 기기/계정에서의 변경(탈퇴 등)을 반영하도록 화면 재진입 시 목록을 다시 불러온다.
  const refetchRequests = requestsQuery.refetch;
  const refetchMembers = membersQuery.refetch;
  useFocusEffect(
    useCallback(() => {
      if (!hasValidClub) return;
      refetchRequests();
      refetchMembers();
    }, [hasValidClub, refetchRequests, refetchMembers]),
  );

  const requests = useMemo(
    () =>
      (
        requestsQuery.data?.pages.flatMap((page) => page.members ?? []) ?? []
      ).filter(isClubMemberItem),
    [requestsQuery.data],
  );
  const members = useMemo(
    () =>
      (membersQuery.data?.pages.flatMap((page) => page.members ?? []) ?? [])
        .filter(isClubMemberItem)
        // 서버가 status 필터 없이 전체를 내려줄 수 있어, 탈퇴·강퇴·거절 멤버는 제외한다.
        .filter((member) => isActiveMember(member)),
    [membersQuery.data],
  );

  const approveRequest = (member: IClubMemberItem) => {
    if (isMutating) return;
    statusMutation.mutate(
      { userId: member.userId, body: { status: "ACTIVE" } },
      {
        onError: () =>
          Alert.alert("승인 실패", "잠시 후 다시 시도해주세요."),
      },
    );
  };

  const rejectRequest = (member: IClubMemberItem) => {
    if (isMutating) return;
    Alert.alert(
      "가입 신청 거절",
      `거절 시 ${member.nickname}님은 이 동호회에 참여할 수 없어요.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "거절",
          style: "destructive",
          onPress: () =>
            statusMutation.mutate(
              { userId: member.userId, body: { status: "REJECTED" } },
              {
                onError: () =>
                  Alert.alert("거절 실패", "잠시 후 다시 시도해주세요."),
              },
            ),
        },
      ],
    );
  };

  const kickMember = (member: IClubMemberItem) => {
    if (isMutating) return;
    Alert.alert("멤버 퇴장", `${member.nickname}님을 퇴장 처리할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "퇴장",
        style: "destructive",
        onPress: () =>
          kickMutation.mutate(
            { userId: member.userId },
            {
              onError: () =>
                Alert.alert("퇴장 실패", "잠시 후 다시 시도해주세요."),
            },
          ),
      },
    ]);
  };

  const isLoading = requestsQuery.isLoading || membersQuery.isLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header title="멤버 관리" onBack={() => router.back()} />

      {!hasValidClub ? (
        <View style={styles.centerBox}>
          <Text style={styles.centerText}>동호회 정보를 찾을 수 없어요.</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.pink} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.requestSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>가입신청</Text>
              <View style={styles.countChip}>
                <Text style={styles.countChipText}>{requests.length}</Text>
              </View>
            </View>

            {requests.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  {requestsQuery.isError
                    ? "가입신청을 불러오지 못했어요."
                    : "대기 중인 가입신청이 없어요."}
                </Text>
              </View>
            ) : (
              <View style={styles.requestList}>
                {requests.map((request) => (
                  <View key={request.userId} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <View style={styles.profileRow}>
                        {request.profileImageUrl ? (
                          <Image
                            source={{ uri: request.profileImageUrl }}
                            style={styles.avatar}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.avatar} />
                        )}
                        <View style={styles.profileInfo}>
                          <Text style={styles.profileName}>
                            {formatNameAge(request)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.requestDate}>
                        {formatRequestedDate(request.requestedAt)}
                      </Text>
                    </View>

                    {request.message ? (
                      <View style={styles.messageBox}>
                        <Text style={styles.messageText}>{request.message}</Text>
                      </View>
                    ) : null}

                    <View style={styles.actionRow}>
                      <Pressable
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => rejectRequest(request)}
                        disabled={isMutating}
                      >
                        <Text style={styles.rejectText}>거절</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => approveRequest(request)}
                        disabled={isMutating}
                      >
                        <Text style={styles.approveText}>승인</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.dividerBand} />

          <View style={styles.memberTitleRow}>
            <Text style={styles.sectionTitle}>멤버 목록</Text>
          </View>

          {members.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {membersQuery.isError
                  ? "멤버를 불러오지 못했어요."
                  : "아직 멤버가 없어요."}
              </Text>
            </View>
          ) : (
            <View style={styles.memberList}>
              {members.map((member) => {
                const isOwner = member.authority === "HOST";
                return (
                  <View key={member.userId} style={styles.memberRow}>
                    <View style={styles.profileRow}>
                      {member.profileImageUrl ? (
                        <Image
                          source={{ uri: member.profileImageUrl }}
                          style={styles.avatar}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.avatar} />
                      )}
                      <View style={styles.memberInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.profileName}>
                            {formatNameAge(member)}
                          </Text>
                          {isOwner ? (
                            <View style={styles.ownerChip}>
                              <Text style={styles.ownerChipText}>운영자</Text>
                            </View>
                          ) : null}
                        </View>
                        {formatJoinedDate(member.joinedAt) ? (
                          <Text style={styles.memberJoinedAt}>
                            가입일 {formatJoinedDate(member.joinedAt)}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {!isOwner ? (
                      <Pressable
                        style={styles.kickButton}
                        onPress={() => kickMember(member)}
                        disabled={isMutating}
                      >
                        <Text style={styles.kickText}>퇴장</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.headerIconButton} onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={28} color={COLORS.text} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerIconButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 24, lineHeight: 30, fontWeight: "700", color: COLORS.text },
  scrollView: { flex: 1 },
  requestSection: { paddingHorizontal: 20, paddingTop: 8 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sectionTitle: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.text },
  countChip: {
    height: 24,
    minWidth: 24,
    paddingHorizontal: 8,
    borderRadius: 100,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  countChipText: { fontSize: 14, lineHeight: 20, fontWeight: "600", color: COLORS.white },
  requestList: { marginTop: 16, gap: 12 },
  requestCard: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  requestHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.gray150 },
  profileInfo: { gap: 4 },
  profileName: { fontSize: 18, lineHeight: 23, fontWeight: "500", color: COLORS.text },
  requestDate: { fontSize: 14, lineHeight: 20, fontWeight: "500", color: COLORS.gray500 },
  messageBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "rgba(222,227,229,0.4)",
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  messageText: { fontSize: 18, lineHeight: 23, fontWeight: "500", color: COLORS.text },
  actionRow: { flexDirection: "row", gap: 12, height: 48 },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: { backgroundColor: COLORS.gray150 },
  approveButton: { backgroundColor: COLORS.pink },
  rejectText: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.gray700 },
  approveText: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.white },
  dividerBand: { height: 8, marginTop: 16, backgroundColor: COLORS.gray100 },
  memberTitleRow: { paddingHorizontal: 20, paddingTop: 11 },
  memberList: { marginTop: 11 },
  memberRow: {
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray150,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  memberInfo: { gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ownerChip: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.pink400,
    backgroundColor: COLORS.pink50,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerChipText: { fontSize: 12, lineHeight: 20, fontWeight: "500", color: COLORS.pink },
  memberJoinedAt: { fontSize: 14, lineHeight: 20, fontWeight: "500", color: COLORS.gray500 },
  kickButton: {
    width: 64,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.gray150,
    alignItems: "center",
    justifyContent: "center",
  },
  kickText: { fontSize: 16, lineHeight: 24, fontWeight: "500", color: COLORS.gray700 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  centerText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    color: COLORS.gray700,
    textAlign: "center",
  },
  retryButton: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    color: COLORS.pink,
  },
  emptyBox: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    color: COLORS.gray500,
    textAlign: "center",
  },
});
