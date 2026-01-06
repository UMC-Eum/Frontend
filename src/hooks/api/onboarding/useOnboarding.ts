import { useState } from "react";
import {
  postPresign,
  uploadFileToS3,
  postAnalyze,
  postProfile,
} from "../../../api/onboarding/onboardingApi";
import type {
  IAnalyzeRequest,
  IAnalyzeResponse,
  IProfileRequest,
} from "../../../types/api/onboarding/onboardingDTO";
// 음성 업로드 훅
export const useVoiceUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadVoice = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1단계: Presigned URL 요청
      const presignData = await postPresign({
        fileName: file.name,
        contentType: file.type,
        purpose: "voice_profile", // 필요에 따라 파라미터로 받아도 됨
      });

      // 2단계: 실제 S3 업로드 (API 아님, Direct Upload)
      await uploadFileToS3(presignData.uploadUrl, file);

      // 성공 시, 다음 단계(분석)에서 쓸 fileUrl 반환
      return presignData.fileUrl;
    } catch (err) {
      setError(err as Error);
      console.error("Voice Upload Failed:", err);
      throw err; // 컴포넌트에서 catch 할 수 있게 throw
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadVoice, isLoading, error };
};

// 음성 분석 훅
export const useVoiceAnalyze = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IAnalyzeResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyzeVoice = async (req: IAnalyzeRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await postAnalyze(req);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeVoice, data, isLoading, error };
};

// 프로필 생성 훅
export const useCreateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProfile = async (req: IProfileRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await postProfile(req);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createProfile, isLoading, error };
};
