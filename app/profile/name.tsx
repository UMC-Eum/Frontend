import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ProfileStepLayout from "@/components/profile/ProfileStepLayout";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

// 한글만 허용하는 정규식 (자음/모음 단독 제외, 완성된 글자만)
const KOREAN_REGEX = /^[가-힣]+$/;

/**
 * 이름 입력 화면
 * - 한글 2자 이상 입력 시 "다음" 버튼 활성화
 * - 한글이 아니거나 2자 미만이면 에러 메시지 표시
 */
export default function NameScreen() {
  const router = useRouter();
  const draftNickname = useOnboardingDraftStore((state) => state.nickname);
  const setDraftNickname = useOnboardingDraftStore((state) => state.setNickname);
  const [name, setName] = useState(draftNickname);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const trimmedName = name.trim();

  const isKorean = KOREAN_REGEX.test(trimmedName);
  const isLongEnough = trimmedName.length >= 2;
  const isValid = isKorean && isLongEnough;

  // 입력이 있을 때만 에러 표시 (타이핑 중 실시간)
  const hasInput = trimmedName.length > 0;
  const showError = hasInput && !isValid;

  // 에러 메시지 분기
  const getErrorMessage = () => {
    if (!hasInput) return "";
    if (!isKorean) return "한글만 입력해주세요";
    if (!isLongEnough) return "이름은 2자 이상 작성해주세요";
    return "";
  };

  const handleNext = () => {
    inputRef.current?.blur();
    setDraftNickname(trimmedName);
    router.push("/profile/age" as any);
  };

  const handleClear = () => {
    setName("");
  };

  const handleOutsidePress = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  return (
    <>
      <ProfileStepLayout
        title="성함이 어떻게 되세요?"
        subtitle="실명도, 닉네임도 모두 괜찮아요."
        step={1}
        totalSteps={5}
        buttonEnabled={isValid}
        onNext={handleNext}
      >
        <View style={styles.formArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
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
              returnKeyType="done"
            />
            {name.length > 0 && (
              <Pressable style={styles.clearButton} onPress={handleClear}>
                <Ionicons name="close-circle" size={22} color="#FF3E70" />
              </Pressable>
            )}
          </View>
          {showError && (
            <Text style={styles.errorText}>{getErrorMessage()}</Text>
          )}
          <Pressable style={styles.dismissArea} onPress={handleOutsidePress} />
        </View>
      </ProfileStepLayout>
    </>
  );
}

const styles = StyleSheet.create({
  formArea: {
    flex: 1,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 62,
    borderWidth: 2,
    borderColor: "#DEE3E5",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingRight: 48,
    fontSize: 18,
    fontWeight: "500",
    color: "#202020",
    lineHeight: 23,
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
  dismissArea: {
    flex: 1,
  },
});
