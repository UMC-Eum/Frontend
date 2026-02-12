import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChatRoom } from "../api/chats/chatsApi";
import { IChatsRoomsPostRequest } from "../types/api/chats/chatsDTO";

export const useMoveToChat = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const startChat = async (targetUserId: number) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const body: IChatsRoomsPostRequest = { targetUserId };

      const data = await createChatRoom(body);

      if (data && data.chatRoomId) {
        navigate(`/message/room/${data.chatRoomId}`);
      }
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      alert("채팅방 입장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return { startChat, isLoading };
};
