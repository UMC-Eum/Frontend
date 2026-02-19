import { useSocketStore } from "../../stores/useSocketStore";
import { useMediaUpload } from "./useMediaUpload";
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO";

type IMessageItem = IChatsRoomIdMessagesGetResponse["items"][number];

/**
 * 아이폰/안드로이드 기기에 따라 실제 파일 타입을 체크하고
 * 적절한 확장자를 가진 파일 객체로 변환해주는 헬퍼 함수
 */
const getSafeAudioFile = (file: File): File => {
  // 실제 MIME 타입 확인 (아이폰은 보통 audio/mp4)
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

  // 새로운 파일 객체로 재포장하여 반환
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

  // 임시 URL을 실제 S3 URL로 교체
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

  // 2. 음성 전송 (수정됨 ⭐)
  const sendVoice = async (file: File, duration: number) => {
    if (!roomId) return;

    // 💡 [수정] 기기별 확장자 세탁 로직 적용
    const safeFile = getSafeAudioFile(file);

    // 미리보기용 Blob URL 생성
    const fakeUrl = URL.createObjectURL(safeFile);
    addTempMessage("AUDIO", null, fakeUrl, duration);

    // 💡 [수정] 세탁된 safeFile을 S3에 업로드
    const uploadResult = await uploadMedia(safeFile, roomId);

    if (uploadResult) {
      // 임시 URL을 실제 S3 Public URL로 교체하여 즉시 렌더링
      replaceTempMediaUrl(fakeUrl, uploadResult.publicUrl);
      // 백엔드 소켓에는 DB 참조용 mediaRef를 전송
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
