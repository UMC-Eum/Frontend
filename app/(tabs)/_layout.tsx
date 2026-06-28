import { Tabs, useRouter } from "expo-router";
import React from "react";

import { AppNavbar } from "@/components/AppNavbar";

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      tabBar={(props) => {
        const currentRouteName = props.state.routes[props.state.index].name;

        return (
          <AppNavbar
            activeTabId={currentRouteName}
            onTabPress={(id) => {
              if (id === "index") {
                router.push("/home" as never);
                return;
              }

              props.navigation.navigate(id);
            }}
          />
        );
      }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="heart" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="my" />
    </Tabs>
  );
}
