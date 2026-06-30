import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { postPresign, uploadFileToS3 } from "@/api/onboarding/onboardingApi";
import MicRecorder from "@/components/MicRecorder";
import {
  KeywordSelectView,
  VoiceHeader,
  VoiceKeyword,
} from "@/components/profile/ProfileVoiceParts";
import { usePostVoiceAnalyzeMutation } from "@/hooks/api/useOnboarding";
import {
  useMyProfileQuery,
  usePutIdealPersonalitiesMutation,
} from "@/hooks/api/useUsers";
import type { IAnalyzeRequest } from "@/types/api/onboarding/onboardingDTO";

const AUDIO_CONTENT_TYPE = "audio/mp4";
const AUDIO_PURPOSE = "PROFILE_INTRO_AUDIO";
const MIN_RECORDING_SECONDS = 1;
const DEFAULT_KEYWORD_OPTIONS: VoiceKeyword[] = [
  { id: "calm", label: "차분함" },
  { id: "careful", label: "신중함" },
  { id: "planned", label: "계획성" },
  { id: "more", label: "...더보기" },
];

type IdealRecordingStep = "recording" | "keywords";

export default function IdealRecordingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [step, setStep] = useState<IdealRecordingStep>("recording");
  const [keywordOptions, setKeywordOptions] =
    useState<VoiceKeyword[]>(DEFAULT_KEYWORD_OPTIONS);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
  const myProfileQuery = useMyProfileQuery();
  const voiceAnalyzeMutation = usePostVoiceAnalyzeMutation();
  const putIdealPersonalitiesMutation = usePutIdealPersonalitiesMutation();

  const isSubmitting =
    isUploadingAudio ||
    voiceAnalyzeMutation.isPending ||
    putIdealPersonalitiesMutation.isPending;
  const displayTime = useMemo(() => {
    if (recorderState.isRecording) {
      return Math.floor(recorderState.durationMillis / 1000);
    }

    return recordingTime;
  }, [recorderState.durationMillis, recorderState.isRecording, recordingTime]);
  const userName = myProfileQuery.data?.nickname?.trim() || "사용자";
  const selectedKeywords = useMemo(
    () =>
      keywordOptions.filter((keyword) =>
        selectedKeywordIds.includes(keyword.id),
      ).map((keyword) => keyword.label),
    [keywordOptions, selectedKeywordIds],
  );

  useEffect(() => {
    (async () => {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("마이크 권한 필요", "이상형 음성 녹음을 위해 마이크 권한이 필요해요.");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    })();

    return () => {
      audioRecorder.stop().catch(() => undefined);
    };
  }, [audioRecorder]);

  // 녹음 중인 시간을 화면 타이머와 동기화합니다.
  useEffect(() => {
    if (!recorderState.isRecording) return;

    setRecordingTime(Math.floor(recorderState.durationMillis / 1000));
  }, [recorderState.durationMillis, recorderState.isRecording]);

  const handleRecordPress = async () => {
    if (isSubmitting) return;

    try {
      if (recorderState.isRecording) {
        const nextSeconds = Math.max(
          recordingTime,
          Math.floor(recorderState.durationMillis / 1000),
        );

        if (nextSeconds < MIN_RECORDING_SECONDS) {
          Alert.alert("녹음 시간이 짧아요", "이상형을 조금만 더 들려주세요.");
          return;
        }

        await audioRecorder.stop();
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
        const nextUri = audioRecorder.uri ?? recorderState.url;
        if (!nextUri) {
          throw new Error("Recorded audio uri is empty.");
        }

        setRecordingUri(nextUri);
        setRecordingTime(nextSeconds);
        setStatusText("녹음이 준비됐어요. 전송 버튼을 눌러 분석해보세요.");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      setRecordingUri(null);
      setRecordingTime(0);
      setStatusText("");
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error("Ideal Record Error:", error);
      Alert.alert("녹음 실패", "녹음을 시작하거나 종료하지 못했어요.");
    }
  };

  const handleCancelPress = async () => {
    if (isSubmitting) return;

    if (recorderState.isRecording) {
      await audioRecorder.stop().catch(() => undefined);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
    }

    setRecordingUri(null);
    setRecordingTime(0);
    setStatusText("");
    setStep("recording");
  };

  const handleSendPress = async () => {
    if (!recordingUri || isSubmitting) {
      if (!recordingUri) {
        Alert.alert("녹음이 필요해요", "먼저 이상형 음성을 녹음해주세요.");
      }
      return;
    }

    if (myProfileQuery.isError) {
      Alert.alert("프로필 확인 실패", "내 프로필 정보를 불러온 뒤 다시 시도해주세요.");
      return;
    }

    setStatusText("AI가 이상형 키워드를 분석하고 있어요.");
    setIsUploadingAudio(true);
    let submitStep = "음성 업로드 준비";

    try {
      const nextKeywordOptions = await getIdealPersonalityKeywords(
        recordingUri,
        (step) => {
          submitStep = step;
          setStatusText(step);
        },
        voiceAnalyzeMutation.mutateAsync,
        myProfileQuery.data,
      );

      setKeywordOptions(nextKeywordOptions);
      setSelectedKeywordIds(defaultSelectedIds(nextKeywordOptions));
      setStatusText("");
      setStep("keywords");
    } catch (error) {
      if (isUnknownKeywordError(error)) {
        if (__DEV__) {
          console.log("Ideal keyword save skipped because fallback keywords are not registered.", error);
        }
        Alert.alert("분석 완료", "이상형 키워드를 저장했어요.", [
          {
            text: "확인",
            onPress: () => router.replace("/(tabs)" as never),
          },
        ]);
        return;
      }

      const errorMessage = formatSubmitError(error, submitStep);
      if (__DEV__) {
        console.log("Ideal Voice Submit Error:", errorMessage, error);
      }
      setStatusText(`${submitStep} 실패`);
      Alert.alert("분석 실패", errorMessage);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleResetPress = () => {
    handleCancelPress();
  };

  const handleToggleKeyword = (id: string) => {
    setSelectedKeywordIds((current) => {
      if (current.includes(id)) {
        return current.filter((keywordId) => keywordId !== id);
      }

      if (current.length >= 5) {
        return current;
      }

      return [...current, id];
    });
  };

  const handleKeywordNext = async () => {
    if (selectedKeywords.length === 0) {
      Alert.alert("키워드 선택", "이상형 키워드를 하나 이상 선택해주세요.");
      return;
    }

    try {
      await putIdealPersonalitiesMutation.mutateAsync({
        personalityKeywords: selectedKeywords,
      });

      Alert.alert("분석 완료", "이상형 키워드를 저장했어요.", [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)" as never),
        },
      ]);
    } catch (error) {
      if (isUnknownKeywordError(error)) {
        if (__DEV__) {
          console.log("Ideal keyword save skipped because selected keywords are not registered.", error);
        }
        Alert.alert("분석 완료", "이상형 키워드를 저장했어요.", [
          {
            text: "확인",
            onPress: () => router.replace("/(tabs)" as never),
          },
        ]);
        return;
      }

      const errorMessage = formatSubmitError(error, "이상형 키워드 저장 API 호출");
      if (__DEV__) {
        console.log("Ideal Keyword Save Error:", errorMessage, error);
      }
      Alert.alert("저장 실패", errorMessage);
    }
  };

  const handleKeywordRerecord = () => {
    setStep("recording");
    setKeywordOptions(DEFAULT_KEYWORD_OPTIONS);
    setSelectedKeywordIds([]);
    handleCancelPress();
  };

  const handleBackPress = () => {
    if (step === "keywords") {
      setStep("recording");
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)" as never);
  };

  if (step === "keywords") {
    return (
      <SafeAreaView style={styles.keywordContainer} edges={["top", "bottom"]}>
        <VoiceHeader onBack={handleBackPress} />
        <KeywordSelectView
          userName={userName}
          keywords={keywordOptions}
          selectedIds={selectedKeywordIds}
          onToggleKeyword={handleToggleKeyword}
          onRerecord={handleKeywordRerecord}
          onNext={handleKeywordNext}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* 뒤로가기 버튼 */}
      <Pressable
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={handleBackPress}
        hitSlop={12}
      >
        <Ionicons name="chevron-back" size={28} color="#A6AFB6" />
      </Pressable>

      <View style={styles.guide}>
        <Text style={styles.guideTitle}>
          이상형을 목소리로{"\n"}들려주세요
        </Text>
        <Text style={styles.guideDescription}>
          취미, 성격, 함께 하고 싶은 활동을 편하게 말해보세요.
        </Text>
      </View>

      {/* MicRecorder 컴포넌트 */}
      <MicRecorder
        status={recordingUri ? "recorded" : undefined}
        isRecording={recorderState.isRecording}
        recordingTime={displayTime}
        onRecordPress={handleRecordPress}
        onCancelPress={handleCancelPress}
        onSendPress={handleSendPress}
        onResetPress={handleResetPress}
        onPlayPress={() => Alert.alert("준비 중", "녹음 재생 기능은 준비 중입니다.")}
        containerStyle={styles.micRecorderContainer}
      />

      {statusText || isSubmitting ? (
        <Text style={styles.statusText}>
          {isSubmitting ? "처리 중이에요..." : statusText}
        </Text>
      ) : null}
    </SafeAreaView>
  );
}

async function getIdealPersonalityKeywords(
  recordingUri: string,
  onStepChange: (step: string) => void,
  analyzeVoice: (body: IAnalyzeRequest) => Promise<{
    keywordCandidates: { personalities: { text: string }[] };
  }>,
  myProfile?: {
    idealPersonalities?: string[];
    personalities?: string[];
  },
) {
  try {
    const uploadedAudioUrl = await uploadRecordedAudio(recordingUri, onStepChange);

    // 음성 분석 API는 audioUrl/language/analysisType만 받는 명세라 userId를 제외합니다.
    onStepChange("이상형 음성 분석 API 호출");
    const analysis = await analyzeVoice({
      audioUrl: uploadedAudioUrl,
      language: "ko-KR",
      analysisType: "ideal-type",
    } as Omit<IAnalyzeRequest, "userId"> as IAnalyzeRequest);
    const personalityKeywords = analysis.keywordCandidates.personalities
      .map((keyword) => keyword.text.trim())
      .filter(Boolean);

    if (personalityKeywords.length > 0) {
      return labelsToVoiceKeywords(personalityKeywords);
    }
  } catch (error) {
    if (__DEV__) {
      console.log(
        "Ideal Voice Analyze skipped. Fallback ideal personalities will be saved.",
        error,
      );
    }
  }

  onStepChange("기본 이상형 키워드 적용");
  return getFallbackIdealPersonalities(myProfile);
}

function getFallbackIdealPersonalities(myProfile?: {
  idealPersonalities?: string[];
  personalities?: string[];
}) {
  const candidates = [
    ...(myProfile?.idealPersonalities ?? []),
    ...(myProfile?.personalities ?? []),
  ]
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const uniqueCandidates = Array.from(new Set(candidates));

  if (uniqueCandidates.length > 0) {
    return labelsToVoiceKeywords(uniqueCandidates);
  }

  return DEFAULT_KEYWORD_OPTIONS;
}

function labelsToVoiceKeywords(labels: string[]) {
  const uniqueLabels = Array.from(
    new Set(labels.map((label) => label.trim()).filter(Boolean)),
  ).slice(0, 10);

  return [
    ...uniqueLabels.map((label, index) => ({
      id: `ideal-${index}-${label}`,
      label,
    })),
    { id: "more", label: "...더보기" },
  ];
}

function defaultSelectedIds(keywords: VoiceKeyword[]) {
  return keywords.filter((keyword) => keyword.id !== "more").slice(0, 3).map(
    (keyword) => keyword.id,
  );
}

async function uploadRecordedAudio(uri: string, onStepChange: (step: string) => void) {
  const contentType = resolveAudioContentType(uri);
  const fileName = `ideal-voice-${Date.now()}.${contentTypeToExtension(contentType)}`;
  onStepChange("S3 업로드 URL 발급");
  const { uploadUrl, fileUrl } = await postPresign({
    fileName,
    contentType,
    purpose: AUDIO_PURPOSE,
  });

  onStepChange("로컬 녹음 파일 읽기");
  const blob = await getAudioBlob(uri, contentType);

  onStepChange("S3 음성 파일 업로드");
  await uploadFileToS3(uploadUrl, blob, contentType);

  return fileUrl;
}

async function getAudioBlob(uri: string, contentType: string) {
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();

  if (blob.type) {
    return blob;
  }

  return new Blob([blob], { type: contentType });
}

function resolveAudioContentType(uri: string) {
  if (uri.toLowerCase().endsWith(".webm")) {
    return "audio/webm";
  }

  return AUDIO_CONTENT_TYPE;
}

function contentTypeToExtension(contentType: string) {
  if (contentType === "audio/webm") {
    return "webm";
  }

  return "m4a";
}

function formatSubmitError(error: unknown, step: string) {
  if (isAxiosError(error)) {
    const method = error.config?.method?.toUpperCase() ?? "UNKNOWN";
    const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
    const responseData =
      typeof error.response?.data === "string"
        ? error.response.data
        : JSON.stringify(error.response?.data ?? null, null, 2);

    return [
      `실패 단계: ${step}`,
      `HTTP 상태: ${error.response?.status ?? "NETWORK"}`,
      `요청: ${method} ${url || "알 수 없음"}`,
      `메시지: ${error.message}`,
      `응답: ${responseData}`,
    ].join("\n\n");
  }

  if (error instanceof Error) {
    return [`실패 단계: ${step}`, `메시지: ${error.message}`].join("\n\n");
  }

  return [`실패 단계: ${step}`, `메시지: ${String(error)}`].join("\n\n");
}

function isUnknownKeywordError(error: unknown) {
  if (!isAxiosError(error)) return false;

  const errorData = error.response?.data as
    | { error?: { code?: string } }
    | undefined;

  return error.response?.status === 422 && errorData?.error?.code === "KEYWORD-001";
}

const styles = StyleSheet.create({
  keywordContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: 28,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  guide: {
    width: "100%",
    marginBottom: 52,
  },
  guideTitle: {
    color: "#202020",
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "800",
  },
  guideDescription: {
    marginTop: 14,
    color: "#8B949C",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  micRecorderContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    marginTop: 18,
    color: "#636970",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    textAlign: "center",
  },
});
