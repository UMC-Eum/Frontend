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

  // const replaceTempMediaUrl = (fromUrl: string, toUrl: string) => {
  //   setTempMessages((prev) =>
  //     prev.map((msg) =>
  //       msg.mediaUrl === fromUrl ? { ...msg, mediaUrl: toUrl } : msg,
  //     ),
  //   );
  // };

  const sendText = async (text: string) => {
    if (!roomId) return;
    addTempMessage("TEXT", text, "", 0);
    sendMessage(roomId, "TEXT", text);
  };

  const sendVoice = async (file: File, duration: number) => {
    if (!roomId) return;

    // 💡 더 이상 확장자 세탁이 필요 없습니다! (이미 완벽한 MP3로 들어옴)
    const fakeUrl = URL.createObjectURL(file);
    addTempMessage("AUDIO", null, fakeUrl, duration);

    const uploadResult = await uploadMedia(file, roomId);

    if (uploadResult) {
      //replaceTempMediaUrl(fakeUrl, uploadResult.publicUrl);
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
      //replaceTempMediaUrl(fakeUrl, uploadResult.publicUrl);
      sendMessage(roomId, socketType, null, uploadResult.mediaRef, durationSec);
    }
  };

  return { sendText, sendVoice, sendImageOrVideo };
};
