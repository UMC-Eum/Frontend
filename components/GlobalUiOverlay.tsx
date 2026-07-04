import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import ChatNotificationBanner from "@/components/chat/ChatNotificationBanner";
import { useUiStore } from "@/stores/uiStore";

export default function GlobalUiOverlay() {
  const globalLoadingCount = useUiStore((state) => state.globalLoadingCount);
  const toast = useUiStore((state) => state.toast);
  // 로딩/토스트가 없을 때는 전체 화면을 덮는 View 자체를 렌더링하지 않는다.
  // 새 아키텍처(Fabric)에서 absoluteFill View가 상시 떠 있으면 pointerEvents가
  // 제대로 통과되지 않아 하단 냅바 등 전역 터치를 삼키는 문제가 있어서다.
  const hasFloatingUi = globalLoadingCount > 0 || toast != null;

  return (
    <>
      <ChatNotificationBanner />

      {hasFloatingUi ? (
        <View style={styles.pointerBox}>
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
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  pointerBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    // Fabric에서 prop 대신 style로 지정해야 터치 통과가 안정적으로 동작한다.
    pointerEvents: "box-none",
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
