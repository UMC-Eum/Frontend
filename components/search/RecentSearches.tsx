import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RecentSearchesProps = {
  searches: string[];
  onPressSearch: (keyword: string) => void;
  onRemoveSearch: (keyword: string) => void;
  onClearAll: () => void;
};

export default function RecentSearches({
  searches,
  onPressSearch,
  onRemoveSearch,
  onClearAll,
}: RecentSearchesProps) {
  return (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>최근 검색</Text>
        {searches.length > 0 && (
          <Pressable onPress={onClearAll} hitSlop={8}>
            <Text style={styles.clearAllText}>전체 삭제</Text>
          </Pressable>
        )}
      </View>

      {searches.map((keyword) => (
        <View key={keyword} style={styles.recentRow}>
          <Pressable
            onPress={() => onPressSearch(keyword)}
            style={styles.recentMain}
          >
            <Ionicons name="time-outline" size={19} color="#AEB7BE" />
            <Text style={styles.recentText}>{keyword}</Text>
          </Pressable>
          <Pressable onPress={() => onRemoveSearch(keyword)} hitSlop={10}>
            <Ionicons name="close" size={18} color="#AEB7BE" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#202020",
  },
  clearAllText: {
    fontSize: 12,
    color: "#B7C0C7",
  },
  recentRow: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recentMain: {
    flex: 1,
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  recentText: {
    fontSize: 15,
    color: "#202020",
  },
});
