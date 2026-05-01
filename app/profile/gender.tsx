import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ProfileStepLayout from "@/components/profile/ProfileStepLayout";

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
  const [selected, setSelected] = useState<Gender>(null);

  const handleNext = () => {
    router.push("/profile/photo" as any);
  };

  return (
    <ProfileStepLayout
      title="성별을 선택해주세요."
      subtitle="추후에 수정이 불가능해요!"
      buttonEnabled={selected !== null}
      onNext={handleNext}
    >
      <View style={styles.optionsContainer}>
        {GENDERS.map((gender) => {
          const isActive = selected === gender.id;
          return (
            <Pressable
              key={gender.id}
              style={[
                styles.genderCircle,
                isActive && styles.genderCircleActive,
              ]}
              onPress={() => setSelected(gender.id)}
            >
              <Ionicons
                name={gender.icon}
                size={48}
                color={isActive ? "#FF3E70" : "#D1D5DB"}
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
    gap: 32,
  },
  genderCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  genderCircleActive: {
    borderColor: "#FF3E70",
    backgroundColor: "#FFFFFF",
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  genderLabelActive: {
    color: "#FF3E70",
  },
});
