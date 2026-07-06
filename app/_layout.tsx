import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
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
import { useStableQueryClient } from "@/hooks/use-query-client";
import { useAuthStore } from "@/stores/authStore";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const queryClient = useStableQueryClient();

  usePushNotifications();

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
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ animation: "none" }}>
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="ideal-recording" options={{ headerShown: false }} />
              <Stack.Screen name="profile-detail" options={{ headerShown: false }} />
              <Stack.Screen name="payment" options={{ headerShown: false }} />
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
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
              <Stack.Screen name="test" options={{ headerShown: false }} />
              <Stack.Screen name="chat" options={{ headerShown: false }} />
            </Stack>
            <GlobalUiOverlay />
            <StatusBar style="auto" />
          </ThemeProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
