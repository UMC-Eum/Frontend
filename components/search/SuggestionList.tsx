import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SuggestionListProps = {
  suggestions: string[];
  onPressSearch: (keyword: string) => void;
};

export default function SuggestionList({
  suggestions,
  onPressSearch,
}: SuggestionListProps) {
  return (
    <View style={styles.content}>
      {suggestions.map((keyword) => (
        <Pressable
          key={keyword}
          onPress={() => onPressSearch(keyword)}
          style={styles.suggestionRow}
        >
          <Ionicons name="search" size={19} color="#9BA5AD" />
          <Text style={styles.suggestionText}>{keyword}</Text>
        </Pressable>
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
  suggestionRow: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  suggestionText: {
    fontSize: 15,
    color: "#202020",
  },
});
