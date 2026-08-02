import {
  AudioModule,
  createAudioPlayer,
  RecordingPresets,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { isAxiosError } from "axios";
import type { AudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { postPresign } from "@/api/onboarding/onboardingApi";
import { getMyProfile } from "@/api/users/usersApi";
import {
  AnalyzingView,
  CompletePreviewView,
  IdleRecorder,
  KeywordSelectView,
  PlaybackControls,
  RecordingControls,
  VoiceExamples,
  VoiceHeader,
  VoiceTitle,
  VoiceKeyword,
} from "@/components/profile/ProfileVoiceParts";
import { DEFAULT_PROFILE_IMAGE_URI } from "@/constants/defaultProfileImage";
import {
  PROFILE_INTEREST_KEYWORDS,
  PROFILE_PERSONALITY_KEYWORDS,
} from "@/constants/profileKeywords";
import { usePostVoiceAnalyzeMutation } from "@/hooks/api/useOnboarding";
import { queryKeys } from "@/hooks/api/queryKeys";
import { useUpdateMyProfileMutation } from "@/hooks/api/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";
import type {
  IAnalyzeResponse,
  PresignPurpose,
} from "@/types/api/onboarding/onboardingDTO";
import { ensurePermission } from "@/utils/permissions";
import { resolveBirthDate } from "@/utils/profileVoice";

type VoiceStep =
  | "idle"
  | "recording"
  | "reviewing"
  | "analyzing"
  | "keywords"
  | "complete";

const MIN_RECORDING_SECONDS = 10;
const DEFAULT_AREA_CODE = "1121500000";
const DEFAULT_GENDER = "M";
const INTRO_AUDIO_PURPOSE: PresignPurpose = "PROFILE_INTRO_AUDIO";
const PROFILE_IMAGE_PURPOSE: PresignPurpose = "PROFILE_IMAGE";
const VOICE_ANALYZE_TIMEOUT_MS = 60000;

const MOCK_KEYWORDS: VoiceKeyword[] = [
  { id: "culture", label: "문화생활", category: "interest" },
  { id: "music", label: "음악감상", category: "interest" },
  { id: "hiking", label: "등산", category: "interest" },
  { id: "walk", label: "산책", category: "interest" },
  { id: "cooking", label: "요리", category: "interest" },
  { id: "knitting", label: "뜨개질", category: "interest" },
  { id: "game", label: "게임", category: "interest" },
  { id: "drawing", label: "그림", category: "interest" },
  { id: "health", label: "헬스", category: "interest" },
  { id: "movie", label: "영화", category: "interest" },
  { id: "more", label: "...더보기" },
];
const MORE_INTEREST_KEYWORDS: VoiceKeyword[] = [
  ...PROFILE_INTEREST_KEYWORDS.map((label, index) => ({
    id: `interest-${index}-${label}`,
    label,
    category: "interest" as const,
  })),
  ...PROFILE_PERSONALITY_KEYWORDS.map((label, index) => ({
    id: `personality-${index}-${label}`,
    label,
    category: "personality" as const,
  })),
];

export default function WelcomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authNickname = useAuthStore((state) => state.user?.nickname);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const setAuthUser = useAuthStore((state) => state.setUser);
  const draftNickname = useOnboardingDraftStore((state) => state.nickname);
  const draftAge = useOnboardingDraftStore((state) => state.age);
  const draftGender = useOnboardingDraftStore((state) => state.gender);
  const draftAreaCode = useOnboardingDraftStore((state) => state.areaCode);
  const draftAreaName = useOnboardingDraftStore((state) => state.areaName);
  const draftBirthDate = useOnboardingDraftStore((state) => state.birthDate);
  const profileImageUri = useOnboardingDraftStore(
    (state) => state.profileImageUri,
  );
  const introText = useOnboardingDraftStore((state) => state.introText);
  const introAudioUrl = useOnboardingDraftStore((state) => state.introAudioUrl);
  const setIntroAudioUrl = useOnboardingDraftStore(
    (state) => state.setIntroAudioUrl,
  );
  const draftSelectedKeywords = useOnboardingDraftStore(
    (state) => state.selectedKeywords,
  );
  const setSelectedKeywords = useOnboardingDraftStore(
    (state) => state.setSelectedKeywords,
  );
  const draftPersonalities = useOnboardingDraftStore(
    (state) => state.personalities,
  );
  const draftIdealPersonalities = useOnboardingDraftStore(
    (state) => state.idealPersonalities,
  );
  const setPersonalities = useOnboardingDraftStore(
    (state) => state.setPersonalities,
  );
  const setVibeVector = useOnboardingDraftStore((state) => state.setVibeVector);
  const voiceAnalyzeMutation = usePostVoiceAnalyzeMutation();
  const updateMyProfileMutation = useUpdateMyProfileMutation();
  const [step, setStep] = useState<VoiceStep>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showShortWarning, setShowShortWarning] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState("");
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [keywordOptions, setKeywordOptions] =
    useState<VoiceKeyword[]>(MOCK_KEYWORDS);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const playbackPlayerRef = useRef<AudioPlayer | null>(null);
  const playbackStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>(() =>
    idsFromLabels(
      draftSelectedKeywords,
      mergeKeywordOptions(MOCK_KEYWORDS, MORE_INTEREST_KEYWORDS),
    ),
  );
  const allKeywordOptions = useMemo(
    () => mergeKeywordOptions(keywordOptions, MORE_INTEREST_KEYWORDS),
    [keywordOptions],
  );

  const selectedKeywords = useMemo(
    () =>
      allKeywordOptions.filter((keyword) =>
        selectedKeywordIds.includes(keyword.id),
      ).map((keyword) => keyword.label),
    [allKeywordOptions, selectedKeywordIds],
  );
  const selectedInterestKeywords = useMemo(
    () =>
      labelsFromIds(selectedKeywordIds, allKeywordOptions, {
        category: "interest",
      }),
    [allKeywordOptions, selectedKeywordIds],
  );
  const selectedPersonalityKeywords = useMemo(
    () =>
      labelsFromIds(selectedKeywordIds, allKeywordOptions, {
        category: "personality",
      }),
    [allKeywordOptions, selectedKeywordIds],
  );
  const userName = useMemo(
    () => draftNickname.trim() || authNickname?.trim() || "사용자",
    [authNickname, draftNickname],
  );
  const displayKeywords = useMemo(
    () =>
      selectedKeywords.length > 0
        ? selectedKeywords
        : draftSelectedKeywords,
    [draftSelectedKeywords, selectedKeywords],
  );
  const profileAge = useMemo(
    () => draftAge ?? calculateAge(draftBirthDate) ?? 0,
    [draftAge, draftBirthDate],
  );

  useEffect(() => {
    if (!showShortWarning) return;

    const timeout = setTimeout(() => {
      setShowShortWarning(false);
    }, 1800);

    return () => clearTimeout(timeout);
  }, [showShortWarning]);

  useEffect(() => {
    if (step !== "recording") return;

    const nextSeconds = Math.floor(recorderState.durationMillis / 1000);
    setRecordingSeconds(nextSeconds);
  }, [recorderState.durationMillis, step]);

  useEffect(() => {
    return () => {
      if (playbackStopTimerRef.current) {
        clearTimeout(playbackStopTimerRef.current);
      }

      playbackPlayerRef.current?.pause();
      playbackPlayerRef.current?.remove();
      playbackPlayerRef.current = null;
    };
  }, []);

  const stopPlayback = () => {
    if (playbackStopTimerRef.current) {
      clearTimeout(playbackStopTimerRef.current);
      playbackStopTimerRef.current = null;
    }

    playbackPlayerRef.current?.pause();
    playbackPlayerRef.current?.remove();
    playbackPlayerRef.current = null;
    setIsPlayingRecorded(false);
  };

  const handleBack = async () => {
    if (step === "idle") {
      router.back();
      return;
    }

    await stopRecorderIfNeeded();
    stopPlayback();
    setStep("idle");
    setRecordingSeconds(0);
    setShowShortWarning(false);
    setRecordedAudioUri("");
  };

  const handleStartRecording = async () => {
    try {
      const hasPermission = await ensurePermission({
        getPermission: () => AudioModule.getRecordingPermissionsAsync(),
        requestPermission: () => AudioModule.requestRecordingPermissionsAsync(),
        title: "마이크 권한 필요",
        message: "설정에서 마이크 접근 권한을 허용해주세요.",
      });
      if (!hasPermission) return;

      stopPlayback();
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();

      setRecordedAudioUri("");
      setIntroAudioUrl("");
      setRecordingSeconds(0);
      setShowShortWarning(false);
      setStep("recording");
    } catch (error) {
      console.error("Voice Record Start Error:", error);
      Alert.alert("녹음 시작 실패", "녹음을 다시 시도해주세요.");
    }
  };

  const stopRecorderIfNeeded = async () => {
    if (!recorderState.isRecording && !recorder.isRecording) return;

    try {
      await recorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    } catch (error) {
      console.error("Voice Record Stop Error:", error);
    }
  };

  const handleCancelRecording = async () => {
    await stopRecorderIfNeeded();
    stopPlayback();
    setRecordingSeconds(0);
    setShowShortWarning(false);
    setRecordedAudioUri("");
    setStep("idle");
  };

  const handleFinishRecording = async () => {
    const currentRecordingSeconds = Math.max(
      recordingSeconds,
      Math.floor(recorderState.durationMillis / 1000),
    );

    if (currentRecordingSeconds < MIN_RECORDING_SECONDS) {
      setShowShortWarning(true);
      return;
    }

    try {
      await recorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      const nextUri = recorder.uri ?? recorder.getStatus().url;
      if (!nextUri) {
        throw new Error("Recorded audio uri is empty.");
      }

      setRecordedAudioUri(nextUri);
      setIntroAudioUrl("");
      setRecordingSeconds(currentRecordingSeconds);
      setShowShortWarning(false);
      setStep("reviewing");
    } catch (error) {
      console.error("Voice Record Finish Error:", error);
      Alert.alert("녹음 저장 실패", "녹음을 다시 시도해주세요.");
    }
  };

  const handleSubmitRecording = async () => {
    if (!recordedAudioUri || isUploadingAudio) return;

    stopPlayback();
    setIsUploadingAudio(true);
    setStep("analyzing");

    try {
      if (__DEV__) {
        console.log("[Voice Upload] start", { recordedAudioUri });
      }

      const uploadedAudioUrl = await uploadRecordedAudio(recordedAudioUri);
      setIntroAudioUrl(uploadedAudioUrl);

      try {
        if (__DEV__) {
          console.log("[Voice Analyze] start", { uploadedAudioUrl });
        }

        const analyzeResult = await withTimeout(
          voiceAnalyzeMutation.mutateAsync({
            audioUrl: uploadedAudioUrl,
            language: "ko-KR",
            analysisType: "profile",
            nickname: userName,
            gender: draftGender ?? DEFAULT_GENDER,
            birthDate: resolveBirthDate(draftBirthDate, draftAge),
            areaCode: draftAreaCode ?? DEFAULT_AREA_CODE,
          }),
          VOICE_ANALYZE_TIMEOUT_MS,
        );
        const matchedKeywords = getAnalyzeMatchedKeywords(analyzeResult);
        const nextKeywords = keywordsFromAnalyze(analyzeResult);
        const nextPersonalities = labelsFromIds(
          nextKeywords.map((keyword) => keyword.id),
          nextKeywords,
          { category: "personality" },
        );
        const nextSelectedIds = nextKeywords
          .filter((keyword) => keyword.id !== "more")
          .slice(0, 3)
          .map((keyword) => keyword.id);

        setKeywordOptions(nextKeywords);
        setSelectedKeywordIds(nextSelectedIds);
        setSelectedKeywords(
          labelsFromIds(
            nextSelectedIds,
            mergeKeywordOptions(nextKeywords, MORE_INTEREST_KEYWORDS),
          ),
        );
        setPersonalities(nextPersonalities);
        setVibeVector(getAnalyzeVibeVector(analyzeResult));
        if (__DEV__) {
          console.log("[Voice Analyze] success", {
            matchedKeywordCount: matchedKeywords.length,
            vibeVectorLength: getAnalyzeVibeVector(analyzeResult).length,
          });
        }
      } catch (error) {
        console.log(
          "Voice Analyze Error:",
          isAxiosError(error) ? error.response?.data : error,
        );
        resetRecordedAudio();
        Alert.alert("음성 분석 실패", getVoiceFlowErrorMessage(error));
        return;
      }
      setStep("keywords");
    } catch (error) {
      console.log(
        "Voice Upload Flow Error:",
        isAxiosError(error) ? error.response?.data : error,
      );
      setIntroAudioUrl("");
      resetRecordedAudio();
      Alert.alert("음성 업로드 실패", getVoiceFlowErrorMessage(error));
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const resetRecordedAudio = () => {
    setIntroAudioUrl("");
    setRecordedAudioUri("");
    setRecordingSeconds(0);
    setStep("idle");
  };

  const handleResetRecording = async () => {
    await stopRecorderIfNeeded();
    stopPlayback();
    setRecordingSeconds(0);
    setShowShortWarning(false);
    setRecordedAudioUri("");
    setKeywordOptions(MOCK_KEYWORDS);
    await handleStartRecording();
  };

  const handleTogglePlayback = async () => {
    if (!recordedAudioUri) return;

    try {
      if (isPlayingRecorded) {
        stopPlayback();
        return;
      }

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      await setIsAudioActiveAsync(true);

      stopPlayback();
      const nextPlayer = createAudioPlayer(
        { uri: recordedAudioUri },
        { updateInterval: 250, keepAudioSessionActive: true },
      );
      playbackPlayerRef.current = nextPlayer;
      await wait(180);
      try {
        await nextPlayer.seekTo(0);
      } catch {
        // Some platforms cannot seek until metadata is ready; play still works.
      }

      nextPlayer.play();
      setIsPlayingRecorded(true);
      playbackStopTimerRef.current = setTimeout(
        () => {
          if (playbackPlayerRef.current === nextPlayer) {
            stopPlayback();
          }
        },
        Math.max(recordingSeconds, 1) * 1000 + 500,
      );
    } catch (error) {
      console.error("Voice Playback Error:", error);
      stopPlayback();
      Alert.alert("재생 실패", "녹음 파일을 다시 재생하지 못했어요.");
    }
  };

  const handleToggleKeyword = (id: string) => {
    if (id === "more") return;

    setSelectedKeywordIds((current) => {
      const targetLabel = allKeywordOptions.find(
        (keyword) => keyword.id === id,
      )?.label;
      let nextIds: string[];

      if (current.includes(id)) {
        nextIds = current.filter((keywordId) => keywordId !== id);
      } else if (current.length >= 5) {
        nextIds = current;
      } else {
        const idsWithoutSameLabel = targetLabel
          ? current.filter(
              (keywordId) =>
                allKeywordOptions.find((keyword) => keyword.id === keywordId)
                  ?.label !== targetLabel,
            )
          : current;
        nextIds = [...idsWithoutSameLabel, id];
      }

      setSelectedKeywords(labelsFromIds(nextIds, allKeywordOptions));

      return nextIds;
    });
  };

  const handleKeywordNext = () => {
    setSelectedKeywords(selectedInterestKeywords);
    setPersonalities(selectedPersonalityKeywords);
    setStep("complete");
  };

  const handleStartApp = async () => {
    const keywords =
      selectedInterestKeywords.length > 0
        ? selectedInterestKeywords
        : draftSelectedKeywords;
    const personalities =
      selectedPersonalityKeywords.length > 0
        ? selectedPersonalityKeywords
        : draftPersonalities;
    const introKeywords = selectedKeywords.length > 0 ? selectedKeywords : keywords;
    const generatedIntro =
      introKeywords.length > 0
        ? `${userName}님은 ${introKeywords.join(", ")}에 관심이 있어요.`
        : `${userName}님의 이야기를 들려주세요.`;
    const safeIntroAudioUrl = introAudioUrl.trim();

    const resolveProfileImageUrl = async () => {
      if (
        !profileImageUri ||
        profileImageUri === "default" ||
        profileImageUri === DEFAULT_PROFILE_IMAGE_URI
      ) {
        return null;
      }

      try {
        let profileImageUrl = profileImageUri;

        if (isRemoteUrl(profileImageUri)) return null;

        profileImageUrl = await uploadProfileImage(profileImageUri);

        if (__DEV__) {
          console.log("[Profile Image Upload] success", { profileImageUrl });
        }

        return profileImageUrl;
      } catch (error) {
        console.log(
          "Profile Image Upload Error:",
          isAxiosError(error) ? error.response?.data : error,
        );

        return null;
      }
    };

    const profileImageUrl = await resolveProfileImageUrl();
    const profileUpdatePayload = {
      nickname: userName,
      ...(draftGender ? { gender: draftGender } : {}),
      ...(profileAge >= 50 && profileAge <= 120 ? { age: profileAge } : {}),
      ...(draftAreaCode ? { areaCode: draftAreaCode } : {}),
      introText: introText || generatedIntro,
      keywords,
      personalities,
      idealPersonalities: draftIdealPersonalities,
      ...(safeIntroAudioUrl ? { introAudioUrl: safeIntroAudioUrl } : {}),
      ...(profileImageUrl ? { profileImageUrl } : {}),
    };

    const runProfileUpdate = async () => {
      if (__DEV__) {
        console.log("[Profile Update] submit", profileUpdatePayload);
      }

      // 음성 분석 단계에서 POST /v1/onboarding/profile로 프로필 생성이 끝난다.
      // 마지막 단계에서는 사진/소개/키워드 등 나머지 필드를 PATCH로 보강한다.
      await updateMyProfileMutation.mutateAsync(profileUpdatePayload);
      const profile = await queryClient.fetchQuery({
        queryKey: queryKeys.users.me(),
        queryFn: getMyProfile,
      });
      setAuthUser({
        userId: profile.userId,
        nickname: profile.nickname,
      });
      completeOnboarding();
    };

    if (!safeIntroAudioUrl) {
      if (__DEV__) {
        console.log("[Profile Update] without intro audio", {
          hasIntroAudioUrl: !!safeIntroAudioUrl,
        });
      }

      try {
        await runProfileUpdate();
      } catch (error) {
        console.log(
          "Profile Update Error:",
          isAxiosError(error) ? error.response?.data : error,
        );
        Alert.alert("프로필 저장 실패", "프로필 정보를 다시 저장해주세요.");
        return;
      }

      setSelectedKeywords(keywords);
      router.replace("/(tabs)" as any);
      return;
    }

    try {
      await runProfileUpdate();
      setSelectedKeywords(keywords);
      router.replace("/(tabs)" as any);
    } catch (error) {
      console.error(
        "Profile Update Error:",
        isAxiosError(error) ? error.response?.data : error,
      );
      Alert.alert("프로필 저장 실패", "프로필 정보를 다시 저장해주세요.");
    }
  };

  if (step === "analyzing") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <VoiceHeader onBack={handleBack} />
        <AnalyzingView userName={userName} />
      </SafeAreaView>
    );
  }

  if (step === "keywords") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <VoiceHeader onBack={handleBack} />
        <KeywordSelectView
          userName={userName}
          keywords={keywordOptions}
          moreKeywords={MORE_INTEREST_KEYWORDS}
          selectedIds={selectedKeywordIds}
          selectedLabels={selectedKeywords}
          onToggleKeyword={handleToggleKeyword}
          onRerecord={handleStartRecording}
          onNext={handleKeywordNext}
        />
      </SafeAreaView>
    );
  }

  if (step === "complete") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <VoiceHeader onBack={handleBack} />
        <CompletePreviewView
          userName={userName}
          age={profileAge}
          locationName={draftAreaName ?? "거주지 미선택"}
          profileImageUri={profileImageUri}
          selectedKeywords={displayKeywords}
          isSubmitting={updateMyProfileMutation.isPending}
          onStart={handleStartApp}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <VoiceHeader onBack={handleBack} />
      <View style={styles.content}>
        <VoiceTitle>
          {step === "recording" || step === "reviewing"
            ? `${userName}님의 이야기를 듣고있어요..`
            : `반갑습니다! ${userName}님\n${userName}님의 이야기를 들려주세요.`}
        </VoiceTitle>
        <VoiceExamples compact={step === "recording" || step === "reviewing"} />
      </View>

      {step === "recording" ? (
        <RecordingControls
          seconds={recordingSeconds}
          showShortWarning={showShortWarning}
          onCancel={handleCancelRecording}
          onFinish={handleFinishRecording}
          onReset={handleResetRecording}
        />
      ) : step === "reviewing" ? (
        <PlaybackControls
          seconds={recordingSeconds}
          isPlaying={isPlayingRecorded}
          isSubmitting={isUploadingAudio}
          onCancel={handleCancelRecording}
          onTogglePlay={handleTogglePlayback}
          onSubmit={handleSubmitRecording}
          onReset={handleResetRecording}
        />
      ) : (
        <IdleRecorder onStart={handleStartRecording} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
});

function calculateAge(birthDate?: string | null) {
  if (!birthDate) return null;

  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const monthDiff = now.getMonth() - parsed.getMonth();
  const dayDiff = now.getDate() - parsed.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age > 0 ? age : null;
}

function labelsFromIds(
  ids: string[],
  keywords = MOCK_KEYWORDS,
  options?: { category?: VoiceKeyword["category"] },
) {
  const labels = keywords.filter((keyword) => {
    if (keyword.id === "more" || !ids.includes(keyword.id)) return false;
    if (!options?.category) return true;

    return keyword.category === options.category;
  }).map((keyword) => keyword.label);

  return Array.from(new Set(labels));
}

function idsFromLabels(labels: string[], keywords = MOCK_KEYWORDS) {
  const ids = keywords.filter(
    (keyword) => keyword.id !== "more" && labels.includes(keyword.label),
  ).map((keyword) => keyword.id);

  return ids.length > 0 ? ids : ["culture", "music", "hiking"];
}

async function uploadRecordedAudio(uri: string) {
  const contentType = resolveAudioContentType(uri);
  const fileName = `profile-voice-${Date.now()}.${contentTypeToExtension(contentType)}`;
  const { uploadUrl, fileRef } = await postPresign({
    fileName,
    contentType,
    purpose: INTRO_AUDIO_PURPOSE,
  });

  if (__DEV__) {
    console.log("[Voice Upload] presign success", {
      fileName,
      contentType,
      uploadHost: getUrlHost(uploadUrl),
      uploadUrlPreview: getUrlPreview(uploadUrl),
    });
  }

  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();

  if (__DEV__) {
    console.log("[Voice Upload] local file loaded", {
      blobSize: blob.size,
      blobType: blob.type,
    });
  }

  await uploadBlobToPresignedUrl(uploadUrl, blob, contentType, "Voice Upload");

  if (__DEV__) {
    console.log("[Voice Upload] s3 success", {
      fileRef,
    });
  }

  return fileRef;
}

async function uploadProfileImage(uri: string) {
  const contentType = resolveImageContentType(uri);
  const fileName = `profile-image-${Date.now()}.${contentTypeToImageExtension(contentType)}`;
  const { uploadUrl, fileRef } = await postPresign({
    fileName,
    contentType,
    purpose: PROFILE_IMAGE_PURPOSE,
  });
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();
  await uploadBlobToPresignedUrl(
    uploadUrl,
    blob,
    contentType,
    "Profile Image Upload",
  );

  return fileRef;
}

function resolveImageContentType(uri: string) {
  const lowerUri = uri.toLowerCase();

  if (lowerUri.startsWith("data:image/png") || lowerUri.endsWith(".png")) {
    return "image/png";
  }

  if (lowerUri.startsWith("data:image/webp") || lowerUri.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

function contentTypeToImageExtension(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";

  return "jpg";
}

function resolveAudioContentType(uri: string) {
  if (uri.toLowerCase().endsWith(".webm")) {
    return "audio/webm";
  }

  return "audio/mp4";
}

function contentTypeToExtension(contentType: string) {
  if (contentType === "audio/webm") {
    return "webm";
  }

  return "m4a";
}

function isRemoteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function uploadBlobToPresignedUrl(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
  logLabel: string,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${logLabel} failed: ${xhr.status} ${xhr.responseText?.slice(0, 160) ?? ""}`,
        ),
      );
    };
    xhr.onerror = () => {
      reject(
        new Error(`${logLabel} network failed: ${getUrlPreview(uploadUrl)}`),
      );
    };
    xhr.send(blob);
  });
}

function getUrlHost(url: string) {
  if (!url) {
    return "empty";
  }

  const match = /^https?:\/\/([^/?#]+)/i.exec(url);

  return match?.[1] ?? "unknown";
}

function getUrlPreview(url: string) {
  if (!url) {
    return "empty";
  }

  const match = /^(https?:\/\/[^/?#]+\/[^?]*)/i.exec(url);
  const baseUrl = match?.[1] ?? url.slice(0, 80);

  return baseUrl.length > 120 ? `${baseUrl.slice(0, 120)}...` : baseUrl;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function keywordsFromAnalyze(result: IAnalyzeResponse) {
  const matchedKeywords = getAnalyzeMatchedKeywords(result);
  const matchedOptions = keywordOptionsFromMatchedKeywords(matchedKeywords);
  const uniqueMatchedOptions = dedupeVoiceKeywords(matchedOptions).slice(0, 10);

  if (uniqueMatchedOptions.length > 0) {
    return [
      ...uniqueMatchedOptions,
      { id: "more", label: "...더보기" },
    ];
  }

  const keywordCandidates = getAnalyzeKeywordCandidates(result);
  const candidates = dedupeVoiceKeywords([
    ...keywordCandidates.interests.map((candidate, index) => ({
      id: `candidate-interest-${index}-${candidate.text}`,
      label: candidate.text?.trim() ?? "",
      category: "interest" as const,
      score: candidate.score,
    })),
    ...keywordCandidates.personalities.map((candidate, index) => ({
      id: `candidate-personality-${index}-${candidate.text}`,
      label: candidate.text?.trim() ?? "",
      category: "personality" as const,
      score: candidate.score,
    })),
  ])
    .sort((a, b) => ((b as VoiceKeyword & { score?: number }).score ?? 0) - ((a as VoiceKeyword & { score?: number }).score ?? 0))
    .slice(0, 10);

  if (candidates.length === 0) {
    throw new Error("음성 분석 결과에 추천 키워드가 없습니다.");
  }

  return [
    ...candidates.map(({ id, label, category }) => ({ id, label, category })),
    { id: "more", label: "...더보기" },
  ];
}

function getAnalyzeMatchedKeywords(result: IAnalyzeResponse) {
  return Array.isArray(result.matchedKeywords) ? result.matchedKeywords : [];
}

function keywordOptionsFromMatchedKeywords(
  matchedKeywords: {
    category?: string | null;
    keyword?: string | null;
    score?: number | null;
  }[],
) {
  return [...matchedKeywords]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .reduce<VoiceKeyword[]>((options, keyword, index) => {
      const label = keyword.keyword?.trim() ?? "";

      if (!label) return options;

      options.push({
        id: `analyzed-${index}-${label}`,
        label,
        category: resolveVoiceKeywordCategory(keyword),
      });

      return options;
    }, []);
}

function dedupeVoiceKeywords<T extends VoiceKeyword>(keywords: T[]) {
  const keywordMap = new Map<string, T>();

  keywords.forEach((keyword) => {
    if (!keyword.label || keywordMap.has(keyword.label)) return;
    keywordMap.set(keyword.label, keyword);
  });

  return Array.from(keywordMap.values());
}

function resolveVoiceKeywordCategory(
  keyword: { category?: string | null },
): VoiceKeyword["category"] {
  if (isPersonalityCategory(keyword)) return "personality";

  return "interest";
}

function isPersonalityCategory(keyword: { category?: string | null }) {
  const category = normalizeKeywordCategory(keyword.category);

  return (
    category === "PERSONALITY" ||
    category === "PERSONALITIES" ||
    category === "성향" ||
    category === "퍼스널리티" ||
    category === "퍼스날리티"
  );
}

function normalizeKeywordCategory(category?: string | null) {
  return category?.trim().toUpperCase() ?? "";
}

function getAnalyzeKeywordCandidates(result: IAnalyzeResponse) {
  return {
    interests: Array.isArray(result.keywordCandidates?.interests)
      ? result.keywordCandidates.interests
      : [],
    personalities: Array.isArray(result.keywordCandidates?.personalities)
      ? result.keywordCandidates.personalities
      : [],
  };
}

function getAnalyzeVibeVector(result: IAnalyzeResponse) {
  return Array.isArray(result.vibeVector) ? result.vibeVector : [];
}

function getVoiceFlowErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return error.response?.data?.error?.message ?? error.message;
  }

  if (error instanceof Error) return error.message;

  return "잠시 후 다시 시도해주세요.";
}

function mergeKeywordOptions(
  primaryOptions: VoiceKeyword[],
  extraOptions: VoiceKeyword[],
) {
  const optionMap = new Map<string, VoiceKeyword>();

  [...primaryOptions, ...extraOptions].forEach((option) => {
    if (!optionMap.has(option.id)) {
      optionMap.set(option.id, option);
    }
  });

  return Array.from(optionMap.values());
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Voice analyze timeout")), ms);
    }),
  ]);
}
