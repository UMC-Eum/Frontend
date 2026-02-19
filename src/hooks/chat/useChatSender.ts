import { useSocketStore } from "../../stores/useSocketStore";
import { useMediaUpload } from "./useMediaUpload";
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO";

type IMessageItem = IChatsRoomIdMessagesGetResponse["items"][number];

/**
 * 기기별 실제 파일 타입을 체크하여 적절한 확장자로 변환하는 헬퍼 함수
 */
const getSafeAudioFile = (file: File): File => {
  const actualType = file.type || "audio/mp4";
  let extension = "webm";

  // 아이폰(MP4/M4A) 대응 로직
  if (
    actualType.includes("mp4") ||
    actualType.includes("m4a") ||
    actualType.includes("apple")
  ) {
    extension = "m4a";
  }

  const safeFileName = `${Date.now()}_voice_record.${extension}`;
  return new File([file], safeFileName, { type: actualType });
};

export const useChatSender = (
  roomId: number,
  myId: number,
  setTempMessages: React.Dispatch<React.SetStateAction<IMessageItem[]>>,
  scrollToBottom: () => void,
) => {
  const { sendMessage } = useSocketStore();
  const { uploadMedia } = useMediaUpload();

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
      mediaUrl,
      durationSec,
      sendAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 100);
  };

  const replaceTempMediaUrl = (fromUrl: string, toUrl: string) => {
    setTempMessages((prev) =>
      prev.map((msg) =>
        msg.mediaUrl === fromUrl ? { ...msg, mediaUrl: toUrl } : msg,
      ),
    );
  };

  const sendText = async (text: string) => {
    if (!roomId) return;
    addTempMessage("TEXT", text, "", 0);
    sendMessage(roomId, "TEXT", text);
  };

  const sendVoice = async (file: File, duration: number) => {
    if (!roomId) return;

    // 💡 파일 확장자 및 타입 세탁
    const safeFile = getSafeAudioFile(file);

    const fakeUrl = URL.createObjectURL(safeFile);
    addTempMessage("AUDIO", null, fakeUrl, duration);

    const uploadResult = await uploadMedia(safeFile, roomId);

    if (uploadResult) {
      replaceTempMediaUrl(fakeUrl, uploadResult.publicUrl);
      sendMessage(roomId, "AUDIO", null, uploadResult.mediaRef, duration);
    }
  };

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
          window.URL.revokeObjectURL(video.src);
          resolve(Math.round(video.duration));
        };
        video.src = URL.createObjectURL(file);
      });
    }

    const fakeUrl = URL.createObjectURL(file);
    addTempMessage(uiType, null, fakeUrl, durationSec);

    const uploadResult = await uploadMedia(file, roomId);

    if (uploadResult) {
      replaceTempMediaUrl(fakeUrl, uploadResult.publicUrl);
      sendMessage(roomId, socketType, null, uploadResult.mediaRef, durationSec);
    }
  };

  return { sendText, sendVoice, sendImageOrVideo };
};
