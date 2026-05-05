import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { SortOption } from "@/types/search";

type SortSheetProps = {
  visible: boolean;
  selected: SortOption;
  onClose: () => void;
  onSelect: (option: SortOption) => void;
};

export default function SortSheet({
  visible,
  selected,
  onClose,
  onSelect,
}: SortSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>정렬</Text>
          <SortOptionRow
            label="추천순"
            selected={selected === "recommended"}
            onPress={() => onSelect("recommended")}
          />
          <SortOptionRow
            label="최신순"
            selected={selected === "latest"}
            onPress={() => onSelect("latest")}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SortOptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.optionRow}>
      <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
        {label}
      </Text>
      {selected && <Ionicons name="checkmark" size={18} color="#FF3E70" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    minHeight: 186,
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  handle: {
    alignSelf: "center",
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DEE3E5",
  },
  title: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#202020",
  },
  optionRow: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#636970",
  },
  selectedOptionText: {
    color: "#FF3E70",
  },
});
