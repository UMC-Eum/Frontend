import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";

import { AppNavbar } from "@/components/AppNavbar";
import { TAB_BAR_HEIGHT } from "@/constants/layout";

export default function TabLayout() {
  const isKeyboardShown = useIsKeyboardShown();

  return (
    <Tabs
      detachInactiveScreens={false}
      tabBar={(props) => {
        if (isKeyboardShown) return null;

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

function useIsKeyboardShown() {
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, () =>
      setIsKeyboardShown(true),
    );
    const hideSubscription = Keyboard.addListener(hideEvent, () =>
      setIsKeyboardShown(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isKeyboardShown;
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
