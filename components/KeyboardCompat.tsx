import React from "react";
import { KeyboardAvoidingView as RNKeyboardAvoidingView } from "react-native";
import type { KeyboardAvoidingViewProps } from "react-native";

// react-native-keyboard-controller는 새 아키텍처(Fabric)에서 앱 전체를 감싸는
// 네이티브 뷰(KeyboardControllerView)가 하단 냅바 터치를 가로채는 문제가 있어
// 비활성화한다(2026-07 확인). 라이브러리 업그레이드로 해결되면 true로 되돌릴 것.
// 비활성화 시 RN 기본 KeyboardAvoidingView로 동작한다(키보드 애니메이션 동기화 미적용).
const KEYBOARD_CONTROLLER_ENABLED = false;

// 활성화 상태여도 네이티브 모듈이 없는 빌드(Expo Go, 라이브러리 추가 이전의
// dev client)에서는 import 시점에 throw되므로 require를 try/catch로 감싸 폴백한다.
type KeyboardControllerModule = typeof import("react-native-keyboard-controller");

let keyboardController: KeyboardControllerModule | null = null;
if (KEYBOARD_CONTROLLER_ENABLED) {
  try {
    keyboardController = require("react-native-keyboard-controller");
  } catch {
    keyboardController = null;
  }
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
