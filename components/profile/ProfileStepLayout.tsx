import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KEYBOARD_AVOIDING_BEHAVIOR } from "@/constants/keyboard";
import ProgressBar from "../progress-bar";

interface ProfileStepLayoutProps {
  /** 상단 제목 */
  title: string;
  /** 제목 아래 부가 설명 */
  subtitle?: string;
  /** 하단 버튼 텍스트 */
  buttonText?: string;
  /** 하단 버튼 활성화 여부 */
  buttonEnabled?: boolean;
  /** 하단 버튼 클릭 */
  onNext?: () => void;
  /** 하단 버튼 숨김 여부 */
  hideBottomButton?: boolean;
  /** 뒤로가기 표시 여부 */
  showBack?: boolean;
  /** 뒤로가기 클릭 */
  onBack?: () => void;
  /** 현재 프로필 설정 단계 */
  step?: number;
  /** 전체 프로필 설정 단계 수 */
  totalSteps?: number;
  /** 자식 컴포넌트 (메인 컨텐츠 영역) */
  children: React.ReactNode;
}

/**
 * 프로필 설정 공통 레이아웃
 * - 뒤로가기 + 제목 + 서브타이틀
 * - 메인 컨텐츠 영역 (children)
 * - 하단 "다음" 버튼 (활성/비활성)
 *
 * 재사용: 이름, 나이, 성별, 사진 등 모든 프로필 단계에서 사용
 */
const ProfileStepLayout = ({
  title,
  subtitle,
  buttonText = "다음",
  buttonEnabled = false,
  onNext,
  hideBottomButton = false,
  showBack = true,
  onBack,
  step = 1,
  totalSteps = 3,
  children,
}: ProfileStepLayoutProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={KEYBOARD_AVOIDING_BEHAVIOR}
    >
      {/* 헤더: 뒤로가기 + 진행 상태 */}
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={onBack ?? (() => router.back())} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#202020" />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>
      <ProgressBar
        value={step}
        max={totalSteps}
        height={4}
        style={styles.progress}
      />

      {/* 제목 + 서브타이틀 */}
      <View style={styles.titleArea}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.content}>{children}</View>

      {!hideBottomButton && (
        <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 24 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              buttonEnabled
                ? styles.nextButtonActive
                : styles.nextButtonDisabled,
              pressed && buttonEnabled && styles.nextButtonPressed,
            ]}
            onPress={buttonEnabled ? onNext : undefined}
            disabled={!buttonEnabled}
          >
            <Text
              style={[
                styles.nextButtonText,
                buttonEnabled
                  ? styles.nextButtonTextActive
                  : styles.nextButtonTextDisabled,
              ]}
            >
              {buttonText}
            </Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  progress: {
    paddingHorizontal: 20,
    height: 12,
  },
  titleArea: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#202020",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#636970",
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bottomArea: {
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  nextButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonActive: {
    backgroundColor: "#FF3E70",
  },
  nextButtonDisabled: {
    backgroundColor: "#E9ECED",
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  nextButtonTextActive: {
    color: "#FFFFFF",
  },
  nextButtonTextDisabled: {
    color: "#636970",
  },
});

export default ProfileStepLayout;
