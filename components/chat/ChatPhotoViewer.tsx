import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Image } from "@/components/Image";

export type ChatPhotoViewerData = {
  uri: string;
  senderName?: string | null;
  sentAt?: string | null;
  time?: string | null;
};

type ChatPhotoViewerProps = {
  photo: ChatPhotoViewerData | null;
  onClose: () => void;
};

export default function ChatPhotoViewer({
  photo,
  onClose,
}: ChatPhotoViewerProps) {
  const insets = useSafeAreaInsets();
  const [isOverlayVisible, setOverlayVisible] = useState(true);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const visible = Boolean(photo?.uri);
  const senderName = photo?.senderName?.trim() || "사진";
  const timeText = formatPhotoTime(photo?.sentAt, photo?.time);

  useEffect(() => {
    if (visible) setOverlayVisible(true);
  }, [visible]);

  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: isOverlayVisible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isOverlayVisible, overlayOpacity]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {photo?.uri ? (
          <Pressable
            style={styles.imagePressArea}
            onPress={() => setOverlayVisible((current) => !current)}
          >
            <Image
              source={{ uri: photo.uri }}
              style={styles.image}
              contentFit="contain"
            />
          </Pressable>
        ) : null}

        <Animated.View
          style={[
            styles.overlay,
            {
              paddingTop: insets.top,
              opacity: overlayOpacity,
            },
          ]}
          pointerEvents={isOverlayVisible ? "box-none" : "none"}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={onClose}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={34} color="#FFFFFF" />
            </Pressable>
            <View style={styles.headerTextBlock}>
              <Text style={styles.senderName} numberOfLines={1}>
                {senderName}
              </Text>
              {timeText ? (
                <Text style={styles.timeText} numberOfLines={1}>
                  {timeText}
                </Text>
              ) : null}
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function formatPhotoTime(sentAt?: string | null, fallbackTime?: string | null) {
  if (!sentAt) return fallbackTime ?? "";

  const date = new Date(sentAt);
  if (Number.isNaN(date.getTime())) return fallbackTime ?? "";

  const dateText = `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  const period = date.getHours() < 12 ? "오전" : "오후";
  const hour = date.getHours() % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${dateText} ${period} ${hour}:${minute}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  imagePressArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(18, 18, 18, 0.64)",
  },
  header: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  backButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBlock: {
    flex: 1,
    alignItems: "center",
  },
  senderName: {
    maxWidth: "100%",
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
  },
  timeText: {
    marginTop: 2,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 52,
  },
});
