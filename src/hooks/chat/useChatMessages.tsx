import { useState, useEffect } from "react";
import {
  getChatMessages,
  readChatMessage,
  patchChatMessage,
} from "../../api/chats/chatsApi"; // patchChatMessage 추가 확인
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO";

type ApiMessageItem = IChatsRoomIdMessagesGetResponse["items"][number];

export function useChatMessages(roomId: number | undefined, myId: number) {
  const [messages, setMessages] = useState<ApiMessageItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitLoaded, setIsInitLoaded] = useState(false);

  // 1. 초기 메시지 로드
  useEffect(() => {
    if (!roomId) return;

    // 방이 바뀌면 초기화
    setMessages([]);
    setNextCursor(null);
    setIsInitLoaded(false);

    const initLoad = async () => {
      try {
        const res = await getChatMessages(roomId, { size: 20 });
        if (res && res.items) {
          const sorted = [...res.items].sort(
            (a, b) =>
              new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime(),
          );
          setMessages(sorted);
          setNextCursor(res.nextCursor);
          setIsInitLoaded(true);

          sorted.forEach((item) => {
            if (item.senderUserId !== myId && !item.readAt) {
              readChatMessage(item.messageId).catch(console.error);
            }
          });
        }
      } catch (e) {
        console.error("초기 메시지 로드 실패", e);
      }
    };
    initLoad();
  }, [roomId, myId]);

  // 2. 과거 메시지 로드
  const loadPrevMessages = async () => {
    if (!roomId || !nextCursor || isLoading) return;
    setIsLoading(true);
    try {
      const res = await getChatMessages(roomId, {
        size: 20,
        cursor: nextCursor,
      });
      if (res && res.items.length > 0) {
        const oldMessages = [...res.items].sort(
          (a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime(),
        );
        setMessages((prev) => [...oldMessages, ...prev]);
        setNextCursor(res.nextCursor);
      } else {
        setNextCursor(null);
      }
    } catch (e) {
      console.error("과거 메시지 로드 실패", e);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ [추가] 메시지 삭제 핸들러
  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm("메시지를 삭제하시겠습니까?")) return;
    try {
      await patchChatMessage(messageId); // API 호출
      // 로컬 상태에서도 삭제 반영
      setMessages((prev) => prev.filter((msg) => msg.messageId !== messageId));
    } catch (e) {
      console.error("메시지 삭제 실패", e);
      alert("삭제에 실패했습니다.");
    }
  };

  return {
    messages,
    setMessages,
    nextCursor,
    isLoading,
    isInitLoaded,
    loadPrevMessages,
    handleDeleteMessage, // 👈 여기서 꼭 리턴해줘야 Page에서 쓸 수 있습니다!
  };
}
