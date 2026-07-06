import { useEffect } from "react";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const SKELETON_COLOR = "#EEF1F4";

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  circle?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

// API 응답 전 실제 콘텐츠와 같은 크기의 자리를 잡아 레이아웃 점프를 막는 로딩 placeholder입니다.
export default function Skeleton({
  width,
  height,
  radius = 8,
  circle = false,
  color = SKELETON_COLOR,
  style,
}: SkeletonProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0.45, { duration: 720, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    return () => cancelAnimation(pulse);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: circle ? 999 : radius,
          backgroundColor: color,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}
