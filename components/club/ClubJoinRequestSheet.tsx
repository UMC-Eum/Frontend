import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import { CLUB_COLORS } from "@/components/club/ClubPostParts";

type ClubSummary = {
  title: string;
  location: string;
  category: string;
  imageUri?: string;
};

type Props = {
  visible: boolean;
  club: ClubSummary;
  message: string;
  onChangeMessage: (message: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isApprovalRequired?: boolean;
};

const MAX_MESSAGE_LENGTH = 30;

export default function ClubJoinRequestSheet({
  visible,
  club,
  message,
  onChangeMessage,
  onClose,
  onSubmit,
  isApprovalRequired = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const canSubmit = message.trim().length > 0;
  const [sheetLift, setSheetLift] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight =
        Platform.OS === "ios"
          ? Math.max(0, windowHeight - event.endCoordinates.screenY)
          : event.endCoordinates.height;

      setSheetLift(Math.max(0, keyboardHeight - insets.bottom));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setSheetLift(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom, windowHeight]);

  useEffect(() => {
    if (!visible) {
      setSheetLift(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + 24,
              transform: [{ translateY: -sheetLift }],
            },
          ]}
        >
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.content}>
            <View style={styles.clubCard}>
              {club.imageUri ? (
                <Image
                  source={{ uri: club.imageUri }}
                  style={styles.clubThumb}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.clubThumb} />
              )}

              <View style={styles.clubTextGroup}>
                <Text style={styles.clubTitle} numberOfLines={1}>
                  {club.title}
                </Text>
                <View style={styles.clubMetaRow}>
                  <Text style={styles.clubMetaText} numberOfLines={1}>
                    {club.location}
                  </Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.clubMetaText} numberOfLines={1}>
                    {club.category}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>가입 메세지</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <Text style={styles.description}>
                운영자에게 전달 되는 메세지에요.
              </Text>
            </View>

            <View style={styles.inputBox}>
              <TextInput
                value={message}
                onChangeText={onChangeMessage}
                maxLength={MAX_MESSAGE_LENGTH}
                multiline
                textAlignVertical="top"
                placeholder={"가입하고 싶은 이유나 간단한 자기소개를\n작성해주세요 :)"}
                placeholderTextColor={CLUB_COLORS.gray500}
                style={styles.input}
              />
              <Text style={styles.counter}>
                {message.length}/{MAX_MESSAGE_LENGTH}
              </Text>
            </View>

            {isApprovalRequired ? (
              <View style={styles.approvalNotice}>
                <Text style={styles.approvalNoticeText}>
                  가입 승인제 동호회에요. 운영자 확인 후 알림을 드려요.
                </Text>
              </View>
            ) : null}

            <Cta
              label="가입 신청하기"
              onPress={onSubmit}
              disabled={!canSubmit}
              containerStyle={styles.ctaContainer}
              buttonStyle={styles.ctaButton}
              labelStyle={styles.ctaLabel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: CLUB_COLORS.white,
  },
  handleArea: {
    height: 40,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
  },
  handle: {
    width: 46,
    height: 4,
    borderRadius: 100,
    backgroundColor: CLUB_COLORS.gray300,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  clubCard: {
    width: "100%",
    minHeight: 72,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: CLUB_COLORS.gray150,
    borderRadius: 14,
    backgroundColor: CLUB_COLORS.gray100,
  },
  clubThumb: {
    width: 48,
    height: 48,
    borderRadius: 7,
    backgroundColor: "#D9D9D9",
  },
  clubTextGroup: {
    flex: 1,
  },
  clubTitle: {
    color: CLUB_COLORS.black,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
  clubMetaRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  clubMetaText: {
    color: CLUB_COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  metaDot: {
    width: 2,
    height: 2,
    marginHorizontal: 7,
    borderRadius: 1,
    backgroundColor: CLUB_COLORS.gray700,
  },
  formGroup: {
    gap: 2,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  label: {
    color: CLUB_COLORS.black,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
  required: {
    color: CLUB_COLORS.pink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
  description: {
    color: CLUB_COLORS.gray500,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  inputBox: {
    minHeight: 94,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(222,227,229,0.4)",
    borderRadius: 10,
    backgroundColor: CLUB_COLORS.gray100,
  },
  input: {
    minHeight: 48,
    padding: 0,
    color: CLUB_COLORS.black,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "500",
  },
  counter: {
    alignSelf: "flex-end",
    color: CLUB_COLORS.gray500,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  approvalNotice: {
    width: "100%",
    minHeight: 34,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FFF0F2",
  },
  approvalNoticeText: {
    color: "#EA1456",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  ctaContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  ctaButton: {
    height: 54,
    borderRadius: 14,
  },
  ctaLabel: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
});
