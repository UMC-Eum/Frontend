import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import ProfileStepLayout from "@/components/profile/ProfileStepLayout";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

const MIN_AGE = 50;
const MAX_AGE = 120;
const DEFAULT_AGE = 60;
const ITEM_HEIGHT = 58;
const VISIBLE_ITEMS = 7;
// ponytail: 작은 높이(iPad 호환 모드 등)에서는 보이는 항목 수만 줄인다.
// 스냅·오프셋 계산은 ITEM_HEIGHT만 쓰므로 영향받지 않는다.
const COMPACT_VISIBLE_ITEMS = 5;
const SELECTION_OFFSET = 24;

/**
 * 나이 선택 화면
 * - 스크롤 피커로 나이 선택
 * - 선택된 나이가 핑크색으로 하이라이트
 */
export default function AgeScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const visibleItems = height < 750 ? COMPACT_VISIBLE_ITEMS : VISIBLE_ITEMS;
  const pickerHeight = ITEM_HEIGHT * visibleItems;
  const pickerPadding = (pickerHeight - ITEM_HEIGHT) / 2;
  const draftAge = useOnboardingDraftStore((state) => state.age);
  const setDraftAge = useOnboardingDraftStore((state) => state.setAge);
  const initialAge = clampAge(draftAge ?? DEFAULT_AGE);
  const initialOffset = (initialAge - MIN_AGE) * ITEM_HEIGHT;
  const [selectedAge, setSelectedAge] = useState(initialAge);
  const selectedAgeRef = useRef(initialAge);
  const scrollY = useRef(new Animated.Value(initialOffset)).current;
  const scrollRef = useRef<ScrollView>(null);

  const ages = Array.from(
    { length: MAX_AGE - MIN_AGE + 1 },
    (_, i) => MIN_AGE + i,
  );

  const handleNext = () => {
    setDraftAge(selectedAge);
    router.push("/profile/gender" as any);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: initialOffset, animated: false });
    });
  }, [initialOffset]);

  const updateSelectedAgeFromOffset = (offset: number) => {
    const offsetY = clampOffset(offset, ages.length);
    const nextAge = MIN_AGE + Math.round(offsetY / ITEM_HEIGHT);

    if (selectedAgeRef.current === nextAge) return;

    selectedAgeRef.current = nextAge;
    setSelectedAge(nextAge);
  };

  const settleSelectedAge = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = clampOffset(event.nativeEvent.contentOffset.y, ages.length);
    const targetOffset = Math.round(offsetY / ITEM_HEIGHT) * ITEM_HEIGHT;

    updateSelectedAgeFromOffset(targetOffset);
    scrollRef.current?.scrollTo({ y: targetOffset, animated: true });
  };

  return (
    <ProfileStepLayout
      title="나이가 어떻게 되세요?"
      subtitle="만나이로 알려주세요! 추후에 변경이 불가능해요."
      step={2}
      totalSteps={5}
      buttonEnabled
      onNext={handleNext}
    >
      <View style={styles.pickerContainer}>
        <Animated.ScrollView
          ref={scrollRef}
          style={[styles.pickerWindow, { height: pickerHeight }]}
          contentContainerStyle={{
            paddingTop: pickerPadding + SELECTION_OFFSET,
            paddingBottom: pickerPadding + SELECTION_OFFSET + ITEM_HEIGHT,
          }}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
          contentOffset={{ x: 0, y: initialOffset }}
          onMomentumScrollEnd={settleSelectedAge}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: true,
              listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                updateSelectedAgeFromOffset(event.nativeEvent.contentOffset.y);
              },
            },
          )}
        >
          {ages.map((age, index) => {
            const itemOffset = index * ITEM_HEIGHT;
            const inputRange = [
              itemOffset - ITEM_HEIGHT * 3,
              itemOffset - ITEM_HEIGHT * 2,
              itemOffset - ITEM_HEIGHT,
              itemOffset,
              itemOffset + ITEM_HEIGHT,
              itemOffset + ITEM_HEIGHT * 2,
              itemOffset + ITEM_HEIGHT * 3,
            ];
            const opacity = scrollY.interpolate({
              inputRange,
              outputRange: [0.3, 0.5, 1, 1, 1, 0.5, 0.3],
              extrapolate: "clamp",
            });
            const scale = scrollY.interpolate({
              inputRange,
              outputRange: [1, 1.25, 1.5, 1.9, 1.5, 1.25, 1],
              extrapolate: "clamp",
            });
            const isSelected = age === selectedAge;
            const isNear = Math.abs(age - selectedAge) === 1;

            return (
              <Animated.View
                key={age}
                style={[
                  styles.pickerItem,
                  isSelected && styles.pickerItemSelected,
                  {
                    opacity,
                  },
                ]}
              >
                <Animated.Text
                  style={[
                    styles.pickerText,
                    isSelected && styles.pickerTextSelected,
                    isNear && styles.pickerTextNear,
                    { transform: [{ scale }] },
                  ]}
                >
                  {age}
                </Animated.Text>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
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
    width: 160,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: 146,
    borderRadius: 18,
  },
  pickerItemSelected: {
    backgroundColor: "rgba(255, 226, 233, 0.65)",
  },
  pickerText: {
    fontSize: 32,
    fontWeight: "400",
    color: "#111111",
    lineHeight: ITEM_HEIGHT,
    textAlign: "center",
  },
  pickerTextSelected: {
    fontWeight: "700",
    color: "#FC3367",
  },
  pickerTextNear: {
    color: "#FC3367",
  },
});

function clampOffset(offset: number, itemCount: number) {
  return Math.max(0, Math.min(offset, (itemCount - 1) * ITEM_HEIGHT));
}

function clampAge(age: number) {
  return Math.max(MIN_AGE, Math.min(age, MAX_AGE));
}
