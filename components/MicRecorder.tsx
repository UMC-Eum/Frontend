import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

export type MicRecorderStatus = "idle" | "recording" | "recorded";

interface MicRecorderProps {
  status?: MicRecorderStatus;
  isRecording?: boolean;
  recordingTime: number;
  onRecordPress: () => void;
  onCancelPress: () => void;
  onSendPress: () => void;
  onResetPress: () => void;
  onPlayPress?: () => void;
  containerStyle?: ViewStyle;
}

const PINK = "#FF1B4D";
const TEXT = "#5F6770";
const MUTED = "#9EA8AF";
const WHITE = "#FFFFFF";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

function resolveStatus({
  status,
  isRecording,
  recordingTime,
}: Pick<MicRecorderProps, "status" | "isRecording" | "recordingTime">) {
  if (status) {
    return status;
  }

  if (isRecording) {
    return "recording";
  }

  return recordingTime > 0 ? "recorded" : "idle";
}

function Waveform() {
  const bars = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
  ).current;

  // 녹음 중에는 막대가 살짝 흔들리며 음성 파형처럼 보이게 합니다.
  useEffect(() => {
    const animations = bars.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 90),
          Animated.timing(bar, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [bars]);

  return (
    <View style={styles.waveform}>
      {bars.map((bar, index) => (
        <Animated.View
          key={`wave-${index}`}
          style={[
            styles.waveBar,
            {
              transform: [
                {
                  scaleY: bar.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.55, 1.15],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

function RecordedDots() {
  return (
    <View style={styles.recordedDots}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={`recorded-dot-${index}`} style={styles.recordedDot} />
      ))}
    </View>
  );
}

export default function MicRecorder({
  status,
  isRecording,
  recordingTime,
  onRecordPress,
  onCancelPress,
  onSendPress,
  onResetPress,
  onPlayPress,
  containerStyle,
}: MicRecorderProps) {
  const currentStatus = resolveStatus({ status, isRecording, recordingTime });
  const hasRecording = currentStatus !== "idle" || recordingTime > 0;

  const centerButtonStyle = useMemo(() => {
    if (currentStatus === "recording") {
      return [styles.centerButton, styles.recordingButton];
    }

    return [styles.centerButton, styles.primaryButton];
  }, [currentStatus]);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 녹음 시간 표시 영역입니다. */}
      <Text style={styles.timer}>{formatTime(recordingTime)}</Text>

      {/* 취소/녹음/전송을 한 줄에 배치합니다. */}
      <View style={styles.controlsRow}>
        <View style={styles.sideSlot}>
          {currentStatus === "recorded" ? (
            <Pressable
              style={({ pressed }) => [
                styles.circleSideButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onPlayPress}
            >
              <Ionicons name="play" size={22} color={TEXT} />
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onCancelPress}
            >
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.centerSlot}>
          <Pressable
            style={({ pressed }) => [
              centerButtonStyle,
              pressed && styles.buttonPressed,
            ]}
            onPress={onRecordPress}
          >
            {currentStatus === "idle" ? (
              <Ionicons name="mic-outline" size={42} color={WHITE} />
            ) : null}

            {currentStatus === "recording" ? <Waveform /> : null}
            {currentStatus === "recorded" ? <RecordedDots /> : null}
          </Pressable>
        </View>

        <View style={styles.sideSlot}>
          <Pressable
            style={({ pressed }) => [
              styles.circleSideButton,
              !hasRecording && styles.sendButtonIdle,
              pressed && styles.buttonPressed,
            ]}
            onPress={onSendPress}
            disabled={!hasRecording}
          >
            <Ionicons
              name="send-sharp"
              size={24}
              color={hasRecording ? PINK : TEXT}
            />
          </Pressable>
        </View>
      </View>

      {/* 리셋 버튼은 녹음 데이터가 있을 때만 보이게 합니다. */}
      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          !hasRecording && styles.resetButtonHidden,
          pressed && styles.buttonPressed,
        ]}
        onPress={onResetPress}
        disabled={!hasRecording}
      >
        <Ionicons name="refresh" size={25} color={MUTED} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  timer: {
    marginBottom: 22,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    color: TEXT,
  },
  controlsRow: {
    width: "100%",
    maxWidth: 316,
    height: 94,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideSlot: {
    width: 72,
    height: 94,
    alignItems: "center",
    justifyContent: "center",
  },
  centerSlot: {
    width: 94,
    height: 94,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    width: 64,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    color: TEXT,
  },
  circleSideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sendButtonIdle: {
    opacity: 0.95,
  },
  centerButton: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: PINK,
  },
  recordingButton: {
    borderWidth: 1,
    borderColor: PINK,
    backgroundColor: WHITE,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  waveform: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  waveBar: {
    width: 7,
    height: 20,
    borderRadius: 4,
    backgroundColor: PINK,
  },
  recordedDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  recordedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WHITE,
  },
  resetButton: {
    width: 44,
    height: 44,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonHidden: {
    opacity: 0,
  },
});
