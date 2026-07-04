import type { KeyboardAvoidingViewProps } from "react-native";
import { Platform } from "react-native";

export const KEYBOARD_AVOIDING_BEHAVIOR: KeyboardAvoidingViewProps["behavior"] =
  Platform.select({
    ios: "padding",
    android: "height",
    default: undefined,
  });

export const KEYBOARD_VERTICAL_OFFSET = 0;
