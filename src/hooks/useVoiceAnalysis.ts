import { useState, useCallback } from "react";
import { postPresign, uploadFileToS3 } from "../api/onboarding/onboardingApi";
import { postVoiceAnalyze } from "../api/onboarding/voiceAnalyze";
import { useScoreStore } from "../stores/useScoreStore";
import { useUserStore } from "../stores/useUserStore";

export type VoiceAnalysisTheme = "intro" | "hobby" | "personality" | "ideal";

export const useVoiceAnalysis = (theme: VoiceAnalysisTheme = "intro") => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { user } = useUserStore();

  const { setScores, setPersonalities, setInterests, setIdeal } =
    useScoreStore();

  const analyzeVoice = useCallback(
    async (file: File) => {
      setIsAnalyzing(true);
      try {
        if (!user?.userId) {
          throw new Error("로그인된 사용자 정보(userId)가 없습니다.");
        }

        const presignData = await postPresign({
          fileName: file.name,
          contentType: file.type,
          purpose: "PROFILE_INTRO_AUDIO",
        });

        await uploadFileToS3(presignData.data.uploadUrl, file);

        const analysisResult = await postVoiceAnalyze({
          userId: Number(user.userId),
          audioUrl: presignData.data.fileUrl,
          language: "ko-KR",
          analysisType: "profile",
        });

        const { keywordCandidates } = analysisResult;
        const currentPersonalities = keywordCandidates.personalities || [];
        const currentInterests = keywordCandidates.interests || [];

        if (theme === "intro") {
          setScores([keywordCandidates]);
        } else if (theme === "hobby") {
          setInterests(currentInterests);
        } else if (theme === "personality") {
          setPersonalities(currentPersonalities);
        } else if (theme === "ideal") {
          setIdeal(currentPersonalities);
        }

        const personalities = (keywordCandidates.personalities || []).map(
          (p) => p.text,
        );
        const interests = (keywordCandidates.interests || []).map(
          (i) => i.text,
        );

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
