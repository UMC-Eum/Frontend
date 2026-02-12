import { useState } from "react";
import { postPresign, uploadFileToS3 } from "../api/onboarding/onboardingApi";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await postPresign({
        fileName: file.name,
        contentType: file.type,
        purpose: "chat",
      });

      const { uploadUrl, fileUrl } = response.data;

      if (!uploadUrl) {
        throw new Error("Presigned URL 발급 실패");
      }

      await uploadFileToS3(uploadUrl, file);

      return fileUrl;
    } catch (error) {
      console.error("파일 업로드 프로세스 실패:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
