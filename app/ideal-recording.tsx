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

import { postPresign } from "@/api/onboarding/onboardingApi";
import { getMyProfile } from "@/api/users/usersApi";
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
  useUpdateMyProfileMutation,
} from "@/hooks/api/useUsers";
import type {
  IAnalyzeMatchedKeyword,
  IAnalyzeRequest,
  IAnalyzeResponse,
} from "@/types/api/onboarding/onboardingDTO";
import type { IPatchUserProfileRequest } from "@/types/api/users/usersDTO";
import type { IUserProfile } from "@/types/user";
import { resolveBirthDate } from "@/utils/profileVoice";

const AUDIO_CONTENT_TYPE = "audio/mp4";
const AUDIO_PURPOSE = "PROFILE_INTRO_AUDIO";
const ANALYZE_PROFILE_AREA_CODE = "2635000000";
const MIN_RECORDING_SECONDS = 10;
const AUDIO_UPLOAD_TIMEOUT_MS = 30000;

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
    useState<VoiceKeyword[]>([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
  const myProfileQuery = useMyProfileQuery();
  const voiceAnalyzeMutation = usePostVoiceAnalyzeMutation();
  const putIdealPersonalitiesMutation = usePutIdealPersonalitiesMutation();
  const updateMyProfileMutation = useUpdateMyProfileMutation();

  const isSubmitting =
    isUploadingAudio ||
    voiceAnalyzeMutation.isPending ||
    putIdealPersonalitiesMutation.isPending ||
    updateMyProfileMutation.isPending;
  const displayTime = useMemo(() => {
    if (recorderState.isRecording) {
      return Math.floor(recorderState.durationMillis / 1000);
    }

    return recordingTime;
  }, [recorderState.durationMillis, recorderState.isRecording, recordingTime]);
  const userName = myProfileQuery.data?.nickname?.trim() || "사용자";
  const selectedKeywordOptions = useMemo(
    () =>
      keywordOptions.filter((keyword) =>
        selectedKeywordIds.includes(keyword.id),
      ),
    [keywordOptions, selectedKeywordIds],
  );
  const selectedKeywords = useMemo(
    () => selectedKeywordOptions.map((keyword) => keyword.label),
    [selectedKeywordOptions],
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
    if (!myProfileQuery.data) {
      Alert.alert("프로필 확인 중", "내 프로필 정보를 불러온 뒤 다시 시도해주세요.");
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
        getMyProfile,
        updateMyProfileMutation.mutateAsync,
        () => myProfileQuery.refetch(),
      );

      setKeywordOptions(nextKeywordOptions);
      setSelectedKeywordIds(defaultSelectedIds(nextKeywordOptions));
      setStatusText("");
      setStep("keywords");
    } catch (error) {
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
      const errorMessage = formatSubmitError(error, "이상형 키워드 저장 API 호출");
      if (__DEV__) {
        console.log("Ideal Keyword Save Error:", errorMessage, error);
      }
      Alert.alert("저장 실패", errorMessage);
    }
  };

  const handleKeywordRerecord = () => {
    setStep("recording");
    setKeywordOptions([]);
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
  analyzeVoice: (body: IAnalyzeRequest) => Promise<IAnalyzeResponse>,
  profile: IUserProfile,
  fetchProfile: () => Promise<IUserProfile | undefined>,
  restoreProfile: (body: IPatchUserProfileRequest) => Promise<unknown>,
  refreshProfileCache: () => Promise<unknown>,
) {
  const uploadedAudioUrl = await uploadRecordedAudio(recordingUri, onStepChange);

  onStepChange("이상형 음성 분석 API 호출");
  let shouldRestoreProfile = false;

  try {
    const analysis = await analyzeVoice(
      buildProfileAnalyzeRequest(uploadedAudioUrl, profile),
    );
    shouldRestoreProfile = true;
    const analyzedKeywords = getIdealKeywordOptions(analysis);

    if (analyzedKeywords.length > 0) {
      return analyzedKeywords;
    }

    onStepChange("분석 키워드 동기화");
    const analyzedProfile = await fetchProfile();
    const profileKeywords = getProfileKeywordOptions(analyzedProfile);

    if (profileKeywords.length > 0) {
      return profileKeywords;
    }

    throw new Error(
      "음성 분석 결과에서 이상형 키워드를 찾지 못했습니다. 다시 녹음해주세요.",
    );
  } finally {
    if (shouldRestoreProfile) {
      onStepChange("프로필 정보 복구");
      await restoreProfile(buildProfileRestorePayload(profile));
      await refreshProfileCache().catch(() => undefined);
    }
  }
}

function buildProfileAnalyzeRequest(
  uploadedAudioUrl: string,
  profile: IUserProfile,
): IAnalyzeRequest {
  const profileAge =
    typeof profile.age === "number" && Number.isFinite(profile.age)
      ? profile.age
      : null;

  return {
    audioUrl: uploadedAudioUrl,
    language: "ko-KR",
    analysisType: "ideal-type",
    nickname: profile.nickname?.trim() || "사용자",
    gender: normalizeGender(profile.gender),
    birthDate: resolveBirthDate(profile.birthDate, profileAge),
    areaCode: resolveAreaCode(profile.area?.code),
  };
}

function buildProfileRestorePayload(
  profile: IUserProfile,
): IPatchUserProfileRequest {
  const payload: IPatchUserProfileRequest = {
    nickname: profile.nickname,
    gender: normalizeGender(profile.gender),
    birthDate: profile.birthDate,
    introText: profile.introText,
    keywords: profile.keywords ?? [],
    personalities: profile.personalities ?? [],
    idealPersonalities: profile.idealPersonalities ?? [],
  };

  if (profile.age >= 50 && profile.age <= 150) {
    payload.age = profile.age;
  }
  if (profile.area?.code?.trim()) {
    payload.areaCode = profile.area.code.trim();
  }
  payload.introAudioUrl = isRemoteUrl(profile.introAudioUrl)
    ? profile.introAudioUrl
    : null;

  if (isRemoteUrl(profile.profileImageUrl)) {
    payload.profileImageUrl = profile.profileImageUrl;
  }

  return payload;
}

function normalizeGender(gender?: string | null): "M" | "F" {
  return gender === "F" ? "F" : "M";
}

function resolveAreaCode(areaCode?: string | null) {
  const normalizedAreaCode = areaCode?.trim();

  return normalizedAreaCode || ANALYZE_PROFILE_AREA_CODE;
}

function getProfileKeywordOptions(profile?: IUserProfile) {
  if (!profile) return [];

  const idealPersonalityKeywords = labelsToVoiceKeywords(
    profile.idealPersonalities ?? [],
  );

  if (idealPersonalityKeywords.length > 0) {
    return idealPersonalityKeywords;
  }

  return labelsToVoiceKeywords([
    ...(profile.personalities ?? []),
    ...(profile.keywords ?? []),
  ]);
}

function isRemoteUrl(url?: string | null) {
  return /^https?:\/\//i.test(url ?? "");
}

function labelsToVoiceKeywords(labels: string[]) {
  const uniqueLabels = Array.from(
    new Set(labels.map((label) => label.trim()).filter(Boolean)),
  ).slice(0, 10);

  if (uniqueLabels.length === 0) {
    return [];
  }

  return [
    ...uniqueLabels.map((label, index) => ({
      id: `ideal-${index}-${label}`,
      label,
    })),
    { id: "more", label: "...더보기" },
  ];
}

function getIdealKeywordOptions(analysis: IAnalyzeResponse) {
  const matchedKeywordOptions = voiceKeywordsFromMatchedKeywords(
    getIdealMatchedKeywords(analysis),
  );

  if (matchedKeywordOptions.length > 0) {
    return matchedKeywordOptions;
  }

  return labelsToVoiceKeywords(
    labelsFromScoredCandidates([
      ...(analysis.keywordCandidates?.personalities ?? []),
      ...(analysis.keywordCandidates?.interests ?? []),
    ]),
  );
}

function getIdealMatchedKeywords(analysis: IAnalyzeResponse) {
  const matchedKeywords = Array.isArray(analysis.matchedKeywords)
    ? analysis.matchedKeywords
    : [];
  const idealKeywords = matchedKeywords.filter((keyword) =>
    isIdealKeywordCategory(keyword.category),
  );

  return idealKeywords.length > 0 ? idealKeywords : matchedKeywords;
}

function isIdealKeywordCategory(category?: string | null) {
  const normalizedCategory = category?.toUpperCase() ?? "";

  return (
    normalizedCategory.includes("IDEAL") ||
    normalizedCategory.includes("PERSONAL") ||
    normalizedCategory.includes("INTEREST")
  );
}

function voiceKeywordsFromMatchedKeywords(candidates: IAnalyzeMatchedKeyword[]) {
  const seenLabels = new Set<string>();
  const keywords = [...candidates]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .reduce<VoiceKeyword[]>((acc, candidate) => {
      const label = candidate.keyword?.trim() ?? "";
      if (!label || seenLabels.has(label)) {
        return acc;
      }

      seenLabels.add(label);
      acc.push({
        id: `keyword-${candidate.id}`,
        label,
      });

      return acc;
    }, [])
    .slice(0, 10);

  if (keywords.length === 0) {
    return [];
  }

  return [...keywords, { id: "more", label: "...더보기" }];
}

function labelsFromScoredCandidates(
  candidates: { text?: string | null; score?: number | null }[],
) {
  return [...candidates]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((candidate) => candidate.text?.trim() ?? "")
    .filter(Boolean);
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
  await uploadBlobToPresignedUrl(uploadUrl, blob, contentType, "Ideal Voice Upload");

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

function uploadBlobToPresignedUrl(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
  logLabel: string,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);
    xhr.timeout = AUDIO_UPLOAD_TIMEOUT_MS;
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
      reject(new Error(`${logLabel} network failed.`));
    };
    xhr.ontimeout = () => {
      reject(new Error(`${logLabel} timed out.`));
    };
    xhr.send(blob);
  });
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
