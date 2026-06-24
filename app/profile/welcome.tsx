import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import MicRecorder from "@/components/MicRecorder";

import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

const MIN_RECORDING_SECONDS = 10;

const EXAMPLES = [
  "이렇게 말해도 좋아요!",
  "저는 등산하는걸 좋아하는 사람이에요.",
  "여러사람들과 다같이 즐겁게 놀고싶어요.",
  "심심할 때 마다 노래방을 즐겨가요.",
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userName = useOnboardingDraftStore((state) => state.nickname) || "루씨";
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [shortWarningVisible, setShortWarningVisible] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const handleRecordPress = () => {
    setShortWarningVisible(false);
    setIsRecording((prev) => !prev);
  };

  const handleCancelPress = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setShortWarningVisible(false);
  };

  const handleSendPress = () => {
    if (recordingTime < MIN_RECORDING_SECONDS) {
      setIsRecording(false);
      setShortWarningVisible(true);
      return;
    }

    setIsRecording(false);
    router.push("/profile/analyzing" as never);
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
        <Text style={styles.title}>
          반갑습니다! {userName}님{"\n"}
          {userName}님의 이야기를 들려주세요.
        </Text>

        <View style={styles.exampleList}>
          {EXAMPLES.map((example, index) => (
            <Text
              key={example}
              style={[styles.exampleText, index === 0 && styles.exampleTitle]}
            >
              {example}
            </Text>
          ))}
        </View>
      </View>

      <View style={[styles.recorderArea, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {shortWarningVisible
              ? "너무 짧아요 10초 이상 말해주세요"
              : "버튼을 누른 뒤 얘기해주세요!"}
          </Text>
          <View style={styles.tooltipArrow} />
        </View>

        <MicRecorder
          status={isRecording ? "recording" : recordingTime > 0 ? "recorded" : "idle"}
          recordingTime={recordingTime}
          onRecordPress={handleRecordPress}
          onCancelPress={handleCancelPress}
          onSendPress={handleSendPress}
          onResetPress={handleCancelPress}
          containerStyle={styles.recorder}
        />
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
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "600",
    color: "#202020",
  },
  exampleList: {
    gap: 12,
    marginTop: 48,
  },
  exampleText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    color: "#A6AFB6",
  },
  exampleTitle: {
    marginBottom: 4,
  },
  recorderArea: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tooltip: {
    alignItems: "center",
    marginBottom: 18,
  },
  tooltipText: {
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FF3E70",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: "#FFF0F2",
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FF3E70",
  },
  recorder: {
    width: "100%",
  },
});
