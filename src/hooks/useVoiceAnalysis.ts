import { useState, useCallback } from "react";
import { postPresign, uploadFileToS3 } from "../api/onboarding/onboardingApi";
import { postVoiceAnalyze } from "../api/onboarding/voiceAnalyze";
import { useScoreStore } from "../stores/useScoreStore";
import { useUserStore } from "../stores/useUserStore";

export type VoiceAnalysisTheme = "intro" | "hobby" | "personality" | "ideal";

export const useVoiceAnalysis = (theme: VoiceAnalysisTheme = "intro") => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ✅ user 객체 가져오기 (여기에 userId가 들어있음)
  const { user, updateUser } = useUserStore();

  const {
    setScores,
    setPersonalities,
    setInterests,
    getPersonalities,
    getInterests,
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
          contentType: file.type || "audio/wav",
          purpose: theme === "intro" ? "PROFILE_INTRO_AUDIO" : "TEMP_RECORDING",
        });

        // 2. S3 업로드
        await uploadFileToS3(presignData.data.uploadUrl, file);

        // 3. 음성 분석 (Lambda) 호출
        // ✅ 수정: userId를 store에서 가져온 값으로 사용
        const analysisResult = await postVoiceAnalyze({
          userId: Number(user.userId), // Store에 있는 ID 사용
          audioUrl: presignData.data.fileUrl,
          language: "ko-KR",
        });

        // 4. 결과 매핑 및 스토어 저장
        const { keywordCandidates } = analysisResult;

        // (옵션) ScoreStore에는 원본 객체({text, score})를 저장해도 됨 (점수 계산용이면)
        if (theme === "intro") {
          setScores([keywordCandidates]);
        } else if (theme === "hobby") {
          setInterests(keywordCandidates.interests);
        } else {
          setPersonalities(keywordCandidates.personalities);
        }

        // ✅ UserStore 업데이트용 데이터 변환 (객체 -> 문자열)
        // Store의 updateUser는 string[]을 기대하므로 .text만 뽑아야 함
        const currentPersonalities = getPersonalities().map(
          (p: any) => p.text || p,
        );
        const currentInterests = getInterests().map((i: any) => i.text || i);

        // 5. 테마에 따른 유저 프로필 업데이트
        if (theme === "ideal") {
          updateUser({
            idealPersonalities: currentPersonalities,
          });
        } else if (theme === "personality") {
          updateUser({
            personalities: currentPersonalities,
          });
        } else if (theme === "hobby") {
          updateUser({
            keywords: currentInterests,
          });
        } else {
          // "intro" 테마
          updateUser({
            introAudioUrl: presignData.data.fileUrl,
            introText: analysisResult.summary,
            keywords: currentInterests,
            personalities: currentPersonalities,
          });
        }

        // 6. 결과 리턴 (컴포넌트에서 쓸 수 있도록 원본/변환 데이터 모두 리턴)
        return {
          audioUrl: presignData.data.fileUrl,
          summary: analysisResult.summary,
          vibeVector: analysisResult.vibeVector || [], // 없으면 빈배열

          // 컴포넌트 편의를 위해 여기서도 객체 그대로 리턴 (컴포넌트에서 .map 처리했으므로 호환됨)
          personalities: keywordCandidates.personalities,
          interests: keywordCandidates.interests,

          originalResponse: analysisResult,
        };
      } catch (error) {
        console.error(`${theme} 분석 오류:`, error);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [
      theme,
      user, // ✅ user 의존성 추가
      setScores,
      setPersonalities,
      setInterests,
      getPersonalities,
      getInterests,
      updateUser,
    ],
  );

  return {
    analyzeVoice,
    isAnalyzing,
  };
};
