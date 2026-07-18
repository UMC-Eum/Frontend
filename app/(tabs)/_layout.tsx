import { useQueryClient } from "@tanstack/react-query";
import { Redirect, Tabs } from "expo-router";
import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";

import { AppNavbar } from "@/components/AppNavbar";
import { queryKeys } from "@/hooks/api/queryKeys";
import { useAuthStore } from "@/stores/authStore";

// 홈 추천(recommendations)은 1시간 유지 정책이라 탭 전환 invalidate 대상에서 제외한다.
// (홈의 카운트다운 만료와 하트 전송 뮤테이션만 추천을 갱신한다)
const TAB_REFRESH_QUERY_KEYS = {
  index: [
    queryKeys.users.me(),
    queryKeys.notifications.all,
    queryKeys.club.all,
  ],
  heart: [queryKeys.socials.hearts.all()],
  chat: [queryKeys.chats.all],
  my: [
    queryKeys.users.me(),
    queryKeys.socials.hearts.all(),
    queryKeys.club.my(),
  ],
} as const;

// 같은 탭을 이 간격 안에 다시 눌러도 refetch하지 않는다. 강제 최신화는 각 화면의 pull-to-refresh가 담당.
const TAB_REFRESH_MIN_INTERVAL_MS = 30_000;

export default function TabLayout() {
  const queryClient = useQueryClient();
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingRequired = useAuthStore((state) => state.onboardingRequired);
  const lastTabRefreshAtRef = useRef<Partial<Record<string, number>>>({});

  if (!isAuthInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  if (onboardingRequired) {
    return <Redirect href="/onboarding/permissions" />;
  }

  return (
    <Tabs
      detachInactiveScreens={false}
      tabBar={(props) => {
        const currentRouteName = props.state.routes[props.state.index].name;

        return (
          <View pointerEvents="box-none" style={styles.tabBar}>
            <AppNavbar
              activeTabId={currentRouteName}
              onTabPress={(id) => {
                const lastRefreshAt = lastTabRefreshAtRef.current[id] ?? 0;
                if (
                  id !== currentRouteName &&
                  Date.now() - lastRefreshAt >= TAB_REFRESH_MIN_INTERVAL_MS
                ) {
                  lastTabRefreshAtRef.current[id] = Date.now();
                  TAB_REFRESH_QUERY_KEYS[
                    id as keyof typeof TAB_REFRESH_QUERY_KEYS
                  ]?.forEach((queryKey) => {
                    void queryClient.invalidateQueries({ queryKey });
                  });
                }

                props.navigation.navigate(id, { tabPressAt: String(Date.now()) });
              }}
            />
          </View>
        );
      }}
      screenOptions={{
        headerShown: false,
        animation: "none",
        lazy: false,
        freezeOnBlur: false,
        sceneStyle: styles.scene,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="heart" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="my" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: "#FFFFFF",
  },
  // 높이는 Navbar가 safe-area inset을 포함해 스스로 결정하므로 고정하지 않는다.
  tabBar: {
    backgroundColor: "#FFFFFF",
    zIndex: 1,
  },
});
