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

  // 💡 [핵심 수정 포인트] S3와 FFmpeg가 헷갈리지 않게 기기별 맞춤 파일로 재포장!
  const actualType = file.type || "audio/mp4"; // iOS 사파리 버그로 타입이 비어있으면 강제 할당
  let extension = "webm"; // 기본값 (안드로이드, PC)

  if (actualType.includes("mp4") || actualType.includes("m4a")) {
    extension = "m4a"; // 아이폰(Safari/Chrome)일 경우 m4a 확장자 사용!
  } else if (actualType.includes("mpeg")) {
    extension = "mp3";
  }

  const safeFileName = `${Date.now()}_voice_record.${extension}`;

  // 이름과 타입이 완벽하게 일치하는 새로운 File 객체 생성
  const safeFile = new File([file], safeFileName, { type: actualType });
  // ---------------------------------------------------------

  const purpose =
    analysisType === "profile" ? "PROFILE_INTRO_AUDIO" : "PROFILE_INTRO_AUDIO";

  // 기존 file 대신 safeFile의 정보로 Presigned URL 요청
  const response = await postPresign({
    fileName: safeFile.name,
    contentType: safeFile.type,
    purpose: purpose,
  });

  const uploadUrl = response?.data?.uploadUrl;
  const fileUrl = response?.data?.fileUrl;

  if (!uploadUrl) {
    console.error("업로드 URL을 찾을 수 없습니다.");
    return;
  }

  // 기존 file 대신 safeFile 객체를 넘겨서 업로드
  await uploadFileToS3(uploadUrl, safeFile);

  const result = await postVoiceAnalyze({
    userId: Number(userId),
    audioUrl: fileUrl,
    language: "ko-KR",
    analysisType: analysisType,
  });

  return result;
};
