import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";

import ProfileStepLayout from "@/components/profile/ProfileStepLayout";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

const MIN_AGE = 20;
const MAX_AGE = 80;
const DEFAULT_AGE = 32;
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

/**
 * 나이 선택 화면
 * - 스크롤 피커로 나이 선택
 * - 선택된 나이가 핑크색으로 하이라이트
 */
export default function AgeScreen() {
  const router = useRouter();
  const draftAge = useOnboardingDraftStore((state) => state.age);
  const setDraftAge = useOnboardingDraftStore((state) => state.setAge);
  const initialAge = draftAge ?? DEFAULT_AGE;
  const initialOffset = (initialAge - MIN_AGE) * ITEM_HEIGHT;
  const [selectedAge, setSelectedAge] = useState(initialAge);
  const scrollY = useRef(new Animated.Value(initialOffset)).current;
  const lastOffset = useRef(initialOffset);

  const ages = Array.from(
    { length: MAX_AGE - MIN_AGE + 1 },
    (_, i) => MIN_AGE + i,
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        scrollY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const newOffset = lastOffset.current - gestureState.dy;
        scrollY.setValue(newOffset);
      },
      onPanResponderRelease: (_, gestureState) => {
        let newOffset = lastOffset.current - gestureState.dy;
        // 스냅: 가장 가까운 아이템으로 정렬
        newOffset = Math.round(newOffset / ITEM_HEIGHT) * ITEM_HEIGHT;
        // 범위 제한
        newOffset = Math.max(
          0,
          Math.min(newOffset, (ages.length - 1) * ITEM_HEIGHT),
        );
        lastOffset.current = newOffset;

        Animated.spring(scrollY, {
          toValue: newOffset,
          useNativeDriver: false,
          tension: 80,
          friction: 12,
        }).start();

        const newAge = MIN_AGE + Math.round(newOffset / ITEM_HEIGHT);
        setSelectedAge(newAge);
      },
    }),
  ).current;

  const handleNext = () => {
    setDraftAge(selectedAge);
    router.push("/profile/gender" as any);
  };

  return (
    <ProfileStepLayout
      title="나이가 어떻게 되세요?"
      subtitle="만나이로 알려주세요 추후에 수정이 불가능해요!"
      step={2}
      buttonEnabled
      onNext={handleNext}
    >
      <View style={styles.pickerContainer}>
        {/* 선택 하이라이트 영역 */}
        <View style={styles.highlightBar} />

        <View style={styles.pickerWindow} {...panResponder.panHandlers}>
          {ages.map((age, index) => {
            const inputRange = [
              (index - 2) * ITEM_HEIGHT,
              (index - 1) * ITEM_HEIGHT,
              index * ITEM_HEIGHT,
              (index + 1) * ITEM_HEIGHT,
              (index + 2) * ITEM_HEIGHT,
            ];

            const opacity = scrollY.interpolate({
              inputRange,
              outputRange: [0.3, 0.5, 1, 0.5, 0.3],
              extrapolate: "clamp",
            });

            const scale = scrollY.interpolate({
              inputRange,
              outputRange: [0.8, 0.9, 1.2, 0.9, 0.8],
              extrapolate: "clamp",
            });

            const translateY = scrollY.interpolate({
              inputRange: [0, (ages.length - 1) * ITEM_HEIGHT],
              outputRange: [
                index * ITEM_HEIGHT +
                  (VISIBLE_ITEMS * ITEM_HEIGHT) / 2 -
                  ITEM_HEIGHT / 2,
                index * ITEM_HEIGHT -
                  (ages.length - 1) * ITEM_HEIGHT +
                  (VISIBLE_ITEMS * ITEM_HEIGHT) / 2 -
                  ITEM_HEIGHT / 2,
              ],
              extrapolate: "clamp",
            });

            const isSelected = age === selectedAge;

            return (
              <Animated.View
                key={age}
                style={[
                  styles.pickerItem,
                  {
                    opacity,
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pickerText,
                    isSelected && styles.pickerTextSelected,
                  ]}
                >
                  {age}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </ProfileStepLayout>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  pickerWindow: {
    height: VISIBLE_ITEMS * ITEM_HEIGHT,
    width: 120,
    overflow: "hidden",
  },
  highlightBar: {
    position: "absolute",
    width: 120,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(255, 62, 112, 0.1)",
    borderRadius: 14,
    zIndex: 1,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    width: "100%",
  },
  pickerText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#A6AFB6",
  },
  pickerTextSelected: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FF3E70",
  },
});
