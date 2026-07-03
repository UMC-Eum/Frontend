import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { Chip } from "@/components/Chip";
import {
  DEFAULT_PROFILE_IMAGE_ASSET,
  DEFAULT_PROFILE_IMAGE_URI,
} from "@/constants/defaultProfileImage";

const PINK = "#FC3367";
const HOT_PINK = "#FF3E70";
const TEXT = "#202020";
const GRAY_700 = "#636970";
const GRAY_500 = "#A6AFB6";
const GRAY_150 = "#E9ECED";

export type VoiceKeyword = {
  id: string;
  label: string;
  category?: "interest" | "personality";
};

type HeaderProps = {
  onBack: () => void;
};

type VoiceTitleProps = {
  children: React.ReactNode;
};

type VoiceExamplesProps = {
  compact?: boolean;
};

type IdleRecorderProps = {
  onStart: () => void;
};

type RecordingControlsProps = {
  seconds: number;
  showShortWarning: boolean;
  onCancel: () => void;
  onFinish: () => void;
  onReset: () => void;
};

type PlaybackControlsProps = {
  seconds: number;
  isPlaying: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onTogglePlay: () => void;
  onSubmit: () => void;
  onReset: () => void;
};

type KeywordSelectProps = {
  userName: string;
  keywords: VoiceKeyword[];
  moreKeywords?: VoiceKeyword[];
  selectedIds: string[];
  selectedLabels?: string[];
  onToggleKeyword: (id: string) => void;
  onRerecord: () => void;
  onNext: () => void;
};

type CompletePreviewProps = {
  userName: string;
  age: number;
  locationName: string;
  profileImageUri?: string | null;
  selectedKeywords: string[];
  isSubmitting?: boolean;
  onStart: () => void;
};

export function VoiceHeader({ onBack }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color="#202020" />
      </Pressable>
    </View>
  );
}

export function VoiceTitle({ children }: VoiceTitleProps) {
  return <Text style={styles.title}>{children}</Text>;
}

export function VoiceExamples({ compact = false }: VoiceExamplesProps) {
  return (
    <View style={[styles.examples, compact && styles.examplesCompact]}>
      <Text style={styles.exampleText}>이렇게 말해도 좋아요!</Text>
      <Text style={styles.exampleText}>저는 등산하는걸 좋아하는 사람이에요.</Text>
      <Text style={styles.exampleText}>여러사람들과 다같이 즐겁게 놀고싶어요.</Text>
      <Text style={styles.exampleText}>심심할 때 마다 노래방을 즐겨가요.</Text>
    </View>
  );
}

export function IdleRecorder({ onStart }: IdleRecorderProps) {
  return (
    <View style={styles.idleRecorder}>
      <View style={styles.coachBubbleGroup}>
        <View style={styles.coachBubble}>
          <Text style={styles.coachBubbleText}>버튼을 누른 뒤 얘기해주세요!</Text>
        </View>
        <View style={styles.coachBubbleTail} />
      </View>
      <Pressable style={styles.mainMicButton} onPress={onStart}>
        <VoiceMicIcon />
      </Pressable>
    </View>
  );
}

export function RecordingControls({
  seconds,
  showShortWarning,
  onCancel,
  onFinish,
  onReset,
}: RecordingControlsProps) {
  return (
    <View style={styles.recordingControls}>
      {showShortWarning ? (
        <View style={styles.warningToast}>
          <Text style={styles.warningText}>너무 짧아요 10초 이상 말해주세요</Text>
        </View>
      ) : null}
      <Text style={styles.timerText}>{formatSeconds(seconds)}</Text>
      <View style={styles.recordingRow}>
        <Pressable style={styles.sideTextButton} onPress={onCancel}>
          <Text style={styles.sideText}>취소</Text>
        </Pressable>
        <Pressable style={styles.recordingButton} onPress={onFinish}>
          <WaveBars />
        </Pressable>
        <Pressable style={styles.sendButton} onPress={onFinish}>
          <Ionicons name="send-sharp" size={27} color={HOT_PINK} />
        </Pressable>
      </View>
      <Pressable style={styles.resetButton} onPress={onReset} hitSlop={10}>
        <Ionicons name="refresh" size={26} color="#A6AFB6" />
      </Pressable>
    </View>
  );
}

export function PlaybackControls({
  seconds,
  isPlaying,
  isSubmitting = false,
  onCancel,
  onTogglePlay,
  onSubmit,
  onReset,
}: PlaybackControlsProps) {
  return (
    <View style={styles.recordingControls}>
      <Text style={styles.timerText}>{formatSeconds(seconds)}</Text>
      <View style={styles.recordingRow}>
        <Pressable style={styles.sideTextButton} onPress={onCancel}>
          <Text style={styles.sideText}>취소</Text>
        </Pressable>
        <Pressable
          style={[styles.recordingButton, isSubmitting && styles.ctaDisabled]}
          onPress={isSubmitting ? undefined : onTogglePlay}
          disabled={isSubmitting}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={34}
            color={HOT_PINK}
            style={!isPlaying && styles.playIcon}
          />
        </Pressable>
        <Pressable
          style={[styles.sendButton, isSubmitting && styles.ctaDisabled]}
          onPress={isSubmitting ? undefined : onSubmit}
          disabled={isSubmitting}
        >
          <Ionicons name="send-sharp" size={27} color={HOT_PINK} />
        </Pressable>
      </View>
      <Pressable
        style={[styles.resetButton, isSubmitting && styles.ctaDisabled]}
        onPress={isSubmitting ? undefined : onReset}
        hitSlop={10}
        disabled={isSubmitting}
      >
        <Ionicons name="refresh" size={26} color="#A6AFB6" />
      </Pressable>
    </View>
  );
}

export function AnalyzingView({ userName }: { userName: string }) {
  return (
    <View style={styles.analyzingWrap}>
      <AnalyzingMark />
      <Text style={styles.analyzingTitle}>잠시만 기다려주세요...</Text>
      <Text style={styles.analyzingSubtitle}>
        AI가 {userName}님의 이야기를 정리중이에요!
      </Text>
      <View style={styles.tipBox}>
        <View style={styles.tipBadge}>
          <Text style={styles.tipBadgeText}>Tip</Text>
        </View>
        <Text style={styles.tipText}>
          목소리에는 텍스트보다 3배 더 많은 진심이{"\n"}담겨있다는걸
          아시나요?
        </Text>
      </View>
    </View>
  );
}

export function KeywordSelectView({
  userName,
  keywords,
  moreKeywords = [],
  selectedIds,
  selectedLabels = [],
  onToggleKeyword,
  onRerecord,
  onNext,
}: KeywordSelectProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const baseKeywords = keywords.filter((keyword) => keyword.id !== "more");
  const moreChip = keywords.find((keyword) => keyword.id === "more");
  const baseKeywordLabels = new Set(baseKeywords.map((keyword) => keyword.label));
  const selectedMoreKeywords = moreKeywords.filter(
    (keyword) =>
      selectedIds.includes(keyword.id) && !baseKeywordLabels.has(keyword.label),
  );
  const visibleKeywords = moreChip
    ? [...baseKeywords, ...selectedMoreKeywords, moreChip]
    : [...baseKeywords, ...selectedMoreKeywords];

  return (
    <View style={styles.keywordScreen}>
      <View style={styles.keywordIntro}>
        <View style={styles.aiRow}>
          <Text style={styles.aiSparkle}>✦</Text>
          <Text style={styles.aiText}>AI가 분석을 완료했어요.</Text>
        </View>
        <VoiceTitle>
          이 내용이 {userName}님을{"\n"}잘 표현하나요?
        </VoiceTitle>
        <Text style={styles.keywordDescription}>
          필요한 키워드를 선택하거나 직접 추가할 수도 있어요.{"\n"}최대
          5개까지 고를수있어요.
        </Text>
      </View>

      <View style={styles.keywordArea}>
        <Text style={styles.keywordCount}>
          <Text style={styles.keywordCountActive}>{selectedIds.length}</Text>/5
        </Text>
        <View style={styles.keywordWrap}>
          {visibleKeywords.map((keyword) => {
            const isMore = keyword.id === "more";
            const selected =
              selectedIds.includes(keyword.id) ||
              selectedLabels.includes(keyword.label);
            return (
              <Chip
                key={keyword.id}
                label={keyword.label}
                shape="rect"
                variant={selected ? "outlineActive" : "outline"}
                onPress={
                  isMore
                    ? () => setIsMoreOpen(true)
                    : () => onToggleKeyword(keyword.id)
                }
                style={isMore ? styles.keywordMoreChip : styles.keywordChip}
                textStyle={selected ? styles.keywordTextActive : styles.keywordText}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.doubleCta}>
        <Pressable style={styles.secondaryCta} onPress={onRerecord}>
          <Text style={styles.secondaryCtaText}>재녹음</Text>
        </Pressable>
        <Pressable style={styles.primaryCta} onPress={onNext}>
          <Text style={styles.primaryCtaText}>다음</Text>
        </Pressable>
      </View>

      <Modal
        visible={isMoreOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMoreOpen(false)}
      >
        <View style={styles.keywordModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsMoreOpen(false)}
          />
          <View style={styles.keywordModalSheet}>
            <View style={styles.keywordModalHeader}>
              <Text style={styles.keywordModalTitle}>관심사 더보기</Text>
              <Pressable
                style={styles.keywordModalClose}
                onPress={() => setIsMoreOpen(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={TEXT} />
              </Pressable>
            </View>
            <Text style={styles.keywordModalDescription}>
              최대 5개까지 자유롭게 고를 수 있어요.
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.keywordModalContent}
            >
              {moreKeywords.map((keyword) => {
                const selected =
                  selectedIds.includes(keyword.id) ||
                  selectedLabels.includes(keyword.label);

                return (
                  <Chip
                    key={keyword.id}
                    label={keyword.label}
                    shape="rect"
                    size="small"
                    variant={selected ? "outlineActive" : "outline"}
                    onPress={() => onToggleKeyword(keyword.id)}
                    style={styles.keywordModalChip}
                    textStyle={
                      selected ? styles.keywordTextActive : styles.keywordText
                    }
                  />
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function CompletePreviewView({
  userName,
  age,
  locationName,
  profileImageUri,
  selectedKeywords,
  isSubmitting = false,
  onStart,
}: CompletePreviewProps) {
  const previewImage =
    profileImageUri && profileImageUri !== "default"
      ? profileImageUri
      : DEFAULT_PROFILE_IMAGE_URI;
  const { height } = useWindowDimensions();
  const previewCardHeight = Math.min(472, Math.max(390, height - 420));

  return (
    <View style={styles.completeScreen}>
      <View style={styles.completeTitleArea}>
        <VoiceTitle>
          {userName}님의 프로필이{"\n"}준비됐어요! 🎉
        </VoiceTitle>
      </View>
      <View style={styles.previewSection}>
        <Text style={styles.previewCaption}>다른 분들에게는 이렇게 보여요</Text>
        <View style={[styles.previewCard, { height: previewCardHeight }]}>
          <Image
            source={previewImage === DEFAULT_PROFILE_IMAGE_URI
              ? DEFAULT_PROFILE_IMAGE_ASSET
              : { uri: previewImage }}
            style={styles.previewImage}
            contentFit="cover"
          />
          <SoftPreviewOverlay height={previewCardHeight} />
          <View style={styles.previewContent}>
            <View style={styles.previewNameRow}>
              <Text style={styles.previewName}>
                {userName} {age}세
              </Text>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.previewLocationRow}>
              <Ionicons name="location-sharp" size={22} color="#FFFFFF" />
              <Text style={styles.previewLocation}>{locationName}</Text>
            </View>
            <View style={styles.previewChips}>
              {selectedKeywords.slice(0, 4).map((keyword) => (
                <View key={keyword} style={styles.previewChip}>
                  <Text style={styles.previewChipText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      <View style={styles.singleCta}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryCtaFull,
            pressed && !isSubmitting && styles.ctaPressed,
            isSubmitting && styles.ctaDisabled,
          ]}
          onPress={isSubmitting ? undefined : onStart}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryCtaText}>
            {isSubmitting ? "생성 중..." : "시작하기"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SoftPreviewOverlay({ height }: { height: number }) {
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height={height}
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <LinearGradient id="previewGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0" />
          <Stop offset="0.42" stopColor="#000000" stopOpacity="0.05" />
          <Stop offset="0.68" stopColor="#000000" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height={height} fill="url(#previewGradient)" />
    </Svg>
  );
}

function WaveBars() {
  const scales = useRef([
    new Animated.Value(0.35),
    new Animated.Value(0.55),
    new Animated.Value(0.95),
    new Animated.Value(0.55),
  ]).current;

  useEffect(() => {
    const animations = scales.map((scale, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 110),
          Animated.timing(scale, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.35,
            duration: 360,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [scales]);

  return (
    <View style={styles.waveBars}>
      {scales.map((scale, index) => (
        <Animated.View
          key={`bar-${index}`}
          style={[styles.waveBar, { transform: [{ scaleY: scale }] }]}
        />
      ))}
    </View>
  );
}

function AnalyzingMark() {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.analyzingMark}>
      <Animated.View
        style={[styles.analyzingRing, { transform: [{ rotate: spin }] }]}
      />
      <View style={styles.analyzingCore}>
        <View style={styles.analyzingDots}>
          <View style={styles.analyzingDot} />
          <View style={styles.analyzingDot} />
          <View style={styles.analyzingDot} />
        </View>
      </View>
    </View>
  );
}

export function VoiceMicIcon() {
  return (
    <Svg width={38} height={38} viewBox="0 0 42 42" fill="none">
      <Path
        d="M21 26.25C24.13 26.25 26.66 23.72 26.66 20.59V11.91C26.66 8.78 24.13 6.25 21 6.25C17.87 6.25 15.34 8.78 15.34 11.91V20.59C15.34 23.72 17.87 26.25 21 26.25Z"
        stroke="#FFFFFF"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <Path
        d="M10.5 18.9V20.6C10.5 26.4 15.2 31.1 21 31.1C26.8 31.1 31.5 26.4 31.5 20.6V18.9"
        stroke="#FFFFFF"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <Path
        d="M21 31.1V36"
        stroke="#FFFFFF"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  title: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 36,
  },
  examples: {
    marginTop: 52,
    gap: 12,
  },
  examplesCompact: {
    marginTop: 64,
  },
  exampleText: {
    color: GRAY_500,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  idleRecorder: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 69,
    alignItems: "center",
  },
  coachBubbleGroup: {
    alignItems: "center",
  },
  coachBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: HOT_PINK,
    shadowColor: HOT_PINK,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  coachBubbleText: {
    color: "#FFF0F2",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  coachBubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: HOT_PINK,
  },
  mainMicButton: {
    marginTop: 23,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: HOT_PINK,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: HOT_PINK,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  recordingControls: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 23,
    alignItems: "center",
  },
  warningToast: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: "rgba(32, 32, 32, 0.74)",
  },
  warningText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  timerText: {
    color: GRAY_700,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23,
    marginBottom: 20,
  },
  recordingRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 34,
  },
  sideTextButton: {
    width: 56,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  sideText: {
    color: GRAY_700,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
  },
  recordingButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFA0B4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: HOT_PINK,
    shadowOpacity: 0.32,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  waveBars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  waveBar: {
    width: 8,
    height: 24,
    borderRadius: 4,
    backgroundColor: HOT_PINK,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  playIcon: {
    marginLeft: 4,
  },
  resetButton: {
    marginTop: 18,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingWrap: {
    flex: 1,
    alignItems: "center",
    paddingTop: 133,
    paddingHorizontal: 20,
  },
  analyzingMark: {
    width: 126,
    height: 126,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  analyzingRing: {
    position: "absolute",
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 9,
    borderColor: "rgba(255, 160, 180, 0.3)",
    borderLeftColor: PINK,
    borderBottomColor: PINK,
  },
  analyzingCore: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HOT_PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingDots: {
    flexDirection: "row",
    gap: 10,
  },
  analyzingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  analyzingTitle: {
    color: TEXT,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 34,
    textAlign: "center",
  },
  analyzingSubtitle: {
    marginTop: 12,
    color: GRAY_500,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 22,
    textAlign: "center",
  },
  tipBox: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 503,
    minHeight: 98,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PINK,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: PINK,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  tipBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: HOT_PINK,
    marginBottom: 12,
  },
  tipBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 15,
  },
  tipText: {
    color: GRAY_700,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
  },
  keywordScreen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  keywordIntro: {
    paddingTop: 52,
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  aiSparkle: {
    color: PINK,
    fontSize: 20,
    fontWeight: "700",
  },
  aiText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  keywordDescription: {
    marginTop: 16,
    color: GRAY_700,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  keywordArea: {
    marginTop: 46,
  },
  keywordCount: {
    color: GRAY_500,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 12,
  },
  keywordCountActive: {
    color: HOT_PINK,
  },
  keywordWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  keywordChip: {
    height: 42,
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  keywordMoreChip: {
    height: 42,
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  keywordText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  keywordTextActive: {
    color: PINK,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  keywordModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.36)",
  },
  keywordModalSheet: {
    maxHeight: "72%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  keywordModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  keywordModalTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  keywordModalClose: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  keywordModalDescription: {
    marginTop: 4,
    color: GRAY_700,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  keywordModalContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 18,
    paddingBottom: 8,
  },
  keywordModalChip: {
    borderRadius: 7,
  },
  doubleCta: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 48,
    flexDirection: "row",
    gap: 12,
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
    color: GRAY_700,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  primaryCta: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: HOT_PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  completeScreen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  completeTitleArea: {
    marginTop: 12,
  },
  previewSection: {
    marginTop: 42,
  },
  previewCaption: {
    color: GRAY_700,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 16,
  },
  previewCard: {
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  previewContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  previewNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  previewName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 30,
  },
  previewLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  previewLocation: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  previewChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  previewChip: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "rgba(255, 240, 242, 0.2)",
  },
  previewChipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  singleCta: {
    marginTop: 20,
    paddingBottom: 24,
  },
  primaryCtaFull: {
    height: 54,
    borderRadius: 14,
    backgroundColor: HOT_PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaDisabled: {
    opacity: 0.65,
  },
});
