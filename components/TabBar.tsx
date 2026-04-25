import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TabBarProps {
  Tab1?: string;
  Tab2?: string;
}

export default function TabBar({ Tab1 = "Tab1", Tab2 = "Tab2" }: TabBarProps) {
  const [selectedTab, setSelectedTab] = useState<string>(Tab1);

  // 화면 양 끝에서 띄워줄 여백 크기
  const edgeMargin = 16;

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabRow}>
        <Pressable onPress={() => setSelectedTab(Tab1)} style={styles.tab}>
          <Text
            style={
              selectedTab === Tab1 ? styles.activeText : styles.inactiveText
            }
          >
            {Tab1}
          </Text>
        </Pressable>

        <Pressable onPress={() => setSelectedTab(Tab2)} style={styles.tab}>
          <Text
            style={
              selectedTab === Tab2 ? styles.activeText : styles.inactiveText
            }
          >
            {Tab2}
          </Text>
        </Pressable>
      </View>

      <View style={styles.baselineRow}>
        <View style={styles.baseline} />
      </View>

      <View style={styles.activeUnderlineRow}>
        <View
          style={[
            styles.activeUnderline,
            selectedTab === Tab1
              ? { left: edgeMargin, right: "50%" }
              : { left: "50%", right: edgeMargin },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  tabRow: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  baselineRow: {
    width: "100%",
    height: 2,
    backgroundColor: "#e5e7eb",
  },
  baseline: {
    flex: 1,
  },
  activeUnderlineRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  activeUnderline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    backgroundColor: "black",
  },
  activeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  inactiveText: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#9ca3af",
  },
});
