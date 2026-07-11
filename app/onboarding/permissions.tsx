import { Feather, Ionicons } from "@expo/vector-icons";
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/stores/authStore";

type PermissionId = "camera" | "mic" | "notification";
type PermissionState = "idle" | "requesting" | "granted" | "denied";

interface PermissionItem {
  id: PermissionId;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

const PERMISSIONS: PermissionItem[] = [
  {
    id: "camera",
    icon: "camera",
    title: "카메라 (선택)",
    description: "사진으로 일정을 간편하게 등록",
  },
  {
    id: "mic",
    icon: "mic",
    title: "마이크 (선택)",
    description: "녹음한 음성은 매칭에만 사용돼요",
  },
  {
    id: "notification",
    icon: "bell",
    title: "알림 (선택)",
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
        getNotificationPermissionsAsync(),
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
      const result = await requestNotificationPermissionsAsync();
      granted = result.granted;
    }

    const nextState = toRequestedPermissionState(granted);
    setPermissions((prev) => ({ ...prev, [id]: nextState }));

    return nextState;
  };

  // Apple 심사 가이드라인 5.1.1: 권한을 거부해도 가입/이용이 가능해야 한다.
  // 거부된 권한은 해당 기능 사용 시점에 다시 안내한다.
  const handleConfirm = async () => {
    for (const item of PERMISSIONS) {
      if (permissions[item.id] !== "granted") {
        await requestPermission(item.id);
      }
    }

    router.replace((onboardingRequired ? "/profile/name" : "/(tabs)") as any);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={26} color="#A6AFB6" />
        </Pressable>
        <Text style={styles.headerTitle}>앱 접근 권한 안내</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.headerArea}>
        <Text style={styles.subtitle}>
          권한을 허용하면{"\n"}서비스를 더 편리하게 이용할 수 있어요.
        </Text>
      </View>

      {/* 권한 카드 목록 */}
      <View style={styles.cardList}>
        {PERMISSIONS.map((item) => {
          const permissionState = permissions[item.id];
          const isActive = permissionState === "granted";
          const isRequesting = permissionState === "requesting";

          return (
            <Pressable
              key={item.id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => requestPermission(item.id)}
              disabled={isRequesting}
            >
              <View style={styles.cardLeft}>
                <Feather name={item.icon} size={29} color="#202020" />
                <View style={styles.cardTextGroup}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
              </View>
              {isActive && (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark-circle" size={28} color="#FF3E70" />
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
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: "#202020",
    lineHeight: 30,
    textAlign: "center",
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },
  headerArea: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 58,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#202020",
    lineHeight: 23,
    textAlign: "center",
  },
  cardList: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 87,
    paddingHorizontal: 19,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#202020",
    backgroundColor: "#FFFFFF",
  },
  // 권한이 허용된 카드만 핑크로 강조한다.
  cardActive: {
    borderColor: "#FC3367",
    backgroundColor: "#FFE2E9",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 18,
  },
  cardTextGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#202020",
    lineHeight: 22,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: "#636970",
    lineHeight: 20,
  },
  checkCircle: {
    marginLeft: 8,
  },
  bottomArea: {
    paddingHorizontal: 20,
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
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
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

async function getNotificationPermissionsAsync() {
  const Notifications = await import("expo-notifications");

  return Notifications.getPermissionsAsync();
}

async function requestNotificationPermissionsAsync() {
  const Notifications = await import("expo-notifications");

  return Notifications.requestPermissionsAsync();
}
