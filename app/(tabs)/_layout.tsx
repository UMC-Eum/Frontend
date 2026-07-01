import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { AppNavbar } from "@/components/AppNavbar";
import { TAB_BAR_HEIGHT } from "@/constants/layout";

export default function TabLayout() {
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
                props.navigation.navigate(id);
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
  tabBar: {
    height: TAB_BAR_HEIGHT,
    backgroundColor: "#FFFFFF",
  },
});
