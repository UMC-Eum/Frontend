import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  /** 뒤로가기 표시 여부 */
  showBack?: boolean;
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
  showBack = true,
  children,
}: ProfileStepLayoutProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더: 뒤로가기 */}
      {showBack && (
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color="#1F2937" />
          </Pressable>
        </View>
      )}

      {/* 제목 + 서브타이틀 */}
      <View style={styles.titleArea}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.content}>{children}</View>

      {/* 하단 버튼 */}
      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            buttonEnabled ? styles.nextButtonActive : styles.nextButtonDisabled,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  titleArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  bottomArea: {
    paddingHorizontal: 24,
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
    backgroundColor: "#E5E7EB",
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  nextButtonTextActive: {
    color: "#FFFFFF",
  },
  nextButtonTextDisabled: {
    color: "#9CA3AF",
  },
});

export default ProfileStepLayout;
