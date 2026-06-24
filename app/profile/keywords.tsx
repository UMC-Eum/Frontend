import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

const DEFAULT_KEYWORDS = [
  "문화생활",
  "음악감상",
  "등산",
  "산책",
  "요리",
  "뜨개질",
  "게임",
  "그림",
  "헬스",
  "영화",
];

const MAX_SELECTED_KEYWORDS = 5;

export default function ProfileKeywordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const nickname = useOnboardingDraftStore((state) => state.nickname) || "루씨";
  const draftKeywords = useOnboardingDraftStore(
    (state) => state.selectedKeywords,
  );
  const setSelectedKeywords = useOnboardingDraftStore(
    (state) => state.setSelectedKeywords,
  );
  const introText = useOnboardingDraftStore((state) => state.introText);
  const setIntroText = useOnboardingDraftStore((state) => state.setIntroText);
  const keywordOptions = useMemo(
    () => Array.from(new Set([...draftKeywords, ...DEFAULT_KEYWORDS])),
    [draftKeywords],
  );
  const [selected, setSelected] = useState<string[]>(
    draftKeywords.length > 0 ? draftKeywords.slice(0, MAX_SELECTED_KEYWORDS) : [],
  );

  const toggleKeyword = (keyword: string) => {
    setSelected((prev) => {
      if (prev.includes(keyword)) {
        return prev.filter((item) => item !== keyword);
      }

      if (prev.length >= MAX_SELECTED_KEYWORDS) {
        return prev;
      }

      return [...prev, keyword];
    });
  };

  const handleNext = () => {
    setSelectedKeywords(selected);
    if (!introText) {
      setIntroText(
        `안녕하세요. ${selected.slice(0, 3).join(", ")}에 관심이 많고 편안한 대화를 좋아해요.`,
      );
    }
    router.push("/profile/complete" as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={28} color="#A6AFB6" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.aiRow}>
          <Ionicons name="sparkles" size={18} color="#FC3367" />
          <Text style={styles.aiText}>AI가 분석을 완료했어요.</Text>
        </View>

        <Text style={styles.title}>
          이 내용이 {nickname}님을{"\n"}
          잘 표현하나요?
        </Text>
        <Text style={styles.subtitle}>
          필요한 키워드를 선택하거나 직접 추가할 수도 있어요.{"\n"}
          최대 5개까지 고를수있어요.
        </Text>

        <Text style={styles.countText}>
          {selected.length}
          <Text style={styles.countMuted}>/{MAX_SELECTED_KEYWORDS}</Text>
        </Text>

        <View style={styles.keywordList}>
          {keywordOptions.map((keyword) => {
            const isSelected = selected.includes(keyword);

            return (
              <Pressable
                key={keyword}
                style={[styles.keywordChip, isSelected && styles.keywordChipActive]}
                onPress={() => toggleKeyword(keyword)}
              >
                <Text
                  style={[
                    styles.keywordText,
                    isSelected && styles.keywordTextActive,
                  ]}
                >
                  {keyword}
                </Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.keywordChip}>
            <Text style={styles.keywordText}>...더보기</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          style={[styles.bottomButton, styles.secondaryButton]}
          onPress={() => router.replace("/profile/welcome" as never)}
        >
          <Text style={styles.secondaryButtonText}>재녹음</Text>
        </Pressable>
        <Pressable
          style={[
            styles.bottomButton,
            selected.length > 0 ? styles.primaryButton : styles.disabledButton,
          ]}
          onPress={selected.length > 0 ? handleNext : undefined}
          disabled={selected.length === 0}
        >
          <Text
            style={[
              styles.primaryButtonText,
              selected.length === 0 && styles.disabledButtonText,
            ]}
          >
            다음
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
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  aiText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#202020",
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "600",
    color: "#202020",
  },
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#636970",
  },
  countText: {
    marginTop: 52,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: "#FC3367",
  },
  countMuted: {
    color: "#A6AFB6",
  },
  keywordList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },
  keywordChip: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    backgroundColor: "#FFFFFF",
  },
  keywordChipActive: {
    borderWidth: 1.5,
    borderColor: "#FC3367",
    backgroundColor: "#FFE3E7",
  },
  keywordText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#202020",
  },
  keywordTextActive: {
    fontWeight: "600",
    color: "#FC3367",
  },
  bottomArea: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
  bottomButton: {
    flex: 1,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  secondaryButton: {
    backgroundColor: "#E9ECED",
  },
  primaryButton: {
    backgroundColor: "#FF3E70",
  },
  disabledButton: {
    backgroundColor: "#E9ECED",
  },
  secondaryButtonText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#636970",
  },
  primaryButtonText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButtonText: {
    color: "#636970",
  },
});
