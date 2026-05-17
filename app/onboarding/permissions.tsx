import { Ionicons } from "@expo/vector-icons";
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/stores/authStore";

type PermissionId = "camera" | "mic" | "notification";
type PermissionState = "idle" | "requesting" | "granted" | "denied";

interface PermissionItem {
  id: PermissionId;
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
 * - 카드 또는 확인 버튼으로 실제 시스템 권한을 요청합니다.
 */
export default function PermissionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onboardingRequired = useAuthStore((state) => state.onboardingRequired);

  const [permissions, setPermissions] = useState<
    Record<PermissionId, PermissionState>
  >({
    camera: "idle",
    mic: "idle",
    notification: "idle",
  });

  const isAllGranted = useMemo(
    () => PERMISSIONS.every((p) => permissions[p.id] === "granted"),
    [permissions],
  );

  useEffect(() => {
    const loadPermissionStatuses = async () => {
      const [camera, mic, notification] = await Promise.all([
        ImagePicker.getCameraPermissionsAsync(),
        getRecordingPermissionsAsync(),
        Notifications.getPermissionsAsync(),
      ]);

      setPermissions({
        camera: toInitialPermissionState(camera.granted),
        mic: toInitialPermissionState(mic.granted),
        notification: toInitialPermissionState(notification.granted),
      });
    };

    void loadPermissionStatuses();
  }, []);

  const requestPermission = async (id: PermissionId) => {
    setPermissions((prev) => ({ ...prev, [id]: "requesting" }));

    let granted = false;

    if (id === "camera") {
      const result = await ImagePicker.requestCameraPermissionsAsync();
      granted = result.granted;
    }

    if (id === "mic") {
      const result = await requestRecordingPermissionsAsync();
      granted = result.granted;
    }

    if (id === "notification") {
      const result = await Notifications.requestPermissionsAsync();
      granted = result.granted;
    }

    const nextState = toRequestedPermissionState(granted);
    setPermissions((prev) => ({ ...prev, [id]: nextState }));

    return nextState;
  };

  const handleConfirm = async () => {
    const nextPermissions = { ...permissions };

    for (const item of PERMISSIONS) {
      if (nextPermissions[item.id] !== "granted") {
        nextPermissions[item.id] = await requestPermission(item.id);
      }
    }

    const hasDeniedPermission = PERMISSIONS.some(
      (item) => nextPermissions[item.id] !== "granted",
    );

    if (hasDeniedPermission) {
      Alert.alert(
        "권한 허용이 필요해요",
        "원활한 서비스 이용을 위해 카메라, 마이크, 알림 권한을 허용해주세요.",
      );
      return;
    }

    router.replace((onboardingRequired ? "/profile/name" : "/home") as any);
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
          const permissionState = permissions[item.id];
          const isActive = permissionState === "granted";
          const isDenied = permissionState === "denied";
          const isRequesting = permissionState === "requesting";

          return (
            <Pressable
              key={item.id}
              style={[
                styles.card,
                isActive && styles.cardActive,
                isDenied && styles.cardDenied,
              ]}
              onPress={() => requestPermission(item.id)}
              disabled={isRequesting}
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
                  <Text
                    style={[
                      styles.permissionStateText,
                      isActive && styles.permissionGrantedText,
                      isDenied && styles.permissionDeniedText,
                    ]}
                  >
                    {getPermissionStateLabel(permissionState)}
                  </Text>
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
            isAllGranted ? styles.confirmActive : styles.confirmReady,
            pressed && styles.confirmPressed,
          ]}
          onPress={handleConfirm}
        >
          <Text
            style={[
              styles.confirmText,
              isAllGranted ? styles.confirmTextActive : styles.confirmTextReady,
            ]}
          >
            {isAllGranted ? "확인" : "권한 허용하기"}
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
  cardDenied: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
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
  permissionStateText: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  permissionGrantedText: {
    color: "#FF3E70",
  },
  permissionDeniedText: {
    color: "#DC2626",
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
  confirmReady: {
    backgroundColor: "#FF3E70",
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
  confirmTextReady: {
    color: "#FFFFFF",
  },
});

function toInitialPermissionState(granted: boolean): PermissionState {
  return granted ? "granted" : "idle";
}

function toRequestedPermissionState(granted: boolean): PermissionState {
  return granted ? "granted" : "denied";
}

function getPermissionStateLabel(state: PermissionState) {
  if (state === "granted") return "허용됨";
  if (state === "denied") return "거부됨";
  if (state === "requesting") return "요청 중";
  return "허용하기";
}
