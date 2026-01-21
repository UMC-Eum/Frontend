import { postPresign, uploadFileToS3 } from "../api/onboarding/onboardingApi";
import { postVoiceAnalyze } from "../api/onboarding/voiceAnalyze";
interface ProcessParams {
  file: File;
}
export const processVoiceAnalysis = async ({ file }: ProcessParams) => {
  // 1. [티켓 발급]
  const response = await postPresign({
    fileName: file.name,
    contentType: file.type,
    purpose: "PROFILE_INTRO_AUDIO",
  });

  const uploadUrl = response?.data?.uploadUrl;
  const fileUrl = response?.data?.fileUrl;

  console.log("🔗 진짜 주소 확인:", { uploadUrl, fileUrl });

  if (!uploadUrl) {
    console.error(
      "🚨 여전히 주소를 못 찾았습니다. response 구조를 다시 확인하세요.",
    );
    return;
  }

  // 2. [배송] S3 직접 업로드
  console.log("📤 S3 업로드 시작...");
  await uploadFileToS3(uploadUrl, file);
  console.log("✅ S3 업로드 성공!");

  // 3. [분석] 백엔드에 분석 요청
  const result = await postVoiceAnalyze({
    audioUrl: fileUrl,
    language: "ko-KR",
  });

  return result;
};
