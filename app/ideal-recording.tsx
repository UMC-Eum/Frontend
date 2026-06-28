import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import ConfirmModal from "@/components/chat/ConfirmModal";
import MicRecorder from "@/components/MicRecorder";
import {
  usePostVoiceAnalyzeMutation,
  usePresignMutation,
  useUploadFileToS3Mutation,
} from "@/hooks/api/useOnboarding";
import {
  useMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/hooks/api/useUsers";

const AUDIO_CONTENT_TYPE = "audio/mp4";

export default function IdealRecordingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // 녹음 시간 관리
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    return Math.floor(recorderState.durationMillis / 1000);
  }, [recorderState.durationMillis, recorderState.isRecording, recordingUri]);

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
  }, []);

  const handleRecordPress = async () => {
    if (isSubmitting) return;

    try {
      if (recorderState.isRecording) {
        await audioRecorder.stop();
        setRecordingUri(audioRecorder.uri ?? recorderState.url);
        return;
      }

      setRecordingUri(null);
      setStatusText("");
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch {
      Alert.alert("녹음 실패", "녹음을 시작하거나 종료하지 못했어요.");
    }
  };

  const handleCancelPress = () => {
    if (recorderState.isRecording) {
      audioRecorder.stop().catch(() => undefined);
    }
    setRecordingUri(null);
    setStatusText("");
  };

  const handleSendPress = () => {
    if (recordingTime > 0) {
      setIsRecording(false);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentConfirm = () => {
    setShowPaymentModal(false);
    handleCancelPress();
    router.push("/payment" as never);
  };

  const handleResetPress = () => {
    handleCancelPress();
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
        status={recordingUri ? "recorded" : undefined}
        isRecording={recorderState.isRecording}
        recordingTime={recordingTime}
        onRecordPress={handleRecordPress}
        onCancelPress={handleCancelPress}
        onSendPress={handleSendPress}
        onResetPress={handleResetPress}
        containerStyle={styles.micRecorderContainer}
      />

      <ConfirmModal
        visible={showPaymentModal}
        title="결제가 필요합니다"
        subtitle="이상형 음성 분석을 이용하려면 결제 화면으로 이동해주세요."
        cancelLabel="취소"
        confirmLabel="결제하기"
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
      />
    </SafeAreaView>
  );
}

async function uriToBlob(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();

  if (blob.type) {
    return blob;
  }

  return new Blob([blob], { type: AUDIO_CONTENT_TYPE });
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
  statusText: {
    marginTop: 18,
    color: "#636970",
    fontSize: 13,
    fontWeight: "600",
  },
});
