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
      avatar?: string;
    }
  | {
      id: string;
      type: "voice";
      duration: string;
      isMine: boolean;
      time: string;
      avatar?: string;
      isPlaying?: boolean;
    };

export default function ChatMessage({ message }: { message: ChatMessageData }) {
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
        message.isMine ? styles.myContainer : styles.otherContainer,
      ]}
    >
      {!message.isMine ? (
        message.avatar ? (
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
          {message.isMine ? (
            <Text style={[styles.time, styles.myTime]}>{message.time}</Text>
          ) : null}

          <View
            style={[
              styles.bubble,
              message.isMine ? styles.myBubble : styles.otherBubble,
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
                <Pressable style={styles.voicePlayBtn}>
                  <Ionicons
                    name={message.isPlaying ? "pause" : "play"}
                    size={16}
                    color={message.isMine ? "#FF3E70" : "#FFFFFF"}
                  />
                </Pressable>
                <View
                  style={[
                    styles.voiceWaveform,
                    !message.isMine && styles.otherVoiceWaveform,
                  ]}
                />
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
          </View>

          {!message.isMine ? (
            <Text style={[styles.time, styles.otherTime]}>{message.time}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 8,
    maxWidth: "88%",
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
  myTime: {
    marginRight: 2,
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
    width: 168,
    flexDirection: "row",
    alignItems: "center",
  },
  voicePlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  voiceWaveform: {
    flex: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.36)",
    borderRadius: 8,
    marginRight: 8,
  },
  otherVoiceWaveform: {
    backgroundColor: "#C5CBD1",
  },
  voiceDuration: {
    fontSize: 10,
    fontWeight: "700",
  },
  myVoiceDuration: {
    color: "#FFFFFF",
  },
  otherVoiceDuration: {
    color: "#202020",
  },
});
