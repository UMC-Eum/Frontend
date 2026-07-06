import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type ChatMessageData =
  | {
      id: string;
      type: "date";
      dateText: string;
    }
  | {
      id: string;
      type: "text";
      text: string;
      isMine: boolean;
      time: string;
      sentAt?: string;
      showTime?: boolean;
      showUnreadIndicator?: boolean;
      compactSpacing?: boolean;
      groupTopSpacing?: boolean;
      showAvatar?: boolean;
      avatar?: string;
    }
  | {
      id: string;
      type: "voice";
      duration: string;
      isMine: boolean;
      time: string;
      sentAt?: string;
      showTime?: boolean;
      showUnreadIndicator?: boolean;
      compactSpacing?: boolean;
      groupTopSpacing?: boolean;
      showAvatar?: boolean;
      avatar?: string;
      mediaUrl?: string;
      isPlaying?: boolean;
    }
  | {
      id: string;
      type: "photo";
      mediaUrl: string;
      isMine: boolean;
      time: string;
      sentAt?: string;
      showTime?: boolean;
      showUnreadIndicator?: boolean;
      compactSpacing?: boolean;
      groupTopSpacing?: boolean;
      showAvatar?: boolean;
      avatar?: string;
    };

export default function ChatMessage({
  message,
  onVoicePress,
}: {
  message: ChatMessageData;
  onVoicePress?: (message: Extract<ChatMessageData, { type: "voice" }>) => void;
}) {
  if (message.type === "date") {
    return (
      <View style={styles.dateSeparator}>
        <Text style={styles.dateText}>{message.dateText}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        message.compactSpacing && styles.compactContainer,
        message.groupTopSpacing && styles.groupTopContainer,
        message.isMine ? styles.myContainer : styles.otherContainer,
      ]}
    >
      {!message.isMine ? (
        message.showAvatar === false ? (
          <View style={[styles.avatar, styles.avatarSpacer]} />
        ) : message.avatar ? (
          <Image source={{ uri: message.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar} />
        )
      ) : null}

      <View
        style={[
          styles.wrapper,
          message.isMine ? styles.myWrapper : styles.otherWrapper,
        ]}
      >
        <View style={styles.bubbleRow}>
          {message.isMine &&
          (message.showUnreadIndicator || message.showTime !== false) ? (
            <View style={styles.myMeta}>
              {message.showUnreadIndicator ? (
                <Text style={styles.unreadCount}>1</Text>
              ) : null}
              {message.showTime !== false ? (
                <Text style={[styles.time, styles.myTime]}>
                  {message.time}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View
            style={[
              styles.bubble,
              message.isMine ? styles.myBubble : styles.otherBubble,
              message.type === "voice" && styles.voiceBubble,
              message.type === "photo" && styles.photoBubble,
            ]}
          >
            {message.type === "text" ? (
              <Text
                style={[
                  styles.text,
                  message.isMine ? styles.myText : styles.otherText,
                ]}
              >
                {message.text}
              </Text>
            ) : null}

            {message.type === "voice" ? (
              <View style={styles.voiceContainer}>
                <Pressable
                  style={styles.voicePlayBtn}
                  onPress={() => onVoicePress?.(message)}
                  disabled={!message.mediaUrl}
                >
                  <Ionicons
                    name={message.isPlaying ? "pause" : "play"}
                    size={20}
                    color={message.isMine ? "#FF3E70" : "#6F7780"}
                  />
                </Pressable>
                <View
                  style={[
                    styles.voiceWaveform,
                    !message.isMine && styles.otherVoiceWaveform,
                  ]}
                >
                  {VOICE_BARS.map((height, index) => (
                    <View
                      key={`voice-bar-${index}`}
                      style={[
                        styles.voiceWaveBar,
                        {
                          height,
                          opacity: message.isMine
                            ? index % 3 === 0
                              ? 0.62
                              : 0.94
                            : 0.9,
                        },
                        !message.isMine && styles.otherVoiceWaveBar,
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.voiceDuration,
                    message.isMine
                      ? styles.myVoiceDuration
                      : styles.otherVoiceDuration,
                  ]}
                >
                  {message.duration}
                </Text>
              </View>
            ) : null}

            {message.type === "photo" ? (
              <Image source={{ uri: message.mediaUrl }} style={styles.photo} />
            ) : null}
          </View>

          {!message.isMine && message.showTime !== false ? (
            <Text style={[styles.time, styles.otherTime]}>{message.time}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const VOICE_BARS = [4, 7, 5, 9, 13, 18, 12, 15, 20, 13, 9, 15, 10, 8, 12, 7, 5];

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 10,
    maxWidth: "88%",
  },
  compactContainer: {
    marginVertical: 2,
  },
  groupTopContainer: {
    marginTop: 10,
  },
  myContainer: {
    alignSelf: "flex-end",
  },
  otherContainer: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D9D9D9",
    marginRight: 8,
  },
  avatarSpacer: {
    backgroundColor: "transparent",
  },
  wrapper: {
    flex: 1,
  },
  myWrapper: {
    alignItems: "flex-end",
  },
  otherWrapper: {
    alignItems: "flex-start",
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: 230,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  photoBubble: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  voiceBubble: {
    maxWidth: 212,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: "#FF3E70",
    marginRight: 8,
  },
  otherBubble: {
    backgroundColor: "#EEF0F2",
    marginLeft: 8,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  myText: {
    color: "#FFFFFF",
  },
  otherText: {
    color: "#202020",
  },
  time: {
    fontSize: 10,
    lineHeight: 14,
    color: "#A6AFB6",
  },
  myMeta: {
    alignItems: "flex-end",
    marginRight: 2,
  },
  unreadCount: {
    marginBottom: 2,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    color: "#FFB000",
  },
  myTime: {
    marginRight: 0,
  },
  otherTime: {
    marginLeft: 6,
  },
  dateSeparator: {
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 11,
    lineHeight: 15,
    color: "#7B828A",
    fontWeight: "600",
  },
  voiceContainer: {
    width: 184,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
  },
  voicePlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },
  voiceWaveform: {
    flex: 1,
    height: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2.5,
    marginRight: 6,
  },
  otherVoiceWaveform: {
    backgroundColor: "transparent",
  },
  voiceWaveBar: {
    width: 2.5,
    borderRadius: 1.25,
    backgroundColor: "#FFFFFF",
  },
  otherVoiceWaveBar: {
    backgroundColor: "#8A949E",
  },
  voiceDuration: {
    minWidth: 31,
    fontSize: 12,
    fontWeight: "700",
  },
  myVoiceDuration: {
    color: "#FFFFFF",
  },
  otherVoiceDuration: {
    color: "#202020",
  },
  photo: {
    width: 190,
    height: 190,
    borderRadius: 12,
    backgroundColor: "#EEF0F2",
  },
});
