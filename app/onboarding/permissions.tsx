import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PermissionItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const PERMISSIONS: PermissionItem[] = [
  {
    id: "camera",
    icon: "camera-outline",
    title: "카메라 (필수)",
    description: "사진으로 일정을 간편하게 등록",
  },
  {
    id: "mic",
    icon: "mic-outline",
    title: "마이크 (필수)",
    description: "녹음한 음성은 매칭에만 사용돼요",
  },
  {
    id: "notification",
    icon: "notifications-outline",
    title: "알림 (필수)",
    description: "새 인연 소식을 받아보세요.",
  },
];

/**
 * 앱 접근 권한 안내 화면
 * - 카메라, 마이크, 알림 권한 카드
 * - 전체 선택 시 확인 버튼 활성화
 */
export default function PermissionsScreen() {
  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const isAllSelected = useMemo(
    () => PERMISSIONS.every((p) => selected[p.id]),
    [selected],
  );

  const toggleItem = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirm = () => {
    // TODO: 실제 권한 요청 로직 (expo-camera, expo-av, expo-notifications)
    // 권한 허용 후 프로필 생성 페이지로 이동
    // router.replace('/profile/create');
    console.log("권한 허용 완료 → 프로필 생성으로 이동");
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* 헤더 */}
      <View style={styles.headerArea}>
        <Text style={styles.title}>앱 접근 권한 안내</Text>
        <Text style={styles.subtitle}>
          원활한 서비스 이용을 위해{"\n"}다음 접근 권한 허용이 필요합니다.
        </Text>
      </View>

      {/* 권한 카드 목록 */}
      <View style={styles.cardList}>
        {PERMISSIONS.map((item) => {
          const isActive = !!selected[item.id];
          return (
            <Pressable
              key={item.id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => toggleItem(item.id)}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    isActive && styles.iconCircleActive,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={isActive ? "#FF3E70" : "#6B7280"}
                  />
                </View>
                <View style={styles.cardTextGroup}>
                  <Text
                    style={[
                      styles.cardTitle,
                      isActive && styles.cardTitleActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
              </View>
              {isActive && (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark-circle" size={26} color="#FF3E70" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* 하단 영역 */}
      <View style={styles.bottomArea}>
        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            isAllSelected ? styles.confirmActive : styles.confirmDisabled,
            pressed && isAllSelected && styles.confirmPressed,
          ]}
          onPress={isAllSelected ? handleConfirm : undefined}
          disabled={!isAllSelected}
        >
          <Text
            style={[
              styles.confirmText,
              isAllSelected
                ? styles.confirmTextActive
                : styles.confirmTextDisabled,
            ]}
          >
            확인
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerArea: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
  },
  cardList: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  cardActive: {
    borderColor: "#FF3E70",
    backgroundColor: "#FFF1F4",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconCircleActive: {
    backgroundColor: "#FFE0E8",
  },
  cardTextGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardTitleActive: {
    color: "#1F2937",
  },
  cardDescription: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  checkCircle: {
    marginLeft: 8,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  confirmButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmActive: {
    backgroundColor: "#FF3E70",
  },
  confirmDisabled: {
    backgroundColor: "#E5E7EB",
  },
  confirmPressed: {
    opacity: 0.85,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmTextActive: {
    color: "#FFFFFF",
  },
  confirmTextDisabled: {
    color: "#9CA3AF",
  },
});
