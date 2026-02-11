import { useSocketStore } from "../../stores/useSocketStore";
import { useMediaUpload } from "./useMediaUpload";
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO";

type IMessageItem = IChatsRoomIdMessagesGetResponse["items"][number];

export const useChatSender = (
  roomId: number,
  myId: number,
  setTempMessages: React.Dispatch<React.SetStateAction<IMessageItem[]>>,
  scrollToBottom: () => void,
) => {
  const { sendMessage } = useSocketStore();
  const { uploadMedia } = useMediaUpload();

  // 공통: 임시 메시지 추가 (낙관적 업데이트)
  const addTempMessage = (
    type: any,
    text: string | null,
    mediaUrl: string,
    durationSec: number,
  ) => {
    const tempMsg: IMessageItem = {
      messageId: Date.now(), // 임시 ID
      senderUserId: myId,
      type,
      text,
      mediaUrl,
      durationSec,
      sendAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 100);
  };

  // 1. 텍스트 전송
  const sendText = async (text: string) => {
    addTempMessage("TEXT", text, "", 0);
    sendMessage(roomId, "TEXT", text);
  };

  // 2. 음성 전송
  const sendVoice = async (file: File, duration: number) => {
    const fakeUrl = URL.createObjectURL(file);
    addTempMessage("AUDIO", null, fakeUrl, duration);

    const mediaUrl = await uploadMedia(file);
    if (mediaUrl) {
      sendMessage(roomId, "AUDIO", null, mediaUrl, duration);
    }
  };

  // 3. 이미지/동영상 전송
  const sendImageOrVideo = (mediaUrl: string) => {
    const isVideo = mediaUrl.match(/\.(mp4|mov|avi|webm)$/i);

    // ✅ 소켓 서버 규격에 맞게 PHOTO / VIDEO로 전송
    const socketType = isVideo ? "VIDEO" : "PHOTO";

    // UI 표시용 (PHOTO로 통일)
    addTempMessage(socketType, null, mediaUrl, 0);

    console.log(`📤 소켓 전송: ${socketType}`);
    sendMessage(roomId, socketType as any, null, mediaUrl);
  };

  return { sendText, sendVoice, sendImageOrVideo };
};
