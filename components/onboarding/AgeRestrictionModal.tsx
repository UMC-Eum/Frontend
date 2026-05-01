import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface AgeRestrictionModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 나이 제한 안내 모달
 * - 만 50세 미만 사용자에게 표시
 * - 반투명 오버레이 + 중앙 카드
 */
const AgeRestrictionModal = ({
  visible,
  onClose,
}: AgeRestrictionModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>가입대상이 아닙니다.</Text>
          <Text style={styles.description}>
            이음은 만 50세 이상부터 이용가능한 시니어{"\n"}
            전용 데이팅 어플이에요.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  closeButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#FF3E70",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonPressed: {
    opacity: 0.85,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AgeRestrictionModal;
