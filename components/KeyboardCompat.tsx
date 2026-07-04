import React from "react";
import { KeyboardAvoidingView as RNKeyboardAvoidingView } from "react-native";
import type { KeyboardAvoidingViewProps } from "react-native";

// react-native-keyboard-controller는 네이티브 모듈이 없는 빌드(Expo Go,
// 라이브러리 추가 이전의 dev client)에서는 import 시점에 throw되므로,
// require를 try/catch로 감싸 사용 가능 여부에 따라 폴백한다.
// 폴백 시에는 RN 기본 KeyboardAvoidingView로 동작한다(키보드 애니메이션 동기화 미적용).
type KeyboardControllerModule = typeof import("react-native-keyboard-controller");

let keyboardController: KeyboardControllerModule | null = null;
try {
  keyboardController = require("react-native-keyboard-controller");
} catch {
  keyboardController = null;
}

export const isKeyboardControllerAvailable = keyboardController != null;

export const KeyboardProvider: React.ComponentType<{
  children: React.ReactNode;
}> = keyboardController
  ? keyboardController.KeyboardProvider
  : ({ children }) => <>{children}</>;

export const KeyboardAvoidingView: React.ComponentType<KeyboardAvoidingViewProps> =
  keyboardController
    ? (keyboardController.KeyboardAvoidingView as unknown as React.ComponentType<KeyboardAvoidingViewProps>)
    : RNKeyboardAvoidingView;
