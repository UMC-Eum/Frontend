import { postPresign, uploadFileToS3 } from "../api/onboarding/onboardingApi";
import { postVoiceAnalyze } from "../api/onboarding/voiceAnalyze";
import { useUserStore } from "../stores/useUserStore";

interface ProcessParams {
  file: File;
  analysisType: "profile" | "ideal-type";
}

export const processVoiceAnalysis = async ({
  file,
  analysisType,
}: ProcessParams) => {
  const userId = useUserStore.getState().user?.userId;
  if (!userId) {
    throw new Error("User ID가 없습니다. 로그인 상태를 확인해주세요.");
  }

  const purpose =
    analysisType === "profile" ? "PROFILE_INTRO_AUDIO" : "PROFILE_INTRO_AUDIO";

  const response = await postPresign({
    fileName: file.name,
    contentType: file.type,
    purpose: purpose,
  });

  const uploadUrl = response?.data?.uploadUrl;
  const fileUrl = response?.data?.fileUrl;

  if (!uploadUrl) {
    console.error("업로드 URL을 찾을 수 없습니다.");
    return;
  }

  await uploadFileToS3(uploadUrl, file);

  const result = await postVoiceAnalyze({
    userId: Number(userId),
    audioUrl: fileUrl,
    language: "ko-KR",
    analysisType: analysisType,
  });

  return result;
};
