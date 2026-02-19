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

  // 임시 메시지 추가 (낙관적 업데이트)
  const addTempMessage = (
    type: IMessageItem["type"],
    text: string | null,
    mediaUrl: string,
    durationSec: number,
  ) => {
    const tempMsg: IMessageItem = {
      messageId: Date.now(),
      senderUserId: myId,
      type,
      text,
      mediaUrl, // Blob URL (미리보기용)
      durationSec,
      sendAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 100);
  };

  // 임시 URL을 실제 S3 URL로 교체 (이미지 깜빡임 방지 및 즉시 반영)
  const replaceTempMediaUrl = (fromUrl: string, toUrl: string) => {
    setTempMessages((prev) =>
      prev.map((msg) =>
        msg.mediaUrl === fromUrl ? { ...msg, mediaUrl: toUrl } : msg,
      ),
    );
  };

  // 1. 텍스트 전송
  const sendText = async (text: string) => {
    if (!roomId) return;
    addTempMessage("TEXT", text, "", 0);
    sendMessage(roomId, "TEXT", text);
  };

  // 2. 음성 전송
  const sendVoice = async (file: File, duration: number) => {
    if (!roomId) return;

    const fakeUrl = URL.createObjectURL(file);
    addTempMessage("AUDIO", null, fakeUrl, duration);

    const uploadResult = await uploadMedia(file, roomId);

    if (uploadResult) {
      // ✅ 임시 URL을 실제 URL로 교체하여 즉시 보이게 함
      replaceTempMediaUrl(fakeUrl, uploadResult.publicUrl);
      // ✅ 소켓에는 publicUrl이 아닌 mediaRef를 전송
      sendMessage(roomId, "AUDIO", null, uploadResult.mediaRef, duration);
    }
  };

  // 3. 이미지/동영상 전송
  const sendImageOrVideo = async (file: File) => {
    if (!roomId) return;

    const isVideo = file.type.startsWith("video");
    const socketType = isVideo ? "VIDEO" : "PHOTO";
    const uiType: IMessageItem["type"] = isVideo ? "VIDEO" : "PHOTO";

    let durationSec = 0;
    
    if (isVideo) {
      durationSec = await new Promise<number>((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src); // 메모리 누수 방지
          resolve(Math.round(video.duration));   // 초 단위로 반올림하여 저장
        };
        video.src = URL.createObjectURL(file);
      });
    }

    const fakeUrl = URL.createObjectURL(file);
    addTempMessage(uiType, null, fakeUrl, durationSec);

    const uploadResult = await uploadMedia(file, roomId);

    if (uploadResult) {
      replaceTempMediaUrl(fakeUrl, uploadResult.publicUrl);
      // ✅ 소켓에는 mediaRef를 전송 (서버 DB 등록을 위해 필수)
      console.log("🎥 [소켓 전송 데이터 확인]:", {
        roomId,
        type: socketType,
        mediaRef: uploadResult.mediaRef,
        durationSec
      });
      sendMessage(roomId, socketType, null, uploadResult.mediaRef, durationSec);
    }
  };

  return { sendText, sendVoice, sendImageOrVideo };
};
