import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePostVoiceAnalyzeMutation } from "@/hooks/api/useOnboarding";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

const FALLBACK_KEYWORDS = ["문화생활", "음악감상", "등산", "산책", "요리"];
const FALLBACK_INTRO =
  "저는 등산과 문화생활을 좋아하고, 여러 사람들과 즐겁게 어울리는 시간을 좋아해요.";
const FALLBACK_VIBE_VECTOR = [0.82, 0.74, 0.66, 0.58, 0.49];

export default function ProfileAnalyzingScreen() {
  const router = useRouter();
  const hasStarted = useRef(false);
  const userId = useAuthStore((state) => state.user?.userId);
  const introAudioUrl = useOnboardingDraftStore((state) => state.introAudioUrl);
  const nickname = useOnboardingDraftStore((state) => state.nickname) || "루씨";
  const setIntroText = useOnboardingDraftStore((state) => state.setIntroText);
  const setSelectedKeywords = useOnboardingDraftStore(
    (state) => state.setSelectedKeywords,
  );
  const setVibeVector = useOnboardingDraftStore((state) => state.setVibeVector);
  const voiceAnalyzeMutation = usePostVoiceAnalyzeMutation();

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const goNextWithFallback = () => {
      setIntroText(FALLBACK_INTRO);
      setSelectedKeywords(FALLBACK_KEYWORDS.slice(0, 3));
      setVibeVector(FALLBACK_VIBE_VECTOR);
      router.replace("/profile/keywords" as never);
    };

    if (!introAudioUrl || !userId) {
      const timeout = setTimeout(goNextWithFallback, 1200);
      return () => clearTimeout(timeout);
    }

    voiceAnalyzeMutation.mutate(
      {
        userId,
        audioUrl: introAudioUrl,
        language: "ko-KR",
        analysisType: "profile",
      },
      {
        onSuccess: (data) => {
          const interests = data.keywordCandidates.interests.map(
            (keyword) => keyword.text,
          );
          const personalities = data.keywordCandidates.personalities.map(
            (keyword) => keyword.text,
          );
          const keywords = [...interests, ...personalities].slice(0, 12);

          setIntroText(data.summary || data.transcript || FALLBACK_INTRO);
          setSelectedKeywords(
            keywords.length > 0 ? keywords.slice(0, 3) : FALLBACK_KEYWORDS.slice(0, 3),
          );
          setVibeVector(
            data.vibeVector.length > 0 ? data.vibeVector : FALLBACK_VIBE_VECTOR,
          );
          router.replace("/profile/keywords" as never);
        },
        onError: goNextWithFallback,
      },
    );
  }, [
    introAudioUrl,
    router,
    setIntroText,
    setSelectedKeywords,
    setVibeVector,
    userId,
    voiceAnalyzeMutation,
  ]);

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

      <View style={styles.centerContent}>
        <View style={styles.aiOrb}>
          <View style={styles.aiOrbInner}>
            <Text style={styles.dots}>•••</Text>
          </View>
        </View>

        <Text style={styles.title}>잠시만 기다려주세요...</Text>
        <Text style={styles.subtitle}>
          AI가 {nickname}님의 이야기를 정리중이에요!
        </Text>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipBadge}>Tip</Text>
        <Text style={styles.tipText}>
          목소리에는 텍스트보다 3배 더 많은 진심이{"\n"}
          담겨있다는걸 아시나요?
        </Text>
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
  centerContent: {
    alignItems: "center",
    marginTop: 132,
  },
  aiOrb: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 10,
    borderTopColor: "#FFD9C8",
    borderRightColor: "#FFF1EA",
    borderBottomColor: "#FC3367",
    borderLeftColor: "#FF6D85",
  },
  aiOrbInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FC3367",
  },
  dots: {
    marginTop: -12,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#FFFFFF",
  },
  title: {
    marginTop: 40,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "600",
    color: "#202020",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "500",
    color: "#A6AFB6",
    textAlign: "center",
  },
  tipBox: {
    marginHorizontal: 20,
    marginTop: 92,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FC3367",
    borderRadius: 14,
    shadowColor: "#FC3367",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: 12,
  },
  tipBadge: {
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: "#FC3367",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tipText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    color: "#636970",
    textAlign: "center",
  },
});
