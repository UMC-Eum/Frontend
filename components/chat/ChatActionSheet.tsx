import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  isBlocked: boolean;
  onClose: () => void;
  onReport: () => void;
  onBlockToggle: () => void;
  onLeave: () => void;
}

export default function ChatActionSheet({
  visible,
  isBlocked,
  onClose,
  onReport,
  onBlockToggle,
  onLeave,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                { paddingBottom: insets.bottom + 16 },
              ]}
            >
              {/* 메뉴 영역 */}
              <View style={styles.menuGroup}>
                <Pressable style={styles.menuItem} onPress={onReport}>
                  <Text style={[styles.menuText, styles.reportText]}>
                    신고하기
                  </Text>
                </Pressable>
                <View style={styles.divider} />
                <Pressable style={styles.menuItem} onPress={onBlockToggle}>
                  <Text style={styles.menuText}>
                    {isBlocked ? "차단해제" : "차단하기"}
                  </Text>
                </Pressable>
                <View style={styles.divider} />
                <Pressable style={styles.menuItem} onPress={onLeave}>
                  <Text style={[styles.menuText, styles.leaveText]}>
                    나가기
                  </Text>
                </Pressable>
              </View>
              {/* 취소 버튼 */}
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.44)",
    justifyContent: "flex-end",
  },
  sheetContainer: { paddingHorizontal: 14, gap: 8 },
  menuGroup: { backgroundColor: "#FFF", borderRadius: 9, overflow: "hidden" },
  menuItem: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#202020",
  },
  reportText: {
    color: "#FF3E70",
  },
  leaveText: { color: "#202020" },
  divider: { height: 1, backgroundColor: "#EEF0F2" },
  cancelButton: {
    backgroundColor: "#FFF",
    height: 44,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 13, fontWeight: "800", color: "#202020" },
});
