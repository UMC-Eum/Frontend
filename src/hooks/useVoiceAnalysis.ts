//1. 무엇을 녹음할건지(취미인가? 성격인가? 이상형인가?)
//2. 분석된 녹음 파일을 어떻게 할지(프로필 확정 생성 API).

import { useState, useCallback } from "react";
import { postPresign, uploadFileToS3 } from "../api/onboarding/onboardingApi";
import { postVoiceAnalyze } from "../api/onboarding/voiceAnalyze";
import { useScoreStore } from "../stores/useScoreStore";

export type VoiceAnalysisTheme = "intro" | "hobby" | "personality" | "ideal";

export const useVoiceAnalysis = (theme: VoiceAnalysisTheme = "intro") => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { 
    setScores, 
    setPersonalities, 
    setInterests, 
    setIdeal
  } = useScoreStore();

  /**
   * 녹음된 파일을 S3에 업로드하고 Lambda를 통해 음성 분석을 수행합니다.
   * @param file 녹음된 오디오 파일
   * @returns 분석 결과 (URL, 요약본, 키워드 등)
   */
  const analyzeVoice = useCallback(
    async (file: File) => {
      setIsAnalyzing(true);
      try {
        // 1. Presign URL 발급
        const presignData = await postPresign({
          fileName: file.name,
          contentType: file.type,
          purpose: "PROFILE_INTRO_AUDIO",
        });

        // 2. S3 업로드
        await uploadFileToS3(presignData.data.uploadUrl, file);

        // 3. 음성 분석 (Lambda) 호출
        const analysisResult = await postVoiceAnalyze({
          audioUrl: presignData.data.fileUrl,
          language: "ko-KR",
        });

        // 4. 결과 매핑 및 스토어 저장
        const { keywordCandidates } = analysisResult;
        const currentPersonalities = keywordCandidates.personalities || [];
        const currentInterests = keywordCandidates.interests || [];

        // 테마에 따라 필요한 키워드군만 별도로 업데이트하여 데이터 오염 방지
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
          summary: analysisResult.summary,
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
    [theme, setScores, setPersonalities, setInterests],
  );

  return {
    analyzeVoice,
    isAnalyzing,
  };
};