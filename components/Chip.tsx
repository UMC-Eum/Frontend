import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

// Chip 컴포넌트의 시각적 형태 테마 (배경색 및 테두리 유무)
export type ChipVariant = "solid" | "outline" | "outlineActive" | "ghost";
// Chip 컴포넌트의 형태 (완전 둥근 형태 vs 모서리만 살짝 둥근 사각형)
export type ChipShape = "pill" | "rect";
// Chip 컴포넌트의 크기
export type ChipSize = "medium" | "small";

interface ChipProps {
  label: string; // 칩 내부에 들어갈 텍스트
  variant?: ChipVariant; // 칩의 색상 테마 (기본값: outline)
  shape?: ChipShape; // 칩의 외곽 형태 (기본값: pill)
  size?: ChipSize; // 칩의 크기 (기본값: medium)
  onPress?: () => void; // 칩을 터치했을 때 실행될 함수
  style?: ViewStyle; // 컨테이너(가장 바깥 View)에 추가로 적용할 커스텀 스타일
  textStyle?: TextStyle; // 텍스트에 추가로 적용할 커스텀 스타일
}

/**
 * 상태나 필터를 표시할 때 사용하는 칩(Chip) 컴포넌트입니다.
 * 웹의 <button> 태그 대신 모바일 터치 피드백을 위해 TouchableOpacity를 사용합니다.
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  variant = "outline",
  shape = "pill",
  size = "medium",
  onPress,
  style,
  textStyle,
}) => {
  // 형태(shape) 및 크기(size)에 따른 조합 스타일을 결정합니다.
  const shapeSizeStyle =
    shape === "rect"
      ? size === "small" //사각형
        ? styles.rectSmallSize
        : styles.rectMediumSize
      : size === "small" // 원
        ? styles.pillSmallSize
        : styles.pillMediumSize;

  return (
    <TouchableOpacity
      // 배열 문법을 활용하여 여러 개의 스타일을 겹쳐서 적용합니다. (우측에 있을수록 덮어씌워짐)
      style={[
        styles.container,
        shape === "rect" ? styles.rectShape : styles.pillShape,
        shapeSizeStyle,
        VARIANT_STYLES[variant] || VARIANT_STYLES.outline,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7} // 살짝 터치했을 때 70% 정도로 투명해지며 터치감을 줍니다.
      disabled={!onPress} // onPress 함수가 없으면 터치를 비활성화합니다.
    >
      <Text
        style={[
          styles.text,
          shape === "rect"
            ? size === "small"
              ? styles.smText
              : styles.mdText
            : size === "small"
              ? styles.xsText
              : styles.smText,
          VARIANT_TEXT_STYLES[variant] || VARIANT_TEXT_STYLES.outline,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center", // (Flex) 세로 중앙 정렬
    justifyContent: "center", // (Flex) 가로 중앙 정렬
    alignSelf: "flex-start", // 부모의 너비를 100% 채우지 않고 자기 콘텐츠 크기만큼만 차지하게 합니다.
  },
  pillShape: {
    borderRadius: 20, // 완전 둥글게 표현 (알약 모양)
  },
  rectShape: {
    borderRadius: 6, // 네모난 칩을 위해 살짝만 둥글게 처리
  },
  rectMediumSize: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  rectSmallSize: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pillMediumSize: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillSmallSize: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  text: {
    fontWeight: "600", // React Native에서는 숫자를 ''(문자열)로 감싸서 굵기를 표현합니다.
  },
  smText: {
    fontSize: 14,
  },
  xsText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 16,
  },
  solid: {
    backgroundColor: "#FC3367",
    borderWidth: 1,
    borderColor: "#FC3367", // 사이즈 맞추기 위해서 보더 추가
  },
  solidText: { color: "#FFFFFF" },
  outline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE3E5",
  }, // 외곽선만 있는 기본 형태
  outlineText: { color: "#000000" },
  outlineActive: {
    backgroundColor: "#FFE3E7",
    borderWidth: 1,
    borderColor: "#FC3E70",
  },
  outlineActiveText: { color: "#FC3E70" },
  ghost: { backgroundColor: "transparent", paddingHorizontal: 0 }, // 배경과 외곽선 없는 순수 텍스트 형태 (여백 제거)
  ghostText: { color: "#FC3E70" },
});

// 테마(variant)별 스타일 매핑을 분리하여 긴 switch/case 문을 정리했습니다.
const VARIANT_STYLES: Record<string, any> = {
  solid: styles.solid,
  outline: styles.outline,
  outlineActive: styles.outlineActive,
  ghost: styles.ghost,
};

const VARIANT_TEXT_STYLES: Record<string, any> = {
  solid: styles.solidText,
  outline: styles.outlineText,
  outlineActive: styles.outlineActiveText,
  ghost: styles.ghostText,
};
