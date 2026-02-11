import { useState, useCallback } from "react";
import { postPresign, uploadFileToS3 } from "../api/onboarding/onboardingApi";
import { postVoiceAnalyze } from "../api/onboarding/voiceAnalyze";
import { useScoreStore } from "../stores/useScoreStore";
import { useUserStore } from "../stores/useUserStore";

export type VoiceAnalysisTheme = "intro" | "hobby" | "personality" | "ideal";

export const useVoiceAnalysis = (theme: VoiceAnalysisTheme = "intro") => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ✅ user 객체 가져오기 (여기에 userId가 들어있음)
  const { user } = useUserStore();

  const { 
    setScores, 
    setPersonalities, 
    setInterests, 
    setIdeal
  } = useScoreStore();

  const analyzeVoice = useCallback(
    async (file: File) => {
      setIsAnalyzing(true);
      try {
        // 0. 유저 ID 확인 (없으면 에러)
        if (!user?.userId) {
          throw new Error("로그인된 사용자 정보(userId)가 없습니다.");
        }

        // 1. Presign URL 발급
        const presignData = await postPresign({
          fileName: file.name,
          contentType: file.type,
          purpose: "PROFILE_INTRO_AUDIO",
        });

        // 2. S3 업로드
        await uploadFileToS3(presignData.data.uploadUrl, file);

        // 3. 음성 분석 (Lambda) 호출
        // ✅ 수정: userId를 store에서 가져온 값으로 사용
        const analysisResult = await postVoiceAnalyze({
          userId: Number(user.userId), // Store에 있는 ID 사용
          audioUrl: presignData.data.fileUrl,
          language: "ko-KR",
          analysisType: "profile"
        });

        // 4. 결과 매핑 및 스토어 저장
        const { keywordCandidates } = analysisResult;
        const currentPersonalities = keywordCandidates.personalities || [];
        const currentInterests = keywordCandidates.interests || [];

        // (옵션) ScoreStore에는 원본 객체({text, score})를 저장해도 됨 (점수 계산용이면)
        if (theme === "intro") {
          setScores([keywordCandidates]);
        } else if (theme === "hobby") {
          setInterests(currentInterests);
        } else if (theme === "personality") {
          setPersonalities(currentPersonalities);
        } else if (theme === "ideal") {
          setIdeal(currentPersonalities);
        }

        const personalities = (keywordCandidates.personalities || []).map(p => p.text);
        const interests = (keywordCandidates.interests || []).map(i => i.text);

        return {
          audioUrl: presignData.data.fileUrl, 
          transcript: analysisResult.transcript,
          vibeVector: analysisResult.vibeVector,
          personalities,
          interests,
          originalResponse: analysisResult,
        };
      } catch (error) {
        console.error(`${theme} 분석 오류:`, error);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [theme, user, setScores, setPersonalities, setInterests],
  );

  return {
    analyzeVoice,
    isAnalyzing,
  };
};
