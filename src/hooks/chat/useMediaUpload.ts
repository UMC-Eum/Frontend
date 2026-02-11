import { useState } from "react";
import { postChatPresign, uploadFileToS3 } from "../../api/chats/chatsApi";

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // file: File 객체
  // 반환값: 업로드된 S3 URL(string) 또는 null
  const uploadMedia = async (file: File): Promise<string | null> => {
    setUploading(true);
    setProgress(0);
    try {
      const presign = await postChatPresign(file.name, file.type);
      // presign은 { data: { fileUrl, uploadUrl } } 구조여야 함
      if (!presign || !presign.data?.fileUrl || !presign.data?.uploadUrl) {
        throw new Error("presign 실패");
      }
      await uploadFileToS3(presign.data.uploadUrl, file);
      setUploading(false);
      setProgress(100);
      return presign.data.fileUrl;
    } catch (e) {
      setUploading(false);
      setProgress(0);
      return null;
    }
  };

  return { uploadMedia, uploading, progress };
}
