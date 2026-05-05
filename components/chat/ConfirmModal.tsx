import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  visible: boolean;
  title: string;
  subtitle: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  subtitle,
  cancelLabel = "취소",
  confirmLabel = "확인",
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.cancelBtn]}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmBtn]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    width: "100%",
    maxWidth: 312,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: "#202020",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: "#5F6973",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
  },
  buttonRow: { flexDirection: "row", gap: 14, width: "100%" },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#EEF0F2" },
  cancelBtnText: { color: "#5F6973", fontSize: 13, fontWeight: "800" },
  confirmBtn: { backgroundColor: "#FF3E70" },
  confirmBtnText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
});
