import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import ProfileStepLayout from "@/components/profile/ProfileStepLayout";

// 한글만 허용하는 정규식 (자음/모음 단독 제외, 완성된 글자만)
const KOREAN_REGEX = /^[가-힣]+$/;

/**
 * 이름 입력 화면
 * - 한글 2자 이상 입력 시 "다음" 버튼 활성화
 * - 한글이 아니거나 2자 미만이면 에러 메시지 표시
 */
export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const isKorean = KOREAN_REGEX.test(name);
  const isLongEnough = name.length >= 2;
  const isValid = isKorean && isLongEnough;

  // 입력이 있을 때만 에러 표시 (타이핑 중 실시간)
  const hasInput = name.length > 0;
  const showError = hasInput && !isValid;

  // 에러 메시지 분기
  const getErrorMessage = () => {
    if (!hasInput) return "";
    if (!isKorean) return "한글만 입력해주세요";
    if (!isLongEnough) return "이름은 2자 이상 작성해주세요";
    return "";
  };

  const handleNext = () => {
    router.push("/profile/age" as any);
  };

  const handleClear = () => {
    setName("");
  };

  return (
    <ProfileStepLayout
      title="성함이 어떻게 되세요?"
      subtitle="실명도, 닉네임도 모두 괜찮아요."
      buttonEnabled={isValid}
      onNext={handleNext}
    >
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            isFocused && !showError && styles.inputFocused,
            showError && styles.inputError,
          ]}
          placeholder="이름을 입력해주세요"
          placeholderTextColor="#D1D5DB"
          value={name}
          onChangeText={setName}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={10}
          autoFocus
        />
        {name.length > 0 && (
          <Pressable style={styles.clearButton} onPress={handleClear}>
            <Ionicons name="close-circle" size={22} color="#FF3E70" />
          </Pressable>
        )}
      </View>
      {showError && <Text style={styles.errorText}>{getErrorMessage()}</Text>}
    </ProfileStepLayout>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 44,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  inputFocused: {
    borderColor: "#FF3E70",
  },
  inputError: {
    borderColor: "#FF3E70",
  },
  clearButton: {
    position: "absolute",
    right: 14,
  },
  errorText: {
    fontSize: 13,
    color: "#FF3E70",
    marginTop: 8,
    paddingLeft: 4,
  },
});
