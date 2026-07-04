import { Image } from "expo-image";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import type { IClubMemberItem } from "@/types/api/host/hostDTO";

import { MEETING_COLORS } from "./MeetingCreateParts";
import { formatCompactDate, formatJoinedDate } from "./meetingSchedule";

interface MeetingSectionHeaderProps {
  title: string;
  countLabel?: string;
  countVariant?: "badge" | "text";
  style?: ViewStyle;
}

export function MeetingSectionHeader({
  title,
  countLabel,
  countVariant = "badge",
  style,
}: MeetingSectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {countLabel && countVariant === "badge" ? (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{countLabel}</Text>
        </View>
      ) : null}
      {countLabel && countVariant === "text" ? (
        <Text style={styles.countText}>{countLabel}</Text>
      ) : null}
    </View>
  );
}

interface MeetingRequestCardProps {
  member: IClubMemberItem;
  disabled?: boolean;
  onApprove: (member: IClubMemberItem) => void;
  onReject: (member: IClubMemberItem) => void;
}

export function MeetingRequestCard({
  member,
  disabled = false,
  onApprove,
  onReject,
}: MeetingRequestCardProps) {
  const requestedAt = formatCompactDate(member.joinedAt);

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestTopRow}>
        <View style={styles.memberIdentity}>
          <MeetingMemberAvatar member={member} />
          <View style={styles.memberTextBlock}>
            <Text style={styles.requestName} numberOfLines={1}>
              {member.nickname}
            </Text>
            <Text style={styles.memberSubText} numberOfLines={1}>
              신청 대기 중
            </Text>
          </View>
        </View>
        {requestedAt ? (
          <Text style={styles.requestDate}>{requestedAt} 신청</Text>
        ) : null}
      </View>

      <View style={styles.requestActions}>
        <ActionButton
          label="거절"
          variant="secondary"
          disabled={disabled}
          onPress={() => onReject(member)}
        />
        <ActionButton
          label="승인"
          variant="primary"
          disabled={disabled}
          onPress={() => onApprove(member)}
        />
      </View>
    </View>
  );
}

interface MeetingMemberRowProps {
  member: IClubMemberItem;
  disabled?: boolean;
  onKick: (member: IClubMemberItem) => void;
}

export function MeetingMemberRow({
  member,
  disabled = false,
  onKick,
}: MeetingMemberRowProps) {
  const joinedAt = formatJoinedDate(member.joinedAt);
  const canKick = member.authority !== "HOST";

  return (
    <View style={styles.memberRow}>
      <View style={styles.memberIdentity}>
        <MeetingMemberAvatar member={member} />
        <View style={styles.memberTextBlock}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName} numberOfLines={1}>
              {member.nickname}
            </Text>
            {member.authority !== "GENERAL" ? (
              <View style={styles.authorityBadge}>
                <Text style={styles.authorityText}>
                  {member.authority === "HOST" ? "운영자" : "매니저"}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.memberSubText} numberOfLines={1}>
            {joinedAt ? `가입일 ${joinedAt}` : "가입일 정보 없음"}
          </Text>
        </View>
      </View>

      {canKick ? (
        <Pressable
          style={[styles.kickButton, disabled && styles.disabledButton]}
          onPress={() => onKick(member)}
          disabled={disabled}
        >
          <Text style={styles.kickText}>퇴장</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MeetingEmptyState({ label }: { label: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

interface MeetingLoadMoreButtonProps {
  label?: string;
  isLoading?: boolean;
  onPress: () => void;
}

export function MeetingLoadMoreButton({
  label = "더 보기",
  isLoading = false,
  onPress,
}: MeetingLoadMoreButtonProps) {
  return (
    <Pressable
      style={styles.loadMoreButton}
      onPress={onPress}
      disabled={isLoading}
    >
      <Text style={styles.loadMoreText}>{isLoading ? "불러오는 중..." : label}</Text>
    </Pressable>
  );
}

interface MeetingConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "danger";
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function MeetingConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  confirmVariant = "primary",
  isSubmitting = false,
  onCancel,
  onConfirm,
}: MeetingConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.dialog}>
          <View style={styles.dialogTextBlock}>
            <Text style={styles.dialogTitle}>{title}</Text>
            <Text style={styles.dialogDescription}>{description}</Text>
          </View>
          <View style={styles.dialogActions}>
            <ActionButton
              label="취소"
              variant="secondary"
              disabled={isSubmitting}
              onPress={onCancel}
              radius={7}
            />
            <ActionButton
              label={isSubmitting ? "처리 중..." : confirmLabel}
              variant={confirmVariant === "danger" ? "danger" : "primary"}
              disabled={isSubmitting}
              onPress={onConfirm}
              radius={7}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MeetingMemberAvatar({ member }: { member: IClubMemberItem }) {
  if (member.profileImageUrl) {
    return (
      <Image
        source={{ uri: member.profileImageUrl }}
        style={styles.avatar}
        contentFit="cover"
      />
    );
  }

  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>{member.nickname.slice(0, 1)}</Text>
    </View>
  );
}

function ActionButton({
  label,
  variant,
  disabled = false,
  radius = 14,
  onPress,
}: {
  label: string;
  variant: "primary" | "secondary" | "danger";
  disabled?: boolean;
  radius?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        { borderRadius: radius },
        variant === "primary" && styles.primaryButton,
        variant === "secondary" && styles.secondaryButton,
        variant === "danger" && styles.dangerButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.actionButtonText,
          variant === "secondary" && styles.secondaryButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionTitle: {
    color: MEETING_COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  countBadge: {
    height: 24,
    minWidth: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MEETING_COLORS.pink,
  },
  countBadgeText: {
    color: MEETING_COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  countText: {
    color: MEETING_COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  requestCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray300,
    backgroundColor: MEETING_COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  requestTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  memberIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MEETING_COLORS.gray300,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9D9D9",
  },
  avatarText: {
    color: MEETING_COLORS.gray700,
    fontSize: 18,
    fontWeight: "600",
  },
  memberTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  requestName: {
    color: MEETING_COLORS.text,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23,
  },
  requestDate: {
    color: MEETING_COLORS.gray500,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memberName: {
    maxWidth: 168,
    color: MEETING_COLORS.text,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23,
  },
  authorityBadge: {
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF6B8E",
    backgroundColor: MEETING_COLORS.pink50,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  authorityText: {
    color: MEETING_COLORS.pink,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 20,
  },
  memberSubText: {
    color: MEETING_COLORS.gray500,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  requestActions: {
    height: 48,
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  primaryButton: {
    backgroundColor: MEETING_COLORS.pink,
  },
  secondaryButton: {
    backgroundColor: MEETING_COLORS.gray150,
  },
  dangerButton: {
    backgroundColor: MEETING_COLORS.red,
  },
  disabledButton: {
    opacity: 0.55,
  },
  actionButtonText: {
    color: MEETING_COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
    textAlign: "center",
  },
  secondaryButtonText: {
    color: MEETING_COLORS.gray700,
  },
  memberRow: {
    width: "100%",
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: MEETING_COLORS.gray150,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  kickButton: {
    width: 64,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MEETING_COLORS.gray150,
  },
  kickText: {
    color: MEETING_COLORS.gray700,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  emptyState: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray150,
    backgroundColor: MEETING_COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyText: {
    color: MEETING_COLORS.gray500,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    textAlign: "center",
  },
  loadMoreButton: {
    marginTop: 8,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MEETING_COLORS.white,
  },
  loadMoreText: {
    color: MEETING_COLORS.gray700,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 38,
  },
  dialog: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: MEETING_COLORS.white,
    padding: 24,
    gap: 20,
  },
  dialogTextBlock: {
    gap: 12,
    alignItems: "center",
  },
  dialogTitle: {
    color: MEETING_COLORS.text,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
    textAlign: "center",
  },
  dialogDescription: {
    color: MEETING_COLORS.gray700,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "center",
  },
  dialogActions: {
    height: 48,
    flexDirection: "row",
    gap: 12,
  },
});
