import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import ProfileStepLayout from "@/components/profile/ProfileStepLayout";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

type Gender = "male" | "female" | null;

interface GenderOption {
  id: Gender;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const GENDERS: GenderOption[] = [
  { id: "male", icon: "male", label: "남성" },
  { id: "female", icon: "female", label: "여성" },
];

/**
 * 성별 선택 화면
 * - 남성/여성 원형 버튼
 * - 선택 시 핑크 보더 + 핑크 아이콘/텍스트
 */
export default function GenderScreen() {
  const router = useRouter();
  // ponytail: 원 2개(150) + gap 48 = 348이라 작은 높이에서 "다음" 버튼을 덮는다.
  const { height } = useWindowDimensions();
  const isCompactHeight = height < 750;
  const circleSize = isCompactHeight ? 116 : 150;
  const draftGender = useOnboardingDraftStore((state) => state.gender);
  const setDraftGender = useOnboardingDraftStore((state) => state.setGender);
  const [selected, setSelected] = useState<Gender>(
    draftGender === "M" ? "male" : draftGender === "F" ? "female" : null,
  );

  const handleNext = () => {
    if (selected) {
      setDraftGender(selected === "male" ? "M" : "F");
    }
    router.push({
      pathname: "/profile/location",
      params: { mode: "onboarding" },
    } as any);
  };

  return (
    <ProfileStepLayout
      title="성별을 선택해주세요."
      subtitle="추후에 변경이 불가능해요."
      step={3}
      totalSteps={5}
      buttonEnabled={selected !== null}
      onNext={handleNext}
    >
      <View
        style={[
          styles.optionsContainer,
          isCompactHeight && styles.optionsContainerCompact,
        ]}
      >
        {GENDERS.map((gender) => {
          const isActive = selected === gender.id;
          return (
            <Pressable
              key={gender.id}
              style={[
                styles.genderCircle,
                {
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                },
                isActive && styles.genderCircleActive,
              ]}
              onPress={() => setSelected(gender.id)}
            >
              <Ionicons
                name={gender.icon}
                size={48}
                color={isActive ? "#FC3367" : "#111111"}
              />
              <Text
                style={[
                  styles.genderLabel,
                  isActive && styles.genderLabelActive,
                ]}
              >
                {gender.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ProfileStepLayout>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 48,
  },
  optionsContainerCompact: {
    gap: 20,
  },
  genderCircle: {
    borderWidth: 2,
    borderColor: "#DEE3E5",
    backgroundColor: "#F8FAFB",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  genderCircleActive: {
    borderColor: "#FC3367",
    backgroundColor: "#FFE2E9",
  },
  genderLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111111",
  },
  genderLabelActive: {
    color: "#FC3367",
    fontWeight: "700",
  },
});
