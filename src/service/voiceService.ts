import {
  postPresign,
  uploadFileToS3,
  postAnalyze,
} from "../api/onboarding/onboardingApi";

interface ProcessParams {
  file: File;
  userId: number;
}

export const processVoiceAnalysis = async ({ file, userId }: ProcessParams) => {
  // 1. [티켓 발급] Presigned URL 요청
  const presignData = await postPresign({
    fileName: file.name,
    contentType: file.type,
    purpose: "ONBOARDING_VOICE", // 백엔드 약속된 값
  });

  // 2. [배송] S3 직접 업로드
  await uploadFileToS3(presignData.uploadUrl, file);

  // 3. [분석] 백엔드에 분석 요청
  const result = await postAnalyze({
    userId: userId,
    audioUrl: presignData.fileUrl,
    language: "ko-KR",
  });

  return result; // 최종 결과 반환
};
