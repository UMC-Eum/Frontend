import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { usePostProfileMutation } from "@/hooks/api/useOnboarding";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

type VoiceStep =
  | "idle"
  | "recording"
  | "reviewing"
  | "analyzing"
  | "keywords"
  | "complete";

const MIN_RECORDING_SECONDS = 10;
const DEFAULT_LOCATION_NAME = "서울 광진구";
const DEFAULT_AREA_CODE = "11215";
const DEFAULT_BIRTH_DATE = "1973-01-01";
const DEFAULT_GENDER = "M";
const INTRO_AUDIO_PURPOSE = "VOICE_PROFILE";

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
  const postProfileMutation = usePostProfileMutation();
  const [step, setStep] = useState<VoiceStep>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showShortWarning, setShowShortWarning] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState("");
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const player = useAudioPlayer(
    recordedAudioUri ? { uri: recordedAudioUri } : null,
    { updateInterval: 250 },
  );
  const playerStatus = useAudioPlayerStatus(player);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>(() =>
    idsFromLabels(draftSelectedKeywords),
  );

  const selectedKeywords = useMemo(
    () =>
      MOCK_KEYWORDS.filter((keyword) =>
        selectedKeywordIds.includes(keyword.id),
      ).map((keyword) => keyword.label),
    [selectedKeywordIds],
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
    if (step !== "analyzing") return;

    const timeout = setTimeout(() => {
      setStep("keywords");
    }, 1400);

    return () => clearTimeout(timeout);
  }, [step]);

  useEffect(() => {
    if (step !== "recording") return;

    const nextSeconds = Math.floor(recorderState.durationMillis / 1000);
    setRecordingSeconds(nextSeconds);
  }, [recorderState.durationMillis, step]);

  const handleBack = async () => {
    if (step === "idle") {
      router.back();
      return;
    }

    await stopRecorderIfNeeded();
    player.pause();
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

      player.pause();
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
    player.pause();
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

    player.pause();
    setIsUploadingAudio(true);

    try {
      const uploadedAudioUrl = await uploadRecordedAudio(recordedAudioUri);
      setIntroAudioUrl(uploadedAudioUrl);
    } catch {
      setIntroAudioUrl("");
    } finally {
      setIsUploadingAudio(false);
      setStep("analyzing");
    }
  };

  const handleResetRecording = async () => {
    await stopRecorderIfNeeded();
    player.pause();
    setRecordingSeconds(0);
    setShowShortWarning(false);
    setRecordedAudioUri("");
    await handleStartRecording();
  };

  const handleTogglePlayback = async () => {
    if (!recordedAudioUri) return;

    try {
      if (playerStatus.playing) {
        player.pause();
        return;
      }

      const hasDuration = playerStatus.duration > 0;
      const isAtEnd =
        hasDuration && playerStatus.currentTime >= playerStatus.duration - 0.05;

      if (playerStatus.didJustFinish || isAtEnd) {
        await player.seekTo(0);
      }

      player.play();
    } catch (error) {
      console.error("Voice Playback Error:", error);
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

      setSelectedKeywords(labelsFromIds(nextIds));

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

    try {
      await postProfileMutation.mutateAsync({
        nickname: userName,
        gender: draftGender ?? DEFAULT_GENDER,
        birthDate,
        areaCode: DEFAULT_AREA_CODE,
        introText: introText || generatedIntro,
        introAudioUrl: safeIntroAudioUrl,
        selectedKeywords: keywords,
        vibeVector,
      });

      setSelectedKeywords(keywords);
      router.replace("/(tabs)" as any);
    } catch (error) {
      console.error("Profile Create Error:", error);
      setSelectedKeywords(keywords);
      router.replace("/(tabs)" as any);
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
          keywords={MOCK_KEYWORDS}
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
          isPlaying={playerStatus.playing}
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

function labelsFromIds(ids: string[]) {
  return MOCK_KEYWORDS.filter(
    (keyword) => keyword.id !== "more" && ids.includes(keyword.id),
  ).map((keyword) => keyword.label);
}

function idsFromLabels(labels: string[]) {
  const ids = MOCK_KEYWORDS.filter(
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
