import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DISTRICTS, LocationItem, REGIONS } from "@/constants/locationData";
import {
  useMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/hooks/api/useUsers";

const ACCENT = "#FC3367";
const TEXT = "#202020";
const MUTED = "#A6AFB6";

export default function LocationEditScreen() {
  const router = useRouter();
  const myProfileQuery = useMyProfileQuery();
  const updateMyProfileMutation = useUpdateMyProfileMutation();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(
    null,
  );
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    string | null
  >(null);

  useEffect(() => {
    const areaCode = myProfileQuery.data?.area?.code;
    if (!areaCode) return;

    const currentRegion = findRegionByDistrictCode(areaCode);
    if (!currentRegion) return;

    setSelectedRegionCode(currentRegion.code);
    setSelectedDistrictCode(areaCode);
  }, [myProfileQuery.data?.area?.code]);

  const currentDistricts = useMemo(() => {
    if (!selectedRegionCode) return [];

    return DISTRICTS[selectedRegionCode] ?? [];
  }, [selectedRegionCode]);

  const isSubmitting = updateMyProfileMutation.isPending;
  const canSubmit =
    !isSubmitting && (step === 1 ? !!selectedRegionCode : !!selectedDistrictCode);

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/my" as never);
  };

  const handleRegionPress = (regionCode: string) => {
    setSelectedRegionCode(regionCode);
    setSelectedDistrictCode(null);
  };

  const handleNext = async () => {
    if (!canSubmit) return;

    if (step === 1) {
      setStep(2);
      return;
    }

    if (!selectedDistrictCode) return;

    try {
      await updateMyProfileMutation.mutateAsync({
        areaCode: selectedDistrictCode,
      });

      Alert.alert("저장 완료", "거주지가 수정되었습니다.", [
        { text: "확인", onPress: handleBackToMyPage },
      ]);
    } catch (error) {
      if (__DEV__) {
        console.log("Location edit submit error:", error);
      }
      Alert.alert("저장 실패", "지역을 다시 저장해주세요.");
    }
  };

  const handleBackToMyPage = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/my" as never);
  };

  if (myProfileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={ACCENT} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={MUTED} />
        </Pressable>
        <Text style={styles.headerTitle}>거주지 수정</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            현재 거주하는{"\n"}
            지역이 어디인가요?
          </Text>
          <Text style={styles.subtitle}>
            내 거주지와 가까운 분들과 더 잘 이어져요.
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <View style={styles.grid}>
            {(step === 1 ? REGIONS : currentDistricts).map((item) => (
              <LocationChip
                key={item.code}
                item={item}
                active={
                  step === 1
                    ? selectedRegionCode === item.code
                    : selectedDistrictCode === item.code
                }
                onPress={() =>
                  step === 1
                    ? handleRegionPress(item.code)
                    : setSelectedDistrictCode(item.code)
                }
              />
            ))}
          </View>
        </ScrollView>

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleNext}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>{step === 1 ? "다음" : "완료"}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function LocationChip({
  active,
  item,
  onPress,
}: {
  active: boolean;
  item: LocationItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {item.name}
      </Text>
    </Pressable>
  );
}

function findRegionByDistrictCode(districtCode: string) {
  return REGIONS.find((region) =>
    (DISTRICTS[region.code] ?? []).some((district) => district.code === districtCode),
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleBlock: {
    paddingTop: 8,
  },
  title: {
    color: TEXT,
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 8,
    color: "#7F878E",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  listContent: {
    paddingTop: 30,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    width: "48.7%",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8ECEF",
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
  },
  chipActive: {
    borderColor: ACCENT,
    backgroundColor: "#FFF0F4",
  },
  chipText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  chipTextActive: {
    color: ACCENT,
  },
  submitButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: ACCENT,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: "#DDE2E5",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
