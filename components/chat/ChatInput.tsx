import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface ChatInputProps {
  onSend: (text: string) => void;
  isAttachmentOpen?: boolean;
  onToggleAttachment?: () => void;
}

export default function ChatInput({
  onSend,
  isAttachmentOpen = false,
  onToggleAttachment,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;

    onSend(text.trim());
    setText("");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Pressable
          style={styles.iconButton}
          onPress={onToggleAttachment}
          hitSlop={8}
        >
          <Ionicons
            name={isAttachmentOpen ? "close" : "add"}
            size={25}
            color="#A6AFB6"
          />
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="대화 내용을 입력하세요."
          value={text}
          onChangeText={setText}
          placeholderTextColor="#A6AFB6"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />

        <Pressable style={styles.sendButton} onPress={handleSend} hitSlop={8}>
          <Ionicons
            name="send"
            size={22}
            color={canSend ? "#FF3E70" : "#A6AFB6"}
          />
        </Pressable>
      </View>

      {/* 첨부 패널: 플러스 버튼을 눌렀을 때 카메라/갤러리 선택지를 보여줍니다. */}
      {isAttachmentOpen ? (
        <View style={styles.attachmentPanel}>
          <AttachmentAction iconName="camera" label="카메라" />
          <AttachmentAction iconName="image" label="갤러리" />
        </View>
      ) : null}
    </View>
  );
}

interface AttachmentActionProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
}

const AttachmentAction = ({ iconName, label }: AttachmentActionProps) => (
  <Pressable style={styles.attachmentAction}>
    <View style={styles.attachmentIcon}>
      <Ionicons name={iconName} size={24} color="#6F7780" />
    </View>
    <Text style={styles.attachmentLabel}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F2F3F5",
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: "600",
    color: "#202020",
  },
  sendButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  attachmentPanel: {
    height: 104,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 28,
    paddingTop: 14,
    backgroundColor: "#FFFFFF",
  },
  attachmentAction: {
    alignItems: "center",
    width: 56,
  },
  attachmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF0F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  attachmentLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: "#202020",
  },
});
