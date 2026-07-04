import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import {
  AudioModule,
  createAudioPlayer,
  RecordingPresets,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { postPresign } from "@/api/onboarding/onboardingApi";
import { PROFILE_PERSONALITY_KEYWORDS } from "@/constants/profileKeywords";
import { getMyProfile } from "@/api/users/usersApi";
import { AnalyzingView, VoiceKeyword } from "@/components/profile/ProfileVoiceParts";
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

const BG_GRAY = "#F8FAFB";
const WHITE = "#FFFFFF";
const PRIMARY = "#FC3367";
const TEXT_900 = "#202020";
const GRAY_700 = "#636970";
const GRAY_500 = "#A6AFB6";
const GRAY_300 = "#DEE3E5";
const GRAY_150 = "#DEE3E5";
const CHIP_ACTIVE_BG = "#FFECF1";

const EXAMPLE_LINES = [
  "이렇게 말해도 좋아요!",
  "비슷한 나이대의 조용한 사람이 좋아요.",
  "술은 많이 안 마셨으면 좋겠어요.",
  "대화는 자주 하는 편이면 좋겠어요.",
];

const DEFAULT_KEYWORD_OPTIONS: VoiceKeyword[] = [
  { id: "calm", label: "차분함" },
  { id: "careful", label: "신중함" },
  { id: "planned", label: "계획성" },
  { id: "more", label: "... 더보기" },
];

// 온보딩과 동일하게 "더보기"로 펼치는 추가 성격 키워드 목록입니다.
const MORE_KEYWORDS: VoiceKeyword[] = PROFILE_PERSONALITY_KEYWORDS.map(
  (label, index) => ({
    id: `personality-${index}-${label}`,
    label,
    category: "personality" as const,
  }),
);

type IdealRecordingStep = "recording" | "analyzing" | "keywords";

export default function IdealRecordingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const playbackPlayerRef = useRef<AudioPlayer | null>(null);
  const playbackStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showShortWarning, setShowShortWarning] = useState(false);
  const [step, setStep] = useState<IdealRecordingStep>("recording");
  const [keywordOptions, setKeywordOptions] =
    useState<VoiceKeyword[]>(DEFAULT_KEYWORD_OPTIONS);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
  const myProfileQuery = useMyProfileQuery();
  const voiceAnalyzeMutation = usePostVoiceAnalyzeMutation();
  const putIdealPersonalitiesMutation = usePutIdealPersonalitiesMutation();
  const updateMyProfileMutation = useUpdateMyProfileMutation();

  const isSubmitting =
    step === "analyzing" ||
    voiceAnalyzeMutation.isPending ||
    putIdealPersonalitiesMutation.isPending ||
    updateMyProfileMutation.isPending;
  const displayTime = useMemo(() => {
    if (recorderState.isRecording) {
      return Math.floor(recorderState.durationMillis / 1000);
    }

    // 녹음 완료/재생 중에는 녹음한 전체 시간을 그대로 유지해서 보여줍니다.
    return recordingTime;
  }, [recorderState.durationMillis, recorderState.isRecording, recordingTime]);
  const hasRecording = !recorderState.isRecording && recordingUri !== null;
  const userName = myProfileQuery.data?.nickname?.trim() || "사용자";
  // base 키워드 + 더보기 키워드를 합쳐, 어느 쪽에서 고르든 선택/저장에 반영합니다.
  const allKeywordOptions = useMemo(() => {
    const baseLabels = new Set(keywordOptions.map((keyword) => keyword.label));
    const extraKeywords = MORE_KEYWORDS.filter(
      (keyword) => !baseLabels.has(keyword.label),
    );
    return [...keywordOptions, ...extraKeywords];
  }, [keywordOptions]);
  const selectedKeywords = useMemo(
    () =>
      allKeywordOptions
        .filter((keyword) => selectedKeywordIds.includes(keyword.id))
        .map((keyword) => keyword.label),
    [allKeywordOptions, selectedKeywordIds],
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

  // 화면을 벗어날 때 재생 중이던 플레이어를 정리합니다.
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
    setIsPlaying(false);
  };

  // 녹음한 음성을 재생/일시정지 토글합니다. (온보딩과 동일한 createAudioPlayer 방식)
  const togglePlayback = async () => {
    if (!recordingUri) return;

    try {
      if (isPlaying) {
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
        { uri: recordingUri },
        { updateInterval: 250, keepAudioSessionActive: true },
      );
      playbackPlayerRef.current = nextPlayer;
      await wait(180);
      try {
        await nextPlayer.seekTo(0);
      } catch {
        // 일부 플랫폼은 메타데이터 준비 전 seek이 안 되지만 재생은 정상 동작합니다.
      }

      nextPlayer.play();
      setIsPlaying(true);
      // didJustFinish에 의존하지 않고 녹음 길이만큼 후 자동 정지시킵니다.
      playbackStopTimerRef.current = setTimeout(
        () => {
          if (playbackPlayerRef.current === nextPlayer) {
            stopPlayback();
          }
        },
        Math.max(recordingTime, 1) * 1000 + 500,
      );
    } catch (error) {
      console.error("Ideal Playback Error:", error);
      stopPlayback();
      Alert.alert("재생 실패", "녹음 파일을 다시 재생하지 못했어요.");
    }
  };

  // 가운데 버튼(초기 상태): 새 녹음을 시작합니다.
  const startRecording = async () => {
    if (isSubmitting) return;

    stopPlayback();

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      setRecordingUri(null);
      setRecordingTime(0);
      setShowShortWarning(false);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error("Ideal Record Error:", error);
      Alert.alert("녹음 실패", "녹음을 시작하지 못했어요.");
    }
  };

  // 중지 버튼: 녹음을 마무리하고 결과 파일을 보관합니다. (온보딩과 동일하게 10초 이상 필요)
  const stopRecording = async () => {
    if (!recorderState.isRecording || isSubmitting) return;

    const nextSeconds = Math.max(
      recordingTime,
      Math.floor(recorderState.durationMillis / 1000),
    );

    // 10초 미만이면 경고만 띄우고 녹음을 계속합니다.
    if (nextSeconds < MIN_RECORDING_SECONDS) {
      setShowShortWarning(true);
      return;
    }

    try {
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
      setShowShortWarning(false);
    } catch (error) {
      console.error("Ideal Record Error:", error);
      Alert.alert("녹음 실패", "녹음을 멈추지 못했어요.");
    }
  };

  // 가운데 버튼(녹음 중/녹음 완료): 녹음을 마무리하고 분석으로 전송합니다. (10초 이상 필요)
  const sendRecording = async () => {
    if (isSubmitting) return;

    stopPlayback();

    // 녹음이 이미 끝난 상태면 보관된 파일을 바로 전송합니다.
    if (!recorderState.isRecording) {
      if (!recordingUri) {
        Alert.alert("녹음이 필요해요", "먼저 이상형 음성을 녹음해주세요.");
        return;
      }

      if (recordingTime < MIN_RECORDING_SECONDS) {
        setShowShortWarning(true);
        return;
      }

      setShowShortWarning(false);
      await submitRecording(recordingUri);
      return;
    }

    // 녹음 중이면 먼저 마무리한 뒤 전송합니다.
    const seconds = Math.max(
      recordingTime,
      Math.floor(recorderState.durationMillis / 1000),
    );

    if (seconds < MIN_RECORDING_SECONDS) {
      setShowShortWarning(true);
      return;
    }

    let uri: string | null;
    try {
      await audioRecorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      uri = audioRecorder.uri ?? recorderState.url;
    } catch (error) {
      console.error("Ideal Record Error:", error);
      Alert.alert("녹음 실패", "녹음을 종료하지 못했어요.");
      return;
    }

    if (!uri) {
      Alert.alert("녹음이 필요해요", "먼저 이상형 음성을 녹음해주세요.");
      return;
    }

    setRecordingUri(uri);
    setRecordingTime(seconds);
    setShowShortWarning(false);
    await submitRecording(uri);
  };

  const resetRecording = async () => {
    if (isSubmitting) return;

    stopPlayback();

    if (recorderState.isRecording) {
      await audioRecorder.stop().catch(() => undefined);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
    }

    setRecordingUri(null);
    setRecordingTime(0);
    setShowShortWarning(false);
  };

  const submitRecording = async (uri: string) => {
    if (myProfileQuery.isError) {
      Alert.alert("프로필 확인 실패", "내 프로필 정보를 불러온 뒤 다시 시도해주세요.");
      return;
    }
    if (!myProfileQuery.data) {
      Alert.alert("프로필 확인 중", "내 프로필 정보를 불러온 뒤 다시 시도해주세요.");
      return;
    }

    setStep("analyzing");
    let submitStep = "음성 업로드 준비";

    try {
      const nextKeywordOptions = await getIdealPersonalityKeywords(
        uri,
        (currentStep) => {
          submitStep = currentStep;
        },
        voiceAnalyzeMutation.mutateAsync,
        myProfileQuery.data,
        getMyProfile,
        updateMyProfileMutation.mutateAsync,
        () => myProfileQuery.refetch(),
      );

      setKeywordOptions(nextKeywordOptions);
      setSelectedKeywordIds(defaultSelectedIds(nextKeywordOptions));
      setStep("keywords");
    } catch (error) {
      const errorMessage = formatSubmitError(error, submitStep);
      if (__DEV__) {
        console.log("Ideal Voice Submit Error:", errorMessage, error);
      }
      setStep("recording");
      Alert.alert("분석 실패", errorMessage);
    }
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

  const handleSave = async () => {
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

  const handleRerecord = () => {
    setStep("recording");
    setKeywordOptions([]);
    setSelectedKeywordIds([]);
    resetRecording();
  };

  const handleBackPress = () => {
    if (step === "keywords") {
      handleRerecord();
      return;
    }

    if (step === "analyzing") {
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)" as never);
  };

  if (step === "analyzing") {
    return (
      <SafeAreaView style={styles.whiteContainer} edges={["top", "bottom"]}>
        <AnalyzingView userName={userName} />
      </SafeAreaView>
    );
  }

  if (step === "keywords") {
    return (
      <SafeAreaView style={styles.whiteContainer} edges={["top", "bottom"]}>
        <IdealHeader onBack={handleBackPress} />
        <KeywordResultView
          userName={userName}
          keywords={keywordOptions}
          moreKeywords={MORE_KEYWORDS}
          selectedIds={selectedKeywordIds}
          selectedLabels={selectedKeywords}
          onToggleKeyword={handleToggleKeyword}
          onRerecord={handleRerecord}
          onSave={handleSave}
          isSaving={putIdealPersonalitiesMutation.isPending}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.grayContainer} edges={["top", "bottom"]}>
      <IdealHeader onBack={handleBackPress} />

      <View style={styles.guide}>
        <Text style={styles.guideTitle}>
          {recorderState.isRecording || hasRecording
            ? "듣고 있어요 ..."
            : `${userName}님의\n이상형을 이야기해주세요 !`}
        </Text>
        <View style={styles.examples}>
          {EXAMPLE_LINES.map((line) => (
            <Text key={line} style={styles.exampleText}>
              {line}
            </Text>
          ))}
        </View>
      </View>

      <View style={[styles.recorderArea, { bottom: insets.bottom + 24 }]}>
        {showShortWarning ? (
          <View style={styles.warningToast}>
            <Text style={styles.warningText}>너무 짧아요! 10초 이상 말해주세요!</Text>
          </View>
        ) : null}

        {recorderState.isRecording || hasRecording ? (
          <Text style={styles.timerText}>{formatTime(displayTime)}</Text>
        ) : null}

        <View style={styles.recorderRow}>
          <View style={styles.sideSlot}>
            {recorderState.isRecording ? (
              // 녹음 중: 중지 버튼
              <Pressable
                style={({ pressed }) => [
                  styles.circleSideButton,
                  pressed && styles.pressed,
                ]}
                onPress={stopRecording}
                hitSlop={8}
              >
                <Ionicons name="pause" size={26} color={GRAY_700} />
              </Pressable>
            ) : hasRecording ? (
              // 중지됨: 재생/일시정지 토글 버튼 (중지 버튼과 동일한 회색 디자인)
              <Pressable
                style={({ pressed }) => [
                  styles.circleSideButton,
                  pressed && styles.pressed,
                ]}
                onPress={togglePlayback}
                hitSlop={8}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={26}
                  color={GRAY_700}
                  style={!isPlaying ? styles.playIcon : undefined}
                />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.recordButton,
              pressed && styles.pressed,
            ]}
            // 녹음 중/녹음 완료: 전송 / 초기: 녹음 시작
            onPress={
              recorderState.isRecording || hasRecording
                ? sendRecording
                : startRecording
            }
          >
            {recorderState.isRecording || hasRecording ? (
              <RecordingWave animate={recorderState.isRecording || isPlaying} />
            ) : (
              <Ionicons name="mic" size={34} color={PRIMARY} />
            )}
          </Pressable>

          <View style={styles.sideSlot}>
            {recorderState.isRecording || hasRecording ? (
              <Pressable
                style={({ pressed }) => [
                  styles.circleSideButton,
                  pressed && styles.pressed,
                ]}
                onPress={resetRecording}
                hitSlop={8}
              >
                <Ionicons name="refresh" size={24} color={GRAY_500} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function IdealHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={TEXT_900} />
      </Pressable>
    </View>
  );
}

type KeywordResultProps = {
  userName: string;
  keywords: VoiceKeyword[];
  moreKeywords?: VoiceKeyword[];
  selectedIds: string[];
  selectedLabels?: string[];
  onToggleKeyword: (id: string) => void;
  onRerecord: () => void;
  onSave: () => void;
  isSaving: boolean;
};

function KeywordResultView({
  userName,
  keywords,
  moreKeywords = [],
  selectedIds,
  selectedLabels = [],
  onToggleKeyword,
  onRerecord,
  onSave,
  isSaving,
}: KeywordResultProps) {
  const insets = useSafeAreaInsets();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // 온보딩과 동일: base 키워드 + (더보기에서 고른 키워드) + 더보기 칩 순으로 노출
  const baseKeywords = keywords.filter((keyword) => keyword.id !== "more");
  const moreChip = keywords.find((keyword) => keyword.id === "more");
  const baseKeywordLabels = new Set(baseKeywords.map((keyword) => keyword.label));
  // base와 라벨이 겹치는 더보기 키워드는 중복이므로 모달·선택 목록에서 제외합니다.
  const modalKeywords = moreKeywords.filter(
    (keyword) => !baseKeywordLabels.has(keyword.label),
  );
  const selectedMoreKeywords = modalKeywords.filter((keyword) =>
    selectedIds.includes(keyword.id),
  );
  const visibleKeywords = moreChip
    ? [...baseKeywords, ...selectedMoreKeywords, moreChip]
    : [...baseKeywords, ...selectedMoreKeywords];

  return (
    <View style={styles.keywordScreen}>
      <View style={styles.keywordIntro}>
        <Text style={styles.keywordTitle}>
          말씀해주신 내용을 바탕으로{"\n"}키워드를 정리했어요.
        </Text>
        <Text style={styles.keywordSubtitle}>{userName}님의 이상형은...</Text>
      </View>

      <View style={styles.keywordWrap}>
        {visibleKeywords.map((keyword) => {
          const isMore = keyword.id === "more";
          const selected =
            selectedIds.includes(keyword.id) ||
            selectedLabels.includes(keyword.label);

          return (
            <Pressable
              key={keyword.id}
              style={[
                styles.chip,
                selected && styles.chipActive,
                isMore && styles.chipMore,
              ]}
              onPress={
                isMore
                  ? () => setIsMoreOpen(true)
                  : () => onToggleKeyword(keyword.id)
              }
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextActive]}
              >
                {keyword.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Modal
        visible={isMoreOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMoreOpen(false)}
      >
        <View style={styles.moreOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsMoreOpen(false)}
          />
          <View style={[styles.moreSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.moreHeader}>
              <Text style={styles.moreTitle}>성격 더보기</Text>
              <Pressable
                style={styles.moreClose}
                onPress={() => setIsMoreOpen(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={TEXT_900} />
              </Pressable>
            </View>
            <Text style={styles.moreDescription}>
              최대 5개까지 자유롭게 고를 수 있어요.
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.moreContent}
            >
              {modalKeywords.map((keyword) => {
                const selected =
                  selectedIds.includes(keyword.id) ||
                  selectedLabels.includes(keyword.label);

                return (
                  <Pressable
                    key={keyword.id}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => onToggleKeyword(keyword.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextActive,
                      ]}
                    >
                      {keyword.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={[styles.keywordFooter, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.footerHint}>
          키워드는 프로필에서 언제든 수정할 수 있어요!
        </Text>
        <View style={styles.doubleCta}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryCta,
              pressed && styles.pressed,
            ]}
            onPress={onRerecord}
            disabled={isSaving}
          >
            <Text style={styles.secondaryCtaText}>재녹음</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.primaryCta,
              pressed && !isSaving && styles.pressed,
              isSaving && styles.ctaDisabled,
            ]}
            onPress={isSaving ? undefined : onSave}
            disabled={isSaving}
          >
            <Text style={styles.primaryCtaText}>
              {isSaving ? "저장 중..." : "저장"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const WAVE_STATIC_SCALES = [0.4, 0.7, 1, 0.7, 0.4];

function RecordingWave({ animate = true }: { animate?: boolean }) {
  const scales = useRef(
    WAVE_STATIC_SCALES.map((value) => new Animated.Value(value)),
  ).current;

  useEffect(() => {
    // 녹음/재생 중이 아닐 때는 진행 중인 애니메이션을 멈추고 정적인 기본 높이로 고정합니다.
    if (!animate) {
      scales.forEach((scale, index) => {
        scale.stopAnimation(() => scale.setValue(WAVE_STATIC_SCALES[index]));
      });
      return;
    }

    const animations = scales.map((scale, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.4,
            duration: 340,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [animate, scales]);

  return (
    <View style={styles.wave}>
      {scales.map((scale, index) => (
        <Animated.View
          key={`wave-${index}`}
          style={[styles.waveBar, { transform: [{ scaleY: scale }] }]}
        />
      ))}
    </View>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    { id: "more", label: "... 더보기" },
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

  return [...keywords, { id: "more", label: "... 더보기" }];
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
  return keywords
    .filter((keyword) => keyword.id !== "more")
    .slice(0, 3)
    .map((keyword) => keyword.id);
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

const styles = StyleSheet.create({
  grayContainer: {
    flex: 1,
    backgroundColor: BG_GRAY,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    height: 45,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  guide: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  guideTitle: {
    color: TEXT_900,
    fontSize: 28,
    lineHeight: 39,
    fontWeight: "700",
  },
  examples: {
    marginTop: 24,
    gap: 12,
  },
  exampleText: {
    color: GRAY_500,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "500",
  },
  recorderArea: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  warningToast: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: CHIP_ACTIVE_BG,
  },
  warningText: {
    color: PRIMARY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  timerText: {
    marginBottom: 17,
    color: PRIMARY,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "500",
  },
  recorderRow: {
    width: 341,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideSlot: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  circleSideButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#EEF1F3",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    shadowColor: "#A1002A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 25,
    elevation: 8,
  },
  wave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  waveBar: {
    width: 6,
    height: 22,
    borderRadius: 14,
    backgroundColor: PRIMARY,
  },
  playIcon: {
    marginLeft: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  keywordScreen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  keywordIntro: {
    marginTop: 28,
    gap: 8,
  },
  keywordTitle: {
    color: TEXT_900,
    fontSize: 28,
    lineHeight: 39,
    fontWeight: "600",
  },
  keywordSubtitle: {
    color: GRAY_700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  keywordWrap: {
    marginTop: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: GRAY_300,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: CHIP_ACTIVE_BG,
    borderColor: PRIMARY,
  },
  chipMore: {
    borderColor: GRAY_300,
  },
  chipText: {
    color: GRAY_700,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  chipTextActive: {
    color: PRIMARY,
  },
  moreOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.36)",
  },
  moreSheet: {
    maxHeight: "72%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  moreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moreTitle: {
    color: TEXT_900,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  moreClose: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  moreDescription: {
    marginTop: 4,
    color: GRAY_700,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  moreContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    paddingTop: 18,
    paddingBottom: 8,
  },
  keywordFooter: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 0,
    alignItems: "center",
    gap: 18,
  },
  footerHint: {
    color: GRAY_500,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  doubleCta: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  secondaryCta: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: GRAY_150,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryCtaText: {
    color: GRAY_500,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600",
  },
  primaryCta: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaText: {
    color: WHITE,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600",
  },
  ctaDisabled: {
    opacity: 0.65,
  },
});
