import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import * as Application from "expo-application";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { PermissionsAndroid, Platform } from "react-native";

import {
  readNotification,
  registerPushToken,
  unregisterPushToken,
} from "@/api/notifications/notificationsApi";

type MessagingFactory = typeof import("@react-native-firebase/messaging").default;
type MessagingModule = { default?: MessagingFactory } & MessagingFactory;
type Unsubscribe = () => void;

let cachedMessaging: MessagingFactory | null | undefined;

function getMessaging(): MessagingFactory | null {
  if (cachedMessaging !== undefined) return cachedMessaging;

  try {
    const module = require("@react-native-firebase/messaging") as MessagingModule;
    cachedMessaging = module.default ?? module;
  } catch {
    cachedMessaging = null;
  }

  return cachedMessaging;
}

// 포그라운드에서도 알림 배너/목록/소리를 표시한다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 백그라운드 데이터 메시지 핸들러는 앱 로드 시점(컴포넌트 밖)에 등록해야 한다.
// ponytail: 네이티브 Firebase 없는 환경(Expo Go 등)에서는 throw → 무시
try {
  getMessaging()?.().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("[push] 백그라운드 메시지:", remoteMessage.messageId);
  });
} catch {
  // no-op
}

export type DeviceInfo = { deviceId: string; appVersion: string };

// push-tokens 등록에 필요한 디바이스 식별자/앱 버전.
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const appVersion = Application.nativeApplicationVersion ?? "1.0.0";
  const deviceId =
    Platform.OS === "ios"
      ? ((await Application.getIosIdForVendorAsync()) ?? "unknown-ios")
      : (Application.getAndroidId() ?? "unknown-android");
  return { deviceId, appVersion };
}

async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android" || Number(Platform.Version) < 33) return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

// 권한 요청 + (Android)채널 설정 후 FCM 등록 토큰을 반환한다. 실패/거부 시 null.
// ponytail: 실기기 development build에서만 동작 — Expo Go/시뮬레이터는 토큰 못 받음
export async function getFcmToken(): Promise<string | null> {
  const messaging = getMessaging();
  if (!messaging) return null;

  if (Platform.OS === "android") {
    // Android는 채널이 없으면 알림이 아예 안 뜬다.
    await Notifications.setNotificationChannelAsync("default", {
      name: "기본",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  let granted = await requestAndroidNotificationPermission();
  if (Platform.OS === "ios") {
    const authStatus = await messaging().requestPermission();
    granted =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  }
  if (!granted) {
    console.log("[push] 알림 권한 거부됨");
    return null;
  }

  try {
    const token = await messaging().getToken();
    console.log("[push] FCM token =", token);
    return token;
  } catch (error) {
    console.log("[push] FCM 토큰 획득 실패:", error);
    return null;
  }
}

export function onForegroundMessage(
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): Unsubscribe | null {
  return getMessaging()?.().onMessage(handler) ?? null;
}

export function onNotificationOpened(
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): Unsubscribe | null {
  return getMessaging()?.().onNotificationOpenedApp(handler) ?? null;
}

export async function getInitialPushNotification(): Promise<
  FirebaseMessagingTypes.RemoteMessage | null
> {
  return (await getMessaging()?.().getInitialNotification()) ?? null;
}

export function onPushTokenRefresh(handler: () => void): Unsubscribe | null {
  return getMessaging()?.().onTokenRefresh(handler) ?? null;
}

// iOS는 앱이 포그라운드일 때 FCM 알림을 자동으로 안 띄운다 → 로컬 알림으로 표시.
export async function presentForegroundMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const notification = message.notification;
  if (!notification) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title ?? "",
      body: notification.body ?? "",
      data: message.data ?? {},
    },
    trigger: null,
  });
}

export type PushRoute = { pathname: string; params: Record<string, string> };

// FCM data 값은 전부 string으로 올 수 있어, 양의 정수로 검증된 값만 라우트 param으로 쓴다.
function toId(value: unknown): string | null {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? String(num) : null;
}

// FCM payload.data → 이동할 라우트. 목적지를 못 만들면 null(호출부에서 알림함 fallback).
export function getRouteFromPushData(
  data: Record<string, unknown> | undefined,
): PushRoute | null {
  if (!data) return null;

  const type = String(data.type ?? "");
  const chatRoomId = toId(data.chatRoomId);
  const senderUserId = toId(data.senderUserId);
  const clubId = toId(data.clubId);
  const articleId = toId(data.articleId);
  const heartId = toId(data.heartId);

  if (type === "CHAT" && chatRoomId) {
    return { pathname: "/chat/[id]", params: { id: chatRoomId } };
  }
  if (type === "HEART" && senderUserId) {
    return {
      pathname: "/profile-detail",
      params: { userId: senderUserId, ...(heartId ? { heartId } : {}) },
    };
  }
  if ((type === "ARTICLE" || type === "COMMENT") && clubId && articleId) {
    return {
      pathname: "/club/post-detail",
      params: { clubId, postId: articleId },
    };
  }
  if (type === "CLUB" && clubId) {
    // 승인/거절(status)·동호회 신고(reportCount)는 상세로, 그 외(가입 신청)는 멤버 관리로.
    const toDetail = data.status != null || data.reportCount != null;
    return {
      pathname: toDetail ? "/club/detail" : "/club/manage-members",
      params: { clubId },
    };
  }
  // ponytail: CLUB 게시글 신고(clubId 없이 articleId만) 포함, 목적지 불명은 전부 알림함으로
  return null;
}

let lastOpenedKey = "";
let lastOpenedAt = 0;

// 알림 탭 공통 처리: notificationId 읽음 처리 + 라우팅.
// RNFB/expo-notifications 리스너가 같은 탭에 중복 발화할 수 있어 2초 dedupe.
export function openPushNotification(
  data: Record<string, unknown> | undefined,
): void {
  const key = JSON.stringify(data ?? {});
  const now = Date.now();
  if (key === lastOpenedKey && now - lastOpenedAt < 2000) return;
  lastOpenedKey = key;
  lastOpenedAt = now;

  const notificationId = toId(data?.notificationId);
  if (notificationId) {
    void readNotification(notificationId).catch(() => {});
  }

  const route = getRouteFromPushData(data);
  if (route) {
    router.push({ pathname: route.pathname, params: route.params } as never);
  } else {
    router.push("/notifications" as never);
  }
}

// 로그인/알림 ON/토큰 갱신 시: 현재 FCM 토큰을 서버에 등록·갱신한다.
export async function syncPushTokenToServer(): Promise<void> {
  const token = await getFcmToken();
  if (!token) return;

  const { deviceId, appVersion } = await getDeviceInfo();
  const platform = Platform.OS === "ios" ? "IOS" : "ANDROID";
  try {
    await registerPushToken({ token, platform, deviceId, appVersion });
  } catch (error) {
    console.log("[push] 토큰 서버 등록 실패:", error);
  }
}

// 알림 OFF/로그아웃/탈퇴 시: 현재 디바이스 토큰을 서버에서 해제한다.
// 인증이 남아있을 때(clearAuth 이전) 호출해야 한다.
export async function removePushTokenFromServer(): Promise<void> {
  const messaging = getMessaging();
  if (!messaging) return;

  try {
    const token = await messaging().getToken();
    await unregisterPushToken(token);
  } catch (error) {
    console.log("[push] 토큰 서버 해제 실패:", error);
  }
}
