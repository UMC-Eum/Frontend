import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import ProfilePreviewCard from "@/components/profile/ProfilePreviewCard";
import {
  usePostProfileMutation,
  usePresignMutation,
  useUploadFileToS3Mutation,
} from "@/hooks/api/useOnboarding";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";
import { ApiFailResponse } from "@/types/api/api";

const DEFAULT_AREA_CODE = "1100000000";
const FALLBACK_VIBE_VECTOR = [0.82, 0.74, 0.66, 0.58, 0.49];
// TODO(PRODUCTION_REMOVE): 백엔드 온보딩 프로필 저장 409 임시 통과입니다.
const TEMP_ALLOW_PROFILE_CONFLICT_FALLBACK = true;

export default function ProfileCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nickname = useOnboardingDraftStore((state) => state.nickname);
  const age = useOnboardingDraftStore((state) => state.age);
  const gender = useOnboardingDraftStore((state) => state.gender);
  const profileImageUri = useOnboardingDraftStore(
    (state) => state.profileImageUri,
  );
  const introText = useOnboardingDraftStore((state) => state.introText);
  const introAudioUrl = useOnboardingDraftStore((state) => state.introAudioUrl);
  const selectedKeywords = useOnboardingDraftStore(
    (state) => state.selectedKeywords,
  );
  const vibeVector = useOnboardingDraftStore((state) => state.vibeVector);
  const resetDraft = useOnboardingDraftStore((state) => state.resetDraft);
  const presignMutation = usePresignMutation();
  const uploadFileMutation = useUploadFileToS3Mutation();
  const postProfileMutation = usePostProfileMutation();

  const handleStart = async () => {
    if (!nickname || !age || !gender) {
      Alert.alert("프로필 정보가 부족해요.", "이름, 나이, 성별을 다시 확인해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const profileImageUrl = await uploadProfileImageIfNeeded(
        profileImageUri,
        presignMutation.mutateAsync,
        uploadFileMutation.mutateAsync,
      );

      await postProfileMutation.mutateAsync({
        nickname,
        gender,
        birthDate: buildBirthDateFromAge(age),
        areaCode: DEFAULT_AREA_CODE,
        introText:
          introText ||
          `안녕하세요. ${selectedKeywords.slice(0, 3).join(", ")}에 관심이 많아요.`,
        introAudioUrl,
        profileImageUrl,
        selectedKeywords,
        vibeVector: vibeVector.length > 0 ? vibeVector : FALLBACK_VIBE_VECTOR,
      });

      resetDraft();
      router.replace("/(tabs)" as never);
    } catch (error) {
      console.error("Profile submit error:", error);
      if (shouldBypassProfileConflict(error)) {
        console.warn(
          "TODO(PRODUCTION_REMOVE): 온보딩 프로필 저장 409를 임시 통과합니다.",
          isAxiosError(error) ? error.response?.data : error,
        );
        router.replace("/(tabs)" as never);
        return;
      }

      Alert.alert("프로필을 저장하지 못했어요.", "잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {nickname || "루씨"}님의 프로필이{"\n"}
          준비됐어요! 🎉
        </Text>

        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>다른 분들에게는 이렇게 보여요</Text>
          <ProfilePreviewCard
            imageUri={profileImageUri}
            name={nickname || "루씨"}
            age={age ?? 53}
            keywords={selectedKeywords}
          />
        </View>

        <Pressable
          style={[
            styles.startButton,
            isSubmitting && styles.startButtonDisabled,
          ]}
          onPress={handleStart}
          disabled={isSubmitting}
        >
          <Text style={styles.startButtonText}>
            {isSubmitting ? "저장 중..." : "시작하기"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function buildBirthDateFromAge(age: number) {
  const currentYear = new Date().getFullYear();
  return `${currentYear - age}-01-01`;
}

async function uploadProfileImageIfNeeded(
  uri: string | null,
  presign: (body: {
    fileName: string;
    contentType: string;
    purpose: string;
  }) => Promise<{
    uploadUrl: string;
    fileUrl: string;
    expiresAt: string;
    requiredHeaders?: Record<string, string>;
  }>,
  upload: (body: {
    uploadUrl: string;
    file: Blob | File;
    requiredHeaders?: Record<string, string>;
  }) => Promise<unknown>,
) {
  if (!uri || uri === "default") {
    return undefined;
  }

  if (uri.startsWith("http")) {
    return uri;
  }

  const contentType = inferImageContentType(uri);
  const fileName = `profile-${Date.now()}.${contentType.split("/")[1] || "jpg"}`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const file = blob.type ? blob : blob.slice(0, blob.size, contentType);
  const presignData = await presign({
    fileName,
    contentType,
    purpose: "PROFILE_IMAGE",
  });

  await upload({
    uploadUrl: presignData.uploadUrl,
    file,
    requiredHeaders: presignData.requiredHeaders,
  });
  return presignData.fileUrl;
}

function inferImageContentType(uri: string) {
  const normalized = uri.toLowerCase();
  if (normalized.includes(".png")) return "image/png";
  if (normalized.includes(".webp")) return "image/webp";
  return "image/jpeg";
}

function shouldBypassProfileConflict(error: unknown) {
  if (!__DEV__ || !TEMP_ALLOW_PROFILE_CONFLICT_FALLBACK) {
    return false;
  }

  if (!isAxiosError<ApiFailResponse>(error)) {
    return false;
  }

  return (
    error.response?.status === 409 &&
    error.response.data?.error?.code === "PROF-001"
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
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "600",
    color: "#202020",
  },
  previewSection: {
    gap: 16,
    marginTop: 42,
  },
  previewLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#636970",
  },
  startButton: {
    marginTop: 24,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FF3E70",
  },
  startButtonDisabled: {
    opacity: 0.68,
  },
  startButtonText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
