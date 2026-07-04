import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  text: "#202020",
  gray700: "#636970",
  gray300: "#DEE3E5",
  gray150: "#E9ECED",
  gray100: "#F8FAFB",
  danger: "#F03F40",
  white: "#FFFFFF",
};

export type ActionSheetItem = {
  key: string;
  renderIcon: () => React.ReactNode;
  title: string;
  description?: string;
  danger?: boolean;
  onPress: () => void;
};

export default function ClubActionSheet({
  visible,
  items,
  onClose,
}: {
  visible: boolean;
  items: ActionSheetItem[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {items.map((item, index) => (
            <Pressable
              key={item.key}
              style={[styles.row, index < items.length - 1 && styles.rowBorderBottom]}
              onPress={() => {
                onClose();
                item.onPress();
              }}
            >
              <View style={[styles.iconBox, item.danger && styles.iconBoxDanger]}>
                {item.renderIcon()}
              </View>
              <View style={styles.textBox}>
                <Text style={[styles.title, item.danger && styles.titleDanger]}>{item.title}</Text>
                {item.description ? (
                  <Text style={[styles.description, item.danger && styles.descriptionDanger]}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={22} color={COLORS.gray300} />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  handleWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 12 },
  handle: { width: 46, height: 4, borderRadius: 100, backgroundColor: COLORS.gray300 },
  row: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowBorderBottom: { borderBottomWidth: 1, borderBottomColor: COLORS.gray150 },
  iconBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray150,
    backgroundColor: COLORS.gray100,
    padding: 12,
  },
  iconBoxDanger: { borderWidth: 0, backgroundColor: "rgba(240,63,64,0.1)" },
  textBox: { flex: 1, gap: 4 },
  title: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.text },
  titleDanger: { color: COLORS.danger },
  description: { fontSize: 14, lineHeight: 20, fontWeight: "500", color: COLORS.gray700 },
  descriptionDanger: { color: "rgba(240,63,64,0.5)" },
});
