import { useState } from "react";
// 경로에 맞춰 import 해주세요
import { postPresign, uploadFileToS3 } from "../api/onboarding/onboardingApi"; 

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      console.log("🚀 1. Presigned URL 요청 중...");
      
      // 🔥 [수정] 인터페이스에 맞춰 필드명 변경
      const response = await postPresign({
        fileName: file.name,
        contentType: file.type, // fileType -> contentType
        purpose: "chat",        // usage -> purpose (채팅용)
      });

      // 응답 구조 확인: response.data 안에 uploadUrl이 있음
      const { uploadUrl, fileUrl } = response.data;

      if (!uploadUrl) {
        throw new Error("Presigned URL 발급 실패");
      }

      console.log("🚀 2. S3 업로드 시작...", uploadUrl);

      // S3에 업로드
      await uploadFileToS3(uploadUrl, file);

      console.log("✅ 3. 업로드 완료! fileUrl:", fileUrl);
      
      // 소켓 전송용 Clean URL 반환
      return fileUrl; 

    } catch (error) {
      console.error("❌ 파일 업로드 프로세스 실패:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};