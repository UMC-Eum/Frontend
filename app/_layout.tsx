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

import { clearAccessToken, markAuthInitialized, refreshAccessToken } from "@/api/axiosInstance";
import GlobalUiOverlay from "@/components/GlobalUiOverlay";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useStableQueryClient } from "@/hooks/use-query-client";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const queryClient = useStableQueryClient();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        clearAccessToken();
        if (__DEV__) {
          console.log("[Auth Init] refresh skipped or failed:", error);
        }
      } finally {
        markAuthInitialized();
      }
    };

    void initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          {__DEV__ ? (
            <Stack.Screen name="tabs" options={{ headerShown: false }} />
          ) : null}
          <Stack.Screen name="ideal-recording" options={{ headerShown: false }} />
          <Stack.Screen name="profile-detail" options={{ headerShown: false }} />
          <Stack.Screen name="payment" options={{ headerShown: false }} />
          <Stack.Screen name="club" options={{ headerShown: false }} />
          <Stack.Screen name="meeting-create" options={{ headerShown: false }} />
          <Stack.Screen
            name="meeting-create-complete"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
  );
}
