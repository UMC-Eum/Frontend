import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { isAxiosError } from "axios";
import type { AudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { postPresign } from "@/api/onboarding/onboardingApi";
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
import {
  usePostProfileMutation,
  usePostVoiceAnalyzeMutation,
} from "@/hooks/api/useOnboarding";
import { useUpdateMyProfileMutation } from "@/hooks/api/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";
import type {
  IAnalyzeResponse,
  IProfileRequest,
} from "@/types/api/onboarding/onboardingDTO";

type VoiceStep =
  | "idle"
  | "recording"
  | "reviewing"
  | "analyzing"
  | "keywords"
  | "complete";

const MIN_RECORDING_SECONDS = 10;
const DEFAULT_LOCATION_NAME = "서울 광진구";
const DEFAULT_AREA_CODE = "1121500000";
const DEFAULT_BIRTH_DATE = "1973-01-01";
const DEFAULT_GENDER = "M";
const INTRO_AUDIO_PURPOSE = "PROFILE_INTRO_AUDIO";
const VOICE_ANALYZE_TIMEOUT_MS = 5000;

const MOCK_KEYWORDS: VoiceKeyword[] = [
  { id: "culture", label: "문화생활" },
  { id: "music", label: "음악감상" },
  { id: "hiking", label: "등산" },
  { id: "walk", label: "산책" },
  { id: "cooking", label: "요리" },
  { id: "knitting", label: "뜨개질" },
  { id: "game", label: "게임" },
  { id: "drawing", label: "그림" },
  { id: "health", label: "헬스" },
  { id: "movie", label: "영화" },
  { id: "more", label: "...더보기" },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const authNickname = useAuthStore((state) => state.user?.nickname);
  const authUserId = useAuthStore((state) => state.user?.userId);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const draftNickname = useOnboardingDraftStore((state) => state.nickname);
  const draftAge = useOnboardingDraftStore((state) => state.age);
  const draftGender = useOnboardingDraftStore((state) => state.gender);
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
  const vibeVector = useOnboardingDraftStore((state) => state.vibeVector);
  const setSelectedKeywords = useOnboardingDraftStore(
    (state) => state.setSelectedKeywords,
  );
  const setVibeVector = useOnboardingDraftStore((state) => state.setVibeVector);
  const postProfileMutation = usePostProfileMutation();
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
    idsFromLabels(draftSelectedKeywords),
  );

  const selectedKeywords = useMemo(
    () =>
      keywordOptions.filter((keyword) =>
        selectedKeywordIds.includes(keyword.id),
      ).map((keyword) => keyword.label),
    [keywordOptions, selectedKeywordIds],
  );
  const userName = useMemo(
    () => draftNickname.trim() || authNickname?.trim() || "사용자",
    [authNickname, draftNickname],
  );
  const displayKeywords = useMemo(
    () =>
      draftSelectedKeywords.length > 0
        ? draftSelectedKeywords
        : selectedKeywords,
    [draftSelectedKeywords, selectedKeywords],
  );
  const profileAge = useMemo(
    () => draftAge ?? calculateAge(draftBirthDate) ?? 53,
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

  const resetKeywordRecommendations = () => {
    setKeywordOptions(MOCK_KEYWORDS);
    const fallbackSelectedIds = MOCK_KEYWORDS.filter(
      (keyword) => keyword.id !== "more",
    )
      .slice(0, 3)
      .map((keyword) => keyword.id);

    setSelectedKeywordIds(fallbackSelectedIds);
    setSelectedKeywords(labelsFromIds(fallbackSelectedIds, MOCK_KEYWORDS));
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
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert("마이크 권한 필요", "목소리를 녹음하려면 마이크 권한이 필요해요.");
        return;
      }

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
      const uploadedAudioUrl = await uploadRecordedAudio(recordedAudioUri);
      setIntroAudioUrl(uploadedAudioUrl);

      if (authUserId) {
        const analyzeResult = await withTimeout(
          voiceAnalyzeMutation.mutateAsync({
            userId: authUserId,
            audioUrl: uploadedAudioUrl,
            language: "ko-KR",
            analysisType: "profile",
          }),
          VOICE_ANALYZE_TIMEOUT_MS,
        );
        const nextKeywords = keywordsFromAnalyze(analyzeResult);
        const nextSelectedIds = nextKeywords
          .filter((keyword) => keyword.id !== "more")
          .slice(0, 3)
          .map((keyword) => keyword.id);

        setKeywordOptions(nextKeywords);
        setSelectedKeywordIds(nextSelectedIds);
        setSelectedKeywords(labelsFromIds(nextSelectedIds, nextKeywords));
        setVibeVector(analyzeResult.vibeVector);
      } else {
        resetKeywordRecommendations();
      }
    } catch {
      setIntroAudioUrl("");
      resetKeywordRecommendations();
    } finally {
      setIsUploadingAudio(false);
      setStep("keywords");
    }
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
      let nextIds: string[];

      if (current.includes(id)) {
        nextIds = current.filter((keywordId) => keywordId !== id);
      } else if (current.length >= 5) {
        nextIds = current;
      } else {
        nextIds = [...current, id];
      }

      setSelectedKeywords(labelsFromIds(nextIds, keywordOptions));

      return nextIds;
    });
  };

  const handleKeywordNext = () => {
    setSelectedKeywords(selectedKeywords);
    setStep("complete");
  };

  const handleStartApp = async () => {
    const birthDate =
      draftBirthDate ?? buildBirthDateFromAge(draftAge) ?? DEFAULT_BIRTH_DATE;
    const keywords =
      displayKeywords.length > 0
        ? displayKeywords
        : MOCK_KEYWORDS.slice(0, 3).map((keyword) => keyword.label);
    const generatedIntro =
      keywords.length > 0
        ? `${userName}님은 ${keywords.join(", ")}에 관심이 있어요.`
        : `${userName}님의 이야기를 들려주세요.`;
    const safeIntroAudioUrl = isRemoteUrl(introAudioUrl) ? introAudioUrl : "";

    const runTestFallbackProfileUpdate = async () => {
      const fallbackPayload = {
        nickname: userName,
        gender: draftGender ?? DEFAULT_GENDER,
        ...(profileAge >= 50 && profileAge <= 150 ? { age: profileAge } : {}),
        areaCode: DEFAULT_AREA_CODE,
        introText: introText || generatedIntro,
        keywords,
      };

      if (__DEV__) {
        console.log("[Profile Create] test fallback", fallbackPayload);
      }

      await updateMyProfileMutation.mutateAsync(fallbackPayload);
      completeOnboarding();
    };

    if (!safeIntroAudioUrl || vibeVector.length === 0) {
      if (__DEV__) {
        console.log("[Profile Create] skip onboarding profile", {
          hasIntroAudioUrl: !!safeIntroAudioUrl,
          vibeVectorLength: vibeVector.length,
        });
      }

      try {
        await runTestFallbackProfileUpdate();
      } catch (fallbackError) {
        console.log(
          "Profile Fallback Update Error:",
          isAxiosError(fallbackError)
            ? fallbackError.response?.data
            : fallbackError,
        );
      }

      setSelectedKeywords(keywords);
      router.replace("/home" as any);
      return;
    }

    const profilePayload: IProfileRequest = {
      nickname: userName,
      gender: draftGender ?? DEFAULT_GENDER,
      birthDate,
      areaCode: DEFAULT_AREA_CODE,
      introText: introText || generatedIntro,
      introAudioUrl: safeIntroAudioUrl,
      selectedKeywords: keywords,
      vibeVector,
    };

    try {
      if (__DEV__) {
        console.log("[Profile Create] submit", profilePayload);
      }

      const profileResponse =
        await postProfileMutation.mutateAsync(profilePayload);

      if (__DEV__) {
        console.log("[Profile Create] success", profileResponse);
      }

      completeOnboarding();
      setSelectedKeywords(keywords);
      router.replace("/home" as any);
    } catch (error) {
      if (isProfileNotRegisteredError(error)) {
        try {
          console.log(
            "Profile Create Fallback:",
            isAxiosError(error) ? error.response?.data : error,
          );
          await runTestFallbackProfileUpdate();
        } catch (fallbackError) {
          console.log(
            "Profile Fallback Update Error:",
            isAxiosError(fallbackError)
              ? fallbackError.response?.data
              : fallbackError,
          );
        }
      } else {
        console.error(
          "Profile Create Error:",
          isAxiosError(error) ? error.response?.data : error,
        );
      }

      setSelectedKeywords(keywords);
      router.replace("/home" as any);
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
          selectedIds={selectedKeywordIds}
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
          locationName={DEFAULT_LOCATION_NAME}
          profileImageUri={profileImageUri}
          selectedKeywords={displayKeywords}
          isSubmitting={postProfileMutation.isPending}
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

function buildBirthDateFromAge(age?: number | null) {
  if (!age || age <= 0) return null;

  return `${new Date().getFullYear() - age}-01-01`;
}

function labelsFromIds(ids: string[], keywords = MOCK_KEYWORDS) {
  return keywords.filter(
    (keyword) => keyword.id !== "more" && ids.includes(keyword.id),
  ).map((keyword) => keyword.label);
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
  const { uploadUrl, fileUrl } = await postPresign({
    fileName,
    contentType,
    purpose: INTRO_AUDIO_PURPOSE,
  });
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`S3 upload failed: ${uploadResponse.status}`);
  }

  return fileUrl;
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

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function keywordsFromAnalyze(result: IAnalyzeResponse) {
  const candidates = [
    ...result.keywordCandidates.interests,
    ...result.keywordCandidates.personalities,
  ]
    .sort((a, b) => b.score - a.score)
    .map((candidate) => candidate.text.trim())
    .filter(Boolean);
  const uniqueLabels = Array.from(new Set(candidates)).slice(0, 10);

  if (uniqueLabels.length === 0) {
    return MOCK_KEYWORDS;
  }

  return [
    ...uniqueLabels.map((label, index) => ({
      id: `analyzed-${index}-${label}`,
      label,
    })),
    { id: "more", label: "...더보기" },
  ];
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Voice analyze timeout")), ms);
    }),
  ]);
}

function isProfileNotRegisteredError(error: unknown) {
  if (!isAxiosError(error)) return false;

  const data = error.response?.data;
  if (!data || typeof data !== "object") return false;

  const errorBody = "error" in data ? data.error : null;
  if (!errorBody || typeof errorBody !== "object") return false;

  return "code" in errorBody && errorBody.code === "PROF-001";
}
