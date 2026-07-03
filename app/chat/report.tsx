import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCreateReportMutation } from "@/hooks/api/useSocials";
import type { ReportCategory } from "@/types/api/socials/socialsDTO";

type ReportReason = {
  label: string;
  category: ReportCategory;
  defaultReason: string;
};

const REPORT_REASONS: ReportReason[] = [
  {
    label: "불쾌하거나 부적절한 발언",
    category: "INAPPROPRIATE",
    defaultReason: "불쾌하거나 부적절한 발언",
  },
  {
    label: "성희롱 / 성적 표현",
    category: "SEXUAL_HARASSMENT",
    defaultReason: "성희롱 또는 성적 표현",
  },
  {
    label: "사기 또는 금전 요구 의심",
    category: "MONEY_REQUEST",
    defaultReason: "사기 또는 금전 요구 의심",
  },
  {
    label: "욕설 / 비하 / 혐오 표현",
    category: "ABUSE",
    defaultReason: "욕설 / 비하 / 혐오 표현",
  },
  {
    label: "스팸 / 광고 목적 이용",
    category: "SPAM",
    defaultReason: "스팸 / 광고 목적 이용",
  },
  {
    label: "기타",
    category: "OTHERS",
    defaultReason: "기타 신고 사유",
  },
];

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    targetUserId?: string;
    chatRoomId?: string;
    nickname?: string;
  }>();
  const createReportMutation = useCreateReportMutation();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const targetUserId = parsePositiveInt(params.targetUserId);
  const chatRoomId = parsePositiveInt(params.chatRoomId);
  const isSubmitting = createReportMutation.isPending;

  const closeReport = () => {
    router.back();
  };

  const handleSubmit = () => {
    if (!selectedReason || isSubmitting) return;

    if (!targetUserId) {
      Alert.alert("신고 실패", "대화방 정보를 불러온 뒤 다시 시도해주세요.");
      return;
    }

    createReportMutation.mutate(
      {
        targetUserId,
        category: selectedReason.category,
        reason: selectedReason.defaultReason,
        ...(chatRoomId ? { chatRoomId } : {}),
      },
      {
        onSuccess: () => setIsSubmitted(true),
        onError: () => {
          Alert.alert("신고 실패", "잠시 후 다시 시도해주세요.");
        },
      },
    );
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={closeReport}>
            <Ionicons name="chevron-back" size={24} color="#A6AFB6" />
          </Pressable>
        </View>

        <View style={styles.completeContainer}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.completeTitle}>신고가 접수되었습니다</Text>
          <Text style={styles.completeSubtitle}>
            더 나은 이음을 위해 신고해주셔서 감사합니다{"\n"}
            신고된 내용은 검토하여 조치할 예정이에요.
          </Text>
        </View>

        <View style={styles.bottomArea}>
          <Pressable style={styles.submitButton} onPress={closeReport}>
            <Text style={styles.submitButtonText}>닫기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={closeReport}>
          <Ionicons name="chevron-back" size={24} color="#A6AFB6" />
        </Pressable>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>
          사용자를 신고하려는{"\n"}이유를 선택해주세요.
        </Text>

        <View style={styles.reasonList}>
          {REPORT_REASONS.map((reason) => {
            const isSelected = selectedReason?.category === reason.category;

            return (
              <Pressable
                key={reason.category}
                style={[styles.reasonItem, isSelected && styles.selectedReason]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={styles.reasonText}>{reason.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomArea}>
        <Pressable
          style={[
            styles.submitButton,
            (!selectedReason || isSubmitting) && styles.submitButtonDisabled,
          ]}
          disabled={!selectedReason || isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.submitButtonText,
                !selectedReason && styles.submitButtonTextDisabled,
              ]}
            >
              신고하기
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function parsePositiveInt(value?: string | string[]) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    color: "#202020",
    marginBottom: 28,
  },
  reasonList: {
    borderTopWidth: 1,
    borderTopColor: "#E6E9EC",
  },
  reasonItem: {
    height: 46,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E9EC",
  },
  selectedReason: {
    backgroundColor: "#FFF0F3",
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#202020",
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
  submitButton: {
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3E70",
  },
  submitButtonDisabled: {
    backgroundColor: "#E9EEF1",
  },
  submitButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  submitButtonTextDisabled: {
    color: "#6F7780",
  },
  completeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  checkCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3E70",
    marginBottom: 30,
  },
  completeTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    color: "#202020",
    marginBottom: 14,
  },
  completeSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: "#6F7780",
    textAlign: "center",
  },
});
