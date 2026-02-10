import { postPresign, uploadFileToS3 } from "../api/onboarding/onboardingApi";
import { postVoiceAnalyze } from "../api/onboarding/voiceAnalyze";
import { useUserStore } from "../stores/useUserStore"; // ✅ 유저 ID를 가져오기 위해 추가

// 1. 인자 타입 수정: analysisType 추가
interface ProcessParams {
  file: File;
  analysisType: "profile" | "ideal-type"; // 👈 핵심! 타입 강제
}

export const processVoiceAnalysis = async ({
  file,
  analysisType,
}: ProcessParams) => {
  // 0. 유저 ID 확보 (API 전송용)
  const userId = useUserStore.getState().user?.userId;
  if (!userId) {
    throw new Error("User ID가 없습니다. 로그인 상태를 확인해주세요.");
  }

  // 2. [티켓 발급]
  // 필요하다면 purpose도 analysisType에 따라 다르게 설정 가능
  // (백엔드에 별도 purpose가 없다면 "PROFILE_INTRO_AUDIO"로 통일)
  const purpose =
    analysisType === "profile" ? "PROFILE_INTRO_AUDIO" : "PROFILE_INTRO_AUDIO";

  const response = await postPresign({
    fileName: file.name,
    contentType: file.type,
    purpose: purpose,
  });

  const uploadUrl = response?.data?.uploadUrl;
  const fileUrl = response?.data?.fileUrl;

  console.log(`🔗 [${analysisType}] URL 발급 완료:`, { uploadUrl, fileUrl });

  if (!uploadUrl) {
    console.error("🚨 업로드 URL을 찾을 수 없습니다.");
    return;
  }

  // 3. [배송] S3 직접 업로드
  console.log("📤 S3 업로드 시작...");
  await uploadFileToS3(uploadUrl, file);
  console.log("✅ S3 업로드 성공!");

  // 4. [분석] 백엔드에 분석 요청 (analysisType 포함)
  const result = await postVoiceAnalyze({
    userId: Number(userId), // ✅ 유저 ID 포함
    audioUrl: fileUrl,
    language: "ko-KR",
    analysisType: analysisType, // ✅ 여기가 핵심! ("profile" or "ideal-type")
  });

  return result;
};
