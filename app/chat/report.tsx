import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REPORT_REASONS = [
  "불쾌하거나 부적절한 발언",
  "성희롱 / 성적 표현",
  "사기 또는 금전 요구 의심",
  "욕설 / 비하 / 혐오 표현",
  "스팸 / 광고 목적 이용",
];

export default function ReportScreen() {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const closeReport = () => {
    router.back();
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
            const isSelected = selectedReason === reason;

            return (
              <Pressable
                key={reason}
                style={[styles.reasonItem, isSelected && styles.selectedReason]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={styles.reasonText}>{reason}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomArea}>
        <Pressable
          style={[
            styles.submitButton,
            !selectedReason && styles.submitButtonDisabled,
          ]}
          disabled={!selectedReason}
          onPress={() => setIsSubmitted(true)}
        >
          <Text
            style={[
              styles.submitButtonText,
              !selectedReason && styles.submitButtonTextDisabled,
            ]}
          >
            신고하기
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
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
