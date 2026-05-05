import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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

const PROFILE_BY_CHAT_ID: Record<string, { name: string; age: number; area: string }> = {
  "1": { name: "루시", age: 53, area: "서울시 관악구" },
  "2": { name: "등산하는거북이", age: 64, area: "서울시 관악구" },
  "3": { name: "영화고래", age: 64, area: "서울시 도봉구" },
  "4": { name: "독서여우", age: 64, area: "서울시 관악구" },
  "5": { name: "요가토끼", age: 64, area: "서울시 관악구" },
  "6": { name: "요가토끼", age: 64, area: "서울시 관악구" },
};

const AVATAR_IMAGE =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop";

const initialMessages: ChatMessageData[] = [
  { id: "date-1", type: "date", dateText: "2026년 5월 2일" },
  {
    id: "message-1",
    type: "text",
    text: "안녕하세요~ :)",
    isMine: true,
    time: "오후 01:39",
  },
  {
    id: "message-2",
    type: "text",
    text: "네 안녕하세요~~",
    isMine: false,
    time: "오후 03:39",
    avatar: AVATAR_IMAGE,
  },
  {
    id: "message-3",
    type: "text",
    text: "혹시 함께 즐겨 들으시나요? 프로필에 음악 듣기가 취미라고 되어있으시기에 물어 봤어요 ^^",
    isMine: true,
    time: "오후 03:40",
  },
  {
    id: "message-4",
    type: "text",
    text: "전 요즘 해외 팝송 즐겨듣습니다 노래가 중독성 있다라고요~",
    isMine: false,
    time: "오후 7:00",
    avatar: AVATAR_IMAGE,
  },
  {
    id: "message-5",
    type: "text",
    text: "그쪽은요?",
    isMine: false,
    time: "오후 07:01",
    avatar: AVATAR_IMAGE,
  },
  {
    id: "message-6",
    type: "voice",
    duration: "00:42",
    isMine: true,
    time: "오후 07:40",
    isPlaying: false,
  },
  {
    id: "message-7",
    type: "text",
    text: "저는 요즘 이런 노래 자주 들어요",
    isMine: true,
    time: "오후 07:41",
  },
  {
    id: "message-8",
    type: "text",
    text: "노래가 좋네요!",
    isMine: false,
    time: "오후 07:50",
    avatar: AVATAR_IMAGE,
  },
  {
    id: "message-9",
    type: "text",
    text: "제 취향이에요..😊",
    isMine: false,
    time: "오후 07:51",
    avatar: AVATAR_IMAGE,
  },
  { id: "date-2", type: "date", dateText: "2026년 5월 3일" },
  {
    id: "message-10",
    type: "voice",
    duration: "00:33",
    isMine: false,
    time: "오전 09:12",
    avatar: AVATAR_IMAGE,
  },
  {
    id: "message-11",
    type: "text",
    text: "오늘은 뭐하시나요?",
    isMine: false,
    time: "오전 09:20",
    avatar: AVATAR_IMAGE,
  },
  {
    id: "message-12",
    type: "voice",
    duration: "00:42",
    isMine: true,
    time: "오후 7:39",
    isPlaying: true,
  },
];

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const profile = useMemo(
    () => PROFILE_BY_CHAT_ID[id ?? "1"] ?? PROFILE_BY_CHAT_ID["1"],
    [id],
  );
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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
      showToast(`${profile.name}님을 차단 해제했습니다`);
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

    setMessages((prevMessages) => [...prevMessages, nextMessage]);
    setIsAttachmentOpen(false);
  };

  const renderProfileInfo = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileAvatar} />
      <Text style={styles.profileName}>{profile.name}</Text>
      <Text style={styles.profileInfo}>
        {profile.age}세 · {profile.area}
      </Text>
      <Text style={styles.profileWelcomeText}>
        서로를 알아가는 첫 이야기,{"\n"}편하게 시작해볼까요?
      </Text>
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
        <Text style={styles.headerTitle}>{profile.name}</Text>
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
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessage message={item} />}
          ListHeaderComponent={renderProfileInfo}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {!isBlocked && !isAttachmentOpen ? (
          <Pressable style={styles.voiceButton}>
            <Ionicons name="mic-outline" size={34} color="#FFFFFF" />
          </Pressable>
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
          router.replace("/(tabs)/chat" as never);
        }}
      />

      <ConfirmModal
        visible={showBlockModal}
        title="상대방을 차단할까요?"
        subtitle={`차단하면 ${profile.name}님과 채팅창에서 대화를 주고받을 수 없어요. 차단하시겠어요?`}
        cancelLabel="취소"
        confirmLabel="차단"
        onClose={() => setShowBlockModal(false)}
        onConfirm={() => {
          setShowBlockModal(false);
          setIsBlocked(true);
          showToast(`${profile.name}님을 차단했습니다`);
        }}
      />
    </SafeAreaView>
  );
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
