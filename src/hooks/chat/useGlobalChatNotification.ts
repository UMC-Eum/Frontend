import { useEffect } from "react";
import { useSocketStore } from "../../stores/useSocketStore";
import { useUserStore } from "../../stores/useUserStore";
import { MessageNewData } from "../../types/api/socket";
import { getChatRoomDetail } from "../../api/chats/chatsApi";
import avatar_placeholder from "../../assets/avatar_placeholder.svg";
export const useGlobalChatNotification = () => {
  const { socket, currentChatRoomId, showChatNotification } = useSocketStore();
  const myId = useUserStore((state) => state.user?.userId);

  useEffect(() => {
    if (!socket || !myId) return;

    const handleMessageNew = async (response: any) => {
      const newMsgData: MessageNewData = response.success?.data || response;

      if (newMsgData.senderUserId === myId) {
        return;
      }

      if (
        currentChatRoomId &&
        newMsgData.chatRoomId &&
        Number(newMsgData.chatRoomId) === currentChatRoomId
      ) {
        return;
      }

      let messagePreview = "";
      const messageType = String(newMsgData.type);

      if (messageType === "TEXT") {
        messagePreview = newMsgData.text || "메시지를 보냈습니다.";
      } else if (messageType === "PHOTO" || messageType === "IMAGE") {
        messagePreview = "📷 사진을 보냈습니다.";
      } else if (messageType === "VIDEO") {
        messagePreview = "🎥 동영상을 보냈습니다.";
      } else if (messageType === "AUDIO") {
        messagePreview = "🎤 음성 메시지를 보냈습니다.";
      } else {
        messagePreview = "메시지를 보냈습니다.";
      }

      let senderName = newMsgData.senderName || "알 수 없음";
      let senderProfileImage =
        newMsgData.senderProfileImage || avatar_placeholder;
      if (!newMsgData.senderName || !newMsgData.senderProfileImage) {
        try {
          const roomDetail = await getChatRoomDetail(
            Number(newMsgData.chatRoomId),
          );
          if (roomDetail.peer) {
            senderName = roomDetail.peer.nickname;
            senderProfileImage = roomDetail.peer.profileImageUrl;
          }
        } catch (error) {
          console.error("채팅방 정보 가져오기 실패:", error);
        }
      }

      showChatNotification({
        chatRoomId: Number(newMsgData.chatRoomId),
        senderUserId: newMsgData.senderUserId,
        senderName,
        senderProfileImage,
        messagePreview,
        messageType,
      });
    };

    socket.on("message.new", handleMessageNew);

    return () => {
      socket.off("message.new", handleMessageNew);
    };
  }, [socket, myId, currentChatRoomId, showChatNotification]);
};
