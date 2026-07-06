import { useQueryClient } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { AppNavbar } from "@/components/AppNavbar";
import { queryKeys } from "@/hooks/api/queryKeys";

const TAB_REFRESH_QUERY_KEYS = {
  index: [
    queryKeys.users.me(),
    queryKeys.recommendations.all,
    queryKeys.notifications.all,
    queryKeys.club.all,
  ],
  heart: [queryKeys.socials.hearts.all()],
  chat: [queryKeys.chats.all],
  my: [
    queryKeys.users.me(),
    queryKeys.socials.hearts.all(),
    queryKeys.recommendations.all,
    queryKeys.club.my(),
  ],
} as const;

export default function TabLayout() {
  const queryClient = useQueryClient();

  return (
    <Tabs
      detachInactiveScreens={false}
      tabBar={(props) => {
        const currentRouteName = props.state.routes[props.state.index].name;

        return (
          <View style={styles.tabBar}>
            <AppNavbar
              activeTabId={currentRouteName}
              onTabPress={(id) => {
                if (id !== currentRouteName) {
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
  },
});
