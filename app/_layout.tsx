import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { KeyboardProvider } from "@/components/KeyboardCompat";

import { clearAccessToken, markAuthInitialized, refreshAccessToken } from "@/api/axiosInstance";
import { getMyProfile } from "@/api/users/usersApi";
import GlobalUiOverlay from "@/components/GlobalUiOverlay";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useNotificationBellSync } from "@/hooks/useNotificationBellSync";
import { usePrefetchAppData } from "@/hooks/usePrefetchAppData";
import { useStableQueryClient } from "@/hooks/use-query-client";
import { useAuthStore } from "@/stores/authStore";

// 운영 빌드에서는 콘솔 출력을 전역 차단한다(FCM 토큰·채팅 내용 등 민감정보 노출 방지).
// console.error는 TestFlight/네이티브 크래시 로그 분석을 위해 남긴다.
if (!__DEV__) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
}

export const unstable_settings = {
  anchor: "(tabs)",
};

// 쿼리 캐시를 디스크에 보관해 앱 재시작 직후에도 마지막 데이터가 즉시 뜬다.
// (이미지는 expo-image가 자체 디스크 캐시로 이미 보관 중)
// maxAge(1시간)가 지난 캐시는 복원하지 않고, 복원된 stale 데이터는 백그라운드에서 자동 갱신된다.
const queryPersister = createAsyncStoragePersister({ storage: AsyncStorage });
const QUERY_PERSIST_MAX_AGE_MS = 60 * 60_000;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const queryClient = useStableQueryClient();

  usePushNotifications(queryClient);
  useNotificationBellSync(queryClient);
  usePrefetchAppData(queryClient);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshAccessToken();
      } catch {
        clearAccessToken();
        return;
      } finally {
        markAuthInitialized();
      }

      // user는 로그인 응답에서만 채워지므로 앱 재시작 시 내 정보로 복원한다
      try {
        const profile = await getMyProfile();
        useAuthStore.getState().setUser({
          userId: profile.userId,
          nickname: profile.nickname,
        });
      } catch {
        // 온보딩 미완료 등으로 실패할 수 있음 — 로그인 상태는 유지
      }
    };

    void initializeAuth();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: queryPersister,
            maxAge: QUERY_PERSIST_MAX_AGE_MS,
            buster: "v1",
          }}
        >
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ animation: "none" }}>
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="ideal-recording" options={{ headerShown: false }} />
              <Stack.Screen name="profile-detail" options={{ headerShown: false }} />
              <Stack.Screen name="club" options={{ headerShown: false }} />
              <Stack.Screen name="meeting-create" options={{ headerShown: false }} />
              <Stack.Screen
                name="meeting-create-complete"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="meeting-manage" options={{ headerShown: false }} />
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="notifications"
                options={{ headerShown: false, animation: "slide_from_right" }}
              />
              <Stack.Screen name="search" options={{ headerShown: false }} />
              <Stack.Screen name="chat" options={{ headerShown: false }} />
            </Stack>
            <GlobalUiOverlay />
            <StatusBar style="auto" />
          </ThemeProvider>
        </PersistQueryClientProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
