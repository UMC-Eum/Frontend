// src/hooks/useMoveToChat.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChatRoom } from "../api/chats/chatsApi"; // API 파일 경로 맞춰주세요
import { IChatsRoomsPostRequest } from "../types/api/chats/chatsDTO";

export const useMoveToChat = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const startChat = async (targetUserId: number) => {
    // 중복 클릭 방지
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      const body: IChatsRoomsPostRequest = { targetUserId };
      
      // 1. 채팅방 생성 (이미 존재하면 기존 방 정보를 줌)
      const data = await createChatRoom(body);

      if (data && data.chatRoomId) {
        console.log(`✅ 채팅방 입장: RoomID ${data.chatRoomId}`);
        // 2. 해당 채팅방 경로로 이동 (라우터 경로에 맞게 수정하세요)
        // 예: /chats/123
        navigate(`/message/room/${data.chatRoomId}`);
      }
    } catch (error) {
      console.error("❌ 채팅방 생성/입장 실패:", error);
      alert("채팅방 입장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return { startChat, isLoading };
};