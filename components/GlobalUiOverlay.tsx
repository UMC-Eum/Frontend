import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import ChatNotificationBanner from "@/components/chat/ChatNotificationBanner";
import { useUiStore } from "@/stores/uiStore";

export default function GlobalUiOverlay() {
  const globalLoadingCount = useUiStore((state) => state.globalLoadingCount);
  const toast = useUiStore((state) => state.toast);

  return (
    <View style={styles.pointerBox} pointerEvents="box-none">
      <ChatNotificationBanner />

      {globalLoadingCount > 0 ? (
        <View style={styles.loadingBackdrop}>
          <ActivityIndicator color="#FF3E70" />
        </View>
      ) : null}

      {toast ? (
        <View style={[styles.toast, styles[`toast_${toast.type}`]]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pointerBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  loadingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  toast: {
    maxWidth: "86%",
    minHeight: 38,
    marginBottom: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(32,32,32,0.88)",
  },
  toast_info: {
    backgroundColor: "rgba(32,32,32,0.88)",
  },
  toast_success: {
    backgroundColor: "rgba(34,139,84,0.92)",
  },
  toast_error: {
    backgroundColor: "rgba(224,57,57,0.92)",
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    textAlign: "center",
  },
});
