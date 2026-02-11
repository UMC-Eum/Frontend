import { useState } from "react";
import {
  postChatMediaPresign,
  uploadChatFileToS3,
} from "../../api/chats/chatsApi";

type UploadResult = {
  mediaRef: string;
  publicUrl: string;
};

// S3 업로드 URL로부터 Public 접근 가능한 URL 추출
const buildPublicUrl = (uploadUrl: string) => {
  try {
    const parsed = new URL(uploadUrl);
    // 쿼리 파라미터를 제외한 프로토콜+호스트+경로만 추출
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return "";
  }
};

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadMedia = async (
    file: File,
    chatRoomId: number,
  ): Promise<UploadResult | null> => {
    setUploading(true);
    setProgress(0);

    try {
      // 1. Presigned URL 발급
      const presignData = await postChatMediaPresign(chatRoomId, file);

      if (!presignData || !presignData.uploadUrl) {
        throw new Error("Presigned URL 발급 실패");
      }

      // 2. S3 실제 업로드
      await uploadChatFileToS3(presignData, file);

      setUploading(false);
      setProgress(100);

      // 3. 결과값 구성
      const mediaRef = presignData.mediaRef;
      const publicUrl = buildPublicUrl(presignData.uploadUrl);

      return { mediaRef, publicUrl };
    } catch (e) {
      console.error("미디어 업로드 에러:", e);
      setUploading(false);
      return null;
    }
  };

  return { uploadMedia, uploading, progress };
}
