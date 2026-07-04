import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  MeetingConfirmDialog,
  MeetingEmptyState,
  MeetingLoadMoreButton,
  MeetingMemberRow,
  MeetingRequestCard,
  MeetingSectionHeader,
} from "@/components/meeting/MeetingManageParts";
import {
  MEETING_COLORS,
  MeetingScreenHeader,
  MeetingSummaryCard,
} from "@/components/meeting/MeetingCreateParts";
import { formatDday } from "@/components/meeting/meetingSchedule";
import {
  useClubMembersInfiniteQuery,
  useKickClubMemberMutation,
  useUpdateClubMemberStatusMutation,
} from "@/hooks/api/useHost";
import { useMeetingDetailQuery } from "@/hooks/api/useMeetings";
import type { IClubMemberItem } from "@/types/api/host/hostDTO";

type ManageAction =
  | { type: "reject"; member: IClubMemberItem }
  | { type: "kick"; member: IClubMemberItem };

export default function MeetingManageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clubId?: string; meetingId?: string }>();
  const clubId = Number(params.clubId);
  const meetingId = Number(params.meetingId);
  const hasValidParams = Number.isFinite(clubId) && Number.isFinite(meetingId);
  const [pendingAction, setPendingAction] = useState<ManageAction | null>(null);
  const [actionError, setActionError] = useState("");

  const meetingQuery = useMeetingDetailQuery(clubId, meetingId, hasValidParams);
  const pendingMembersQuery = useClubMembersInfiniteQuery(
    clubId,
    { status: "PENDING", limit: 20 },
    hasValidParams,
  );
  const activeMembersQuery = useClubMembersInfiniteQuery(
    clubId,
    { status: "ACTIVE", limit: 20 },
    hasValidParams,
  );
  const updateMemberStatusMutation = useUpdateClubMemberStatusMutation(clubId);
  const kickMemberMutation = useKickClubMemberMutation(clubId);
  const isMutating =
    updateMemberStatusMutation.isPending || kickMemberMutation.isPending;

  const pendingMembers = useMemo(
    () =>
      pendingMembersQuery.data?.pages.flatMap((page) => page.members) ?? [],
    [pendingMembersQuery.data],
  );
  const activeMembers = useMemo(
    () => activeMembersQuery.data?.pages.flatMap((page) => page.members) ?? [],
    [activeMembersQuery.data],
  );

  const meeting = meetingQuery.data;
  const nextDate = meeting?.nextOccurrenceAt
    ? new Date(meeting.nextOccurrenceAt)
    : null;
  const ddayText = nextDate ? formatDday(nextDate) : "D-?";
  const dateText =
    meeting?.dateLabel ??
    (nextDate
      ? `${nextDate.getMonth() + 1}/${nextDate.getDate()} ${String(
          nextDate.getHours(),
        ).padStart(2, "0")}:${String(nextDate.getMinutes()).padStart(2, "0")}`
      : "일정 정보 없음");
  const attendanceCount = activeMembers.length;
  const capacity = meeting?.capacity ?? 0;

  const approveMember = async (member: IClubMemberItem) => {
    setActionError("");
    try {
      await updateMemberStatusMutation.mutateAsync({
        userId: member.userId,
        body: { status: "ACTIVE" },
      });
    } catch {
      setActionError("신청 승인에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    setActionError("");

    try {
      if (pendingAction.type === "reject") {
        await updateMemberStatusMutation.mutateAsync({
          userId: pendingAction.member.userId,
          body: { status: "REJECTED" },
        });
      } else {
        await kickMemberMutation.mutateAsync({
          userId: pendingAction.member.userId,
        });
      }
      setPendingAction(null);
    } catch {
      setActionError(
        pendingAction.type === "reject"
          ? "신청 거절에 실패했어요. 잠시 후 다시 시도해주세요."
          : "멤버 퇴장 처리에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <MeetingScreenHeader
        title="정기모임 관리"
        onPressIcon={() => router.back()}
      />

      {!hasValidParams ? (
        <View style={styles.centerState}>
          <Text style={styles.centerStateText}>정기모임 정보를 찾을 수 없어요.</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {meetingQuery.isLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={MEETING_COLORS.pink} />
            </View>
          ) : meeting ? (
            <MeetingSummaryCard
              title={meeting.name}
              dateText={dateText}
              location={meeting.spot}
              cost={meeting.cost ?? "없음"}
              ddayText={ddayText}
            />
          ) : (
            <MeetingEmptyState label="정기모임 상세 정보를 불러오지 못했어요." />
          )}

          <View style={styles.requestSection}>
            <MeetingSectionHeader
              title="신청 관리"
              countLabel={String(pendingMembers.length)}
            />

            {pendingMembersQuery.isLoading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator color={MEETING_COLORS.pink} />
              </View>
            ) : pendingMembers.length > 0 ? (
              <View style={styles.requestList}>
                {pendingMembers.map((member) => (
                  <MeetingRequestCard
                    key={member.clubUserId}
                    member={member}
                    disabled={isMutating}
                    onApprove={approveMember}
                    onReject={(nextMember) =>
                      setPendingAction({ type: "reject", member: nextMember })
                    }
                  />
                ))}
                {pendingMembersQuery.hasNextPage ? (
                  <MeetingLoadMoreButton
                    isLoading={pendingMembersQuery.isFetchingNextPage}
                    onPress={() => pendingMembersQuery.fetchNextPage()}
                  />
                ) : null}
              </View>
            ) : (
              <MeetingEmptyState label="승인을 기다리는 신청이 없어요." />
            )}
          </View>

          <View style={styles.dividerBand} />

          <View style={styles.memberSection}>
            <MeetingSectionHeader
              title="참석 현황"
              countVariant="text"
              countLabel={
                capacity > 0
                  ? `(${attendanceCount}/${capacity})`
                  : `(${attendanceCount})`
              }
            />

            {activeMembersQuery.isLoading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator color={MEETING_COLORS.pink} />
              </View>
            ) : activeMembers.length > 0 ? (
              <View style={styles.memberList}>
                {activeMembers.map((member) => (
                  <MeetingMemberRow
                    key={member.clubUserId}
                    member={member}
                    disabled={isMutating}
                    onKick={(nextMember) =>
                      setPendingAction({ type: "kick", member: nextMember })
                    }
                  />
                ))}
                {activeMembersQuery.hasNextPage ? (
                  <MeetingLoadMoreButton
                    isLoading={activeMembersQuery.isFetchingNextPage}
                    onPress={() => activeMembersQuery.fetchNextPage()}
                  />
                ) : null}
              </View>
            ) : (
              <MeetingEmptyState label="아직 참여 중인 멤버가 없어요." />
            )}
          </View>

          {actionError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{actionError}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      <MeetingConfirmDialog
        visible={!!pendingAction}
        title={pendingAction?.type === "kick" ? "멤버 퇴장" : "신청 거절"}
        description={
          pendingAction
            ? pendingAction.type === "kick"
              ? `${pendingAction.member.nickname}님을 모임에서 퇴장 처리할까요?`
              : `거절 시 ${pendingAction.member.nickname}님의 모임참가가 불가능합니다.`
            : ""
        }
        confirmLabel={pendingAction?.type === "kick" ? "퇴장" : "거절"}
        confirmVariant="danger"
        isSubmitting={isMutating}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MEETING_COLORS.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: MEETING_COLORS.white,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  loadingCard: {
    marginHorizontal: 20,
    minHeight: 112,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MEETING_COLORS.white,
  },
  requestSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  requestList: {
    gap: 12,
  },
  dividerBand: {
    height: 8,
    marginTop: 12,
    backgroundColor: MEETING_COLORS.gray100,
  },
  memberSection: {
    paddingTop: 12,
    gap: 12,
  },
  memberList: {
    width: "100%",
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MEETING_COLORS.red,
    backgroundColor: "#FFF1F1",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: MEETING_COLORS.red,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  centerStateText: {
    color: MEETING_COLORS.gray700,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "center",
  },
  retryButton: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MEETING_COLORS.pink,
  },
  retryButtonText: {
    color: MEETING_COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
});
