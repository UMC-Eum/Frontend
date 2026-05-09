import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CtaProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

/**
 * 화면 하단에 고정해서 사용하는 기본 CTA 버튼입니다.
 * - 폼 완성 여부에 따라 disabled 상태와 색상이 함께 바뀝니다.
 */
export default function Cta({
  label,
  onPress,
  disabled = false,
  containerStyle,
}: CtaProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 16 },
        containerStyle,
      ]}
    >
      <Pressable
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
  },
  button: {
    height: 56,
    borderRadius: 10,
    backgroundColor: "#FC3367",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#E9EEF1",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  labelDisabled: {
    color: "#6B7280",
  },
});
