import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChatActionSheet from "@/components/chat/ChatActionSheet";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage, { ChatMessageData } from "@/components/chat/ChatMessage";
import ConfirmModal from "@/components/chat/ConfirmModal";
import MicRecorder from "@/components/MicRecorder";
import {
  useChatMessagesInfiniteQuery,
  useChatRoomDetailQuery,
  useLeaveChatRoomMutation,
  useSendChatMessageMutation,
} from "@/hooks/api/useChats";

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const chatRoomId = Number(id);
  const hasChatRoomId = Number.isFinite(chatRoomId);
  const roomDetailQuery = useChatRoomDetailQuery(chatRoomId, hasChatRoomId);
  const messagesQuery = useChatMessagesInfiniteQuery(chatRoomId, 30, hasChatRoomId);
  const sendMessageMutation = useSendChatMessageMutation(chatRoomId);
  const leaveChatRoomMutation = useLeaveChatRoomMutation(chatRoomId);
  const profile = useMemo(
    () =>
      roomDetailQuery.data
        ? {
            name: roomDetailQuery.data.peer.nickname,
            age: roomDetailQuery.data.peer.age,
            area: roomDetailQuery.data.peer.areaName,
            image: roomDetailQuery.data.peer.profileImageUrl,
          }
        : null,
    [roomDetailQuery.data],
  );
  const apiMessages = useMemo(
    () => mapChatMessages(messagesQuery.data, roomDetailQuery.data?.peer.profileImageUrl),
    [messagesQuery.data, roomDetailQuery.data?.peer.profileImageUrl],
  );
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessageData[]>([]);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const messages = [...apiMessages, ...optimisticMessages];

  // 음성 녹음 중에는 1초 단위로 녹음 시간을 갱신합니다.
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 1800);
  };

  const handleReport = () => {
    setShowActionSheet(false);
    router.push("/chat/report");
  };

  const handleBlockToggle = () => {
    setShowActionSheet(false);
    if (isBlocked) {
      setIsBlocked(false);
      showToast(`${profile?.name ?? "상대방"}님을 차단 해제했습니다`);
      return;
    }

    setShowBlockModal(true);
  };

  const handleLeave = () => {
    setShowActionSheet(false);
    setShowLeaveModal(true);
  };

  const handleSend = (text: string) => {
    const nextMessage: ChatMessageData = {
      id: `message-${Date.now()}`,
      type: "text",
      text,
      isMine: true,
      time: "오후 07:39",
    };

    setOptimisticMessages((prevMessages) => [...prevMessages, nextMessage]);
    setIsAttachmentOpen(false);

    if (!hasChatRoomId) return;

    sendMessageMutation.mutate(
      {
        type: "TEXT",
        text,
        mediaUrl: "",
        durationSec: 0,
      },
      {
        onSuccess: () => {
          setOptimisticMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== nextMessage.id),
          );
        },
        onError: () => {
          setOptimisticMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== nextMessage.id),
          );
          showToast("메시지를 보내지 못했습니다.");
        },
      },
    );
  };

  const formatVoiceDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const resetVoiceRecorder = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleVoiceButtonPress = () => {
    setIsAttachmentOpen(false);
    setIsVoiceRecorderOpen(true);
    setIsRecording(true);
  };

  const handleVoiceCancel = () => {
    resetVoiceRecorder();
    setIsVoiceRecorderOpen(false);
  };

  const handleVoiceRecord = () => {
    setIsRecording((prevRecording) => !prevRecording);
  };

  const handleVoiceSend = () => {
    if (recordingTime <= 0) return;

    const nextMessage: ChatMessageData = {
      id: `message-${Date.now()}`,
      type: "voice",
      duration: formatVoiceDuration(recordingTime),
      isMine: true,
      time: "오후 07:39",
      isPlaying: false,
    };

    setOptimisticMessages((prevMessages) => [...prevMessages, nextMessage]);
    handleVoiceCancel();
  };

  const renderProfileInfo = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileAvatar} />
      {profile ? (
        <>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileInfo}>
            {profile.age}세 · {profile.area}
          </Text>
          <Text style={styles.profileWelcomeText}>
            서로를 알아가는 첫 이야기,{"\n"}편하게 시작해볼까요?
          </Text>
        </>
      ) : roomDetailQuery.isLoading ? (
        <ActivityIndicator color="#FF3E70" />
      ) : (
        <Text style={styles.profileWelcomeText}>
          대화방 정보를 불러오지 못했습니다.
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={24} color="#A6AFB6" />
        </Pressable>
        <Text style={styles.headerTitle}>{profile?.name ?? "대화"}</Text>
        <Pressable
          style={[styles.headerButton, styles.menuButton]}
          onPress={() => setShowActionSheet(true)}
          hitSlop={10}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#202020" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={isVoiceRecorderOpen ? [] : messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessage message={item} />}
          ListHeaderComponent={renderProfileInfo}
          ListFooterComponent={
            messagesQuery.isFetchingNextPage ? (
              <View style={styles.paginationLoading}>
                <Text style={styles.paginationLoadingText}>
                  이전 대화를 불러오는 중...
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            messagesQuery.isLoading ? (
              <View style={styles.emptyMessages}>
                <ActivityIndicator color="#FF3E70" />
              </View>
            ) : (
              <View style={styles.emptyMessages}>
                <Text style={styles.emptyMessagesTitle}>
                  아직 주고받은 메시지가 없어요
                </Text>
                <Text style={styles.emptyMessagesText}>
                  {messagesQuery.isError
                    ? "대화 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
                    : "첫 메시지를 보내 대화를 시작해보세요."}
                </Text>
              </View>
            )
          }
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (
              messagesQuery.hasNextPage &&
              !messagesQuery.isFetchingNextPage
            ) {
              messagesQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.35}
        />

        {!isBlocked && !isAttachmentOpen ? (
          isVoiceRecorderOpen ? (
            <View style={styles.voiceRecorderPosition}>
              {/* 기존 채팅 마이크 버튼 위치에서 녹음 컨트롤을 보여줍니다. */}
              <MicRecorder
                isRecording={isRecording}
                recordingTime={recordingTime}
                onRecordPress={handleVoiceRecord}
                onCancelPress={handleVoiceCancel}
                onSendPress={handleVoiceSend}
                onResetPress={resetVoiceRecorder}
                containerStyle={styles.voiceRecorder}
              />
            </View>
          ) : (
            <Pressable
              style={styles.voiceButton}
              onPress={handleVoiceButtonPress}
            >
              <Ionicons name="mic-outline" size={34} color="#FFFFFF" />
            </Pressable>
          )
        ) : null}

        {isBlocked ? (
          <View style={styles.blockedInputArea}>
            <Ionicons name="add" size={25} color="#A6AFB6" />
            <View style={styles.blockedTextBox}>
              <Text style={styles.blockedText}>
                차단한 사용자와는 대화할 수 없어요.
              </Text>
            </View>
          </View>
        ) : isVoiceRecorderOpen ? (
          <View style={styles.chatInputPlaceholder} />
        ) : (
          <ChatInput
            onSend={handleSend}
            isAttachmentOpen={isAttachmentOpen}
            onToggleAttachment={() =>
              setIsAttachmentOpen((prevOpen) => !prevOpen)
            }
          />
        )}
      </KeyboardAvoidingView>

      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      <ChatActionSheet
        visible={showActionSheet}
        isBlocked={isBlocked}
        onClose={() => setShowActionSheet(false)}
        onReport={handleReport}
        onBlockToggle={handleBlockToggle}
        onLeave={handleLeave}
      />

      <ConfirmModal
        visible={showLeaveModal}
        title="대화방을 나갈까요?"
        subtitle="대화방을 나가면 다시 대화할 수 없습니다."
        cancelLabel="취소"
        confirmLabel="나가기"
        onClose={() => setShowLeaveModal(false)}
        onConfirm={() => {
          setShowLeaveModal(false);
          if (!hasChatRoomId) {
            router.replace("/(tabs)/chat" as never);
            return;
          }

          leaveChatRoomMutation.mutate(undefined, {
            onSettled: () => router.replace("/(tabs)/chat" as never),
          });
        }}
      />

      <ConfirmModal
        visible={showBlockModal}
        title="상대방을 차단할까요?"
        subtitle={`차단하면 ${profile?.name ?? "상대방"}님과 채팅창에서 대화를 주고받을 수 없어요. 차단하시겠어요?`}
        cancelLabel="취소"
        confirmLabel="차단"
        onClose={() => setShowBlockModal(false)}
        onConfirm={() => {
          setShowBlockModal(false);
          setIsBlocked(true);
          showToast(`${profile?.name ?? "상대방"}님을 차단했습니다`);
        }}
      />
    </SafeAreaView>
  );
}

function mapChatMessages(
  data:
    | {
        pages: {
          items: {
            messageId: number;
            type: "TEXT" | "AUDIO" | "PHOTO" | "VIDEO";
            text: string | null;
            durationSec: number;
            isMine: boolean;
            sentAt: string;
          }[];
        }[];
      }
    | undefined,
  peerAvatar?: string,
): ChatMessageData[] {
  return (
    data?.pages.flatMap((page) =>
      page.items.map((item) => {
        const base = {
          id: `message-${item.messageId}`,
          isMine: item.isMine,
          time: formatChatTime(item.sentAt),
          avatar: item.isMine ? undefined : peerAvatar,
        };

        if (item.type === "AUDIO") {
          return {
            ...base,
            type: "voice" as const,
            duration: formatDuration(item.durationSec),
            isPlaying: false,
          };
        }

        return {
          ...base,
          type: "text" as const,
          text:
            item.type === "PHOTO"
              ? item.text ?? "[사진]"
              : item.type === "VIDEO"
                ? item.text ?? "[동영상]"
                : item.text ?? "",
        };
      }),
    ) ?? []
  );
}

function formatChatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  menuButton: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: "#202020",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  paginationLoading: {
    paddingVertical: 12,
    alignItems: "center",
  },
  paginationLoadingText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#A6AFB6",
  },
  emptyMessages: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyMessagesTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#202020",
    textAlign: "center",
  },
  emptyMessagesText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#A6AFB6",
    textAlign: "center",
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 42,
  },
  profileAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#D9D9D9",
    marginBottom: 14,
  },
  profileName: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: "#202020",
    marginBottom: 8,
  },
  profileInfo: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#6F7780",
    marginBottom: 34,
  },
  profileWelcomeText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#A6AFB6",
    textAlign: "center",
  },
  voiceButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3E70",
    shadowColor: "#FF3E70",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  voiceRecorderPosition: {
    width: "100%",
    paddingHorizontal: 22,
    alignItems: "center",
    marginBottom: -40,
  },
  voiceRecorder: {
    width: "100%",
  },
  chatInputPlaceholder: {
    height: 64,
    backgroundColor: "transparent",
  },
  blockedInputArea: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: 8,
  },
  blockedTextBox: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F2F3F5",
    alignItems: "center",
    justifyContent: "center",
  },
  blockedText: {
    color: "#A6AFB6",
    fontSize: 13,
    fontWeight: "600",
  },
  toast: {
    position: "absolute",
    left: 50,
    right: 50,
    bottom: 96,
    minHeight: 36,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(32,32,32,0.78)",
    paddingHorizontal: 14,
  },
  toastText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
