import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

const COLORS = {
  pink: "#F03F40",
  text: "#202020",
  gray700: "#636970",
  gray150: "#E9ECED",
  white: "#FFFFFF",
};

export default function DeleteClubModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.textBox}>
            <Text style={styles.title}>동호회 삭제</Text>
            <Text style={styles.subtitle}>
              한번 동호회를 삭제하면 되돌릴 수 없어요.{"\n"}목록, 게시글, 사진첩, 모임 기록이 모두
              삭제되며 복구가 불가능합니다.
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.confirmText}>삭제</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 38,
  },
  modal: {
    width: "100%",
    maxWidth: 336,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    padding: 24,
    gap: 20,
  },
  textBox: { gap: 12, alignItems: "center" },
  title: { fontSize: 20, lineHeight: 25, fontWeight: "600", color: COLORS.text, textAlign: "center" },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: COLORS.gray700,
    textAlign: "justify",
  },
  buttonRow: { flexDirection: "row", gap: 12, height: 48 },
  button: {
    flex: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: { backgroundColor: COLORS.gray150 },
  confirmButton: { backgroundColor: COLORS.pink },
  cancelText: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.gray700 },
  confirmText: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.white },
});
