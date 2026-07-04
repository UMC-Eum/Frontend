import { useCallback, useEffect, useRef } from "react";
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native";

const DEFAULT_DURATION = 220;

export function useFastInputScroll(duration = DEFAULT_DURATION) {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(
    null,
  );

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  const scrollTo = useCallback(
    (y: number) => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      const targetY = Math.max(y, 0);
      const startY = scrollYRef.current;
      const distance = targetY - startY;
      const startTime = Date.now();

      const animate = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const nextY = startY + distance * easedProgress;

        scrollYRef.current = nextY;
        scrollViewRef.current?.scrollTo({ y: nextY, animated: false });

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
          return;
        }

        scrollYRef.current = targetY;
        frameRef.current = null;
      };

      frameRef.current = requestAnimationFrame(animate);
    },
    [duration],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollYRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  return {
    scrollViewRef,
    scrollTo,
    scrollEventThrottle: 16,
    onScroll: handleScroll,
  };
}
