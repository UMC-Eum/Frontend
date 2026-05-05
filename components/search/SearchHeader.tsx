import { Ionicons } from "@expo/vector-icons";
import React, { RefObject } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type SearchHeaderProps = {
  inputRef: RefObject<TextInput | null>;
  query: string;
  onChangeQuery: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onBack: () => void;
};

export default function SearchHeader({
  inputRef,
  query,
  onChangeQuery,
  onSubmit,
  onClear,
  onBack,
}: SearchHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={12} onPress={onBack} style={styles.iconButton}>
        <Ionicons name="chevron-back" size={24} color="#202020" />
      </Pressable>

      <View style={styles.searchBox}>
        <TextInput
          ref={inputRef}
          autoFocus
          value={query}
          onChangeText={onChangeQuery}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          placeholder="지금 인기있는 동호회"
          placeholderTextColor="#B7C0C7"
          style={styles.searchInput}
        />
        {!!query && (
          <Pressable onPress={onClear} hitSlop={10} style={styles.clearButton}>
            <Ionicons name="close-circle" size={16} color="#AEB7BE" />
          </Pressable>
        )}
      </View>

      <Pressable onPress={onBack} style={styles.closeButton}>
        <Text style={styles.closeText}>닫기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  iconButton: {
    width: 28,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flex: 1,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    backgroundColor: "#F1F2F4",
    paddingLeft: 13,
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    padding: 0,
    fontSize: 14,
    color: "#202020",
  },
  clearButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#202020",
  },
});
