// src/hooks/chat/useChatMessages.ts
import { useState, useEffect } from "react";
import { getChatMessages, readChatMessage, sendChatMessage, patchChatMessage } from "../../api/chats/chatsApi";
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO";

type ApiMessageItem = IChatsRoomIdMessagesGetResponse["items"][number];

export function useChatMessages(roomId: number | undefined, myId: number) {
  const [messages, setMessages] = useState<ApiMessageItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitLoaded, setIsInitLoaded] = useState(false);

  // 초기 메시지 로드
  useEffect(() => {
    if (!roomId) return;
    const initLoad = async () => {
      try {
        const res = await getChatMessages(roomId, { size: 20 });
        if (res && res.items) {
          const sorted = [...res.items].sort((a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime());
          setMessages(sorted);
          setNextCursor(res.nextCursor);
          setIsInitLoaded(true);

          // 읽음 처리
          sorted.forEach(item => {
            if (item.senderUserId !== myId && !item.readAt) {
              readChatMessage(item.messageId).catch(console.error);
            }
          });
        }
      } catch (e) { console.error("메시지 로드 실패", e); }
    };
    initLoad();
  }, [roomId, myId]);

  // 과거 메시지 로드
  const loadPrevMessages = async () => {
    if (!roomId || !nextCursor) return;
    setIsLoading(true);
    try {
      const res = await getChatMessages(roomId, { size: 20, cursor: nextCursor });
      if (res && res.items.length > 0) {
        const oldMessages = [...res.items].sort((a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime());
        setMessages(prev => [...oldMessages, ...prev]);
        setNextCursor(res.nextCursor);
      } else {
        setNextCursor(null);
      }
    } catch (e) { console.error(e); } 
    finally { setIsLoading(false); }
  };

  // 텍스트 전송
  const handleSendText = async (text: string) => {
    if (!roomId) return;
    try {
      const res = await sendChatMessage(roomId, { type: "TEXT", text, mediaUrl: "", durationSec: 0 });
      const newMessage: ApiMessageItem = {
        messageId: res.messageId, senderUserId: myId, type: "TEXT", text, mediaUrl: "", durationSec: 0,
        sendAt: res.sendAt, readAt: null, isMine: true
      };
      setMessages(prev => [...prev, newMessage]);
      return true; // 성공 신호
    } catch (e) { console.error(e); return false; }
  };

  // 음성 전송
  const handleSendVoice = async (file: File, duration: number) => {
    if (!roomId) return;
    const localUrl = URL.createObjectURL(file);
    try {
      const res = await sendChatMessage(roomId, { type: "AUDIO", text: null, mediaUrl: "temp_url", durationSec: duration });
      const newMessage: ApiMessageItem = {
        messageId: res.messageId, senderUserId: myId, type: "AUDIO", text: null, mediaUrl: localUrl, durationSec: duration,
        sendAt: res.sendAt, readAt: null, isMine: true
      };
      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (e) { console.error(e); return false; }
  };

  // 삭제
  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await patchChatMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.messageId !== messageId));
    } catch (e) { console.error(e); }
  };

  return { messages, nextCursor, isLoading, isInitLoaded, loadPrevMessages, handleSendText, handleSendVoice, handleDeleteMessage };
}