import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import MicRecorder from "@/components/MicRecorder";

export default function IdealRecordingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // 녹음 시간 관리
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleRecordPress = () => {
    setIsRecording(!isRecording);
  };

  const handleCancelPress = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleSendPress = () => {
    if (recordingTime > 0) {
      console.log("녹음 전송:", recordingTime + "초");
      handleCancelPress();
    }
  };

  const handleResetPress = () => {
    setRecordingTime(0);
    setIsRecording(false);
  };

  // 직접 진입처럼 뒤로 갈 히스토리가 없는 경우에는 홈 화면으로 이동합니다.
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home" as never);
  };

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

      {/* MicRecorder 컴포넌트 */}
      <MicRecorder
        isRecording={isRecording}
        recordingTime={recordingTime}
        onRecordPress={handleRecordPress}
        onCancelPress={handleCancelPress}
        onSendPress={handleSendPress}
        onResetPress={handleResetPress}
        containerStyle={styles.micRecorderContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
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
  micRecorderContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
