import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

interface TextBoxProps extends TextInputProps {
  supportingText?: string;
  containerStyle?: ViewStyle;
  inputBoxStyle?: ViewStyle;
}

/**
 * 긴 문장 입력에 사용하는 Text-Box 컴포넌트입니다.
 * - 소개글처럼 여러 줄과 글자 수 제한이 필요한 영역에서 사용합니다.
 */
export default function TextBox({
  value,
  maxLength,
  supportingText,
  containerStyle,
  inputBoxStyle,
  style,
  ...props
}: TextBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const currentLength = String(value ?? "").length;
  const hasLimit = maxLength != null;
  const isOverLimit = hasLimit && currentLength > maxLength;
  const isActive = isFocused || isOverLimit;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.inputBox, isActive && styles.inputBoxActive, inputBoxStyle]}>
        <TextInput
          value={value}
          maxLength={maxLength}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#A6AFB6"
          style={[styles.input, style]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {(supportingText || hasLimit) && (
          <View style={styles.bottomRow}>
            {supportingText ? (
              <Text style={styles.supportingText}>{supportingText}</Text>
            ) : (
              <View />
            )}
            {hasLimit && (
              <Text style={[styles.counter, isOverLimit && styles.counterError]}>
                {currentLength}/{maxLength}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputBox: {
    minHeight: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  inputBoxActive: {
    borderColor: "#FC3367",
  },
  input: {
    minHeight: 54,
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    padding: 0,
  },
  bottomRow: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  supportingText: {
    color: "#FC3367",
    fontSize: 12,
    fontWeight: "500",
  },
  counter: {
    marginLeft: "auto",
    color: "#A6AFB6",
    fontSize: 12,
    fontWeight: "500",
  },
  counterError: {
    color: "#FC3367",
  },
});
