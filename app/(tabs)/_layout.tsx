import { Tabs } from "expo-router";
import React from "react";

import { Navbar } from "@/components/Navbar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => {
        const currentRouteName = props.state.routes[props.state.index].name;

        const tabsData = [
          { id: "index", iconName: "home", label: "홈" },
          { id: "heart", iconName: "heart", label: "마음", hasDotBadge: true },
          { id: "chat", iconName: "chat", label: "대화", badgeCount: 100 },
          { id: "my", iconName: "person", label: "마이" },
        ];

        return (
          <Navbar
            tabs={tabsData as any}
            activeTabId={currentRouteName}
            onTabPress={(id) => props.navigation.navigate(id)}
            activeColor="#1F2937"
            inactiveColor="#9CA3AF"
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
