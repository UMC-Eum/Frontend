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

export const useOnboarding = () => {
  /* ===============================
   * 1. Voice Upload
   * =============================== */
  const useVoiceUpload = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const uploadVoice = async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        // 1) Presigned URL 요청
        const presignData = await postPresign({
          fileName: file.name,
          contentType: file.type,
          purpose: "voice_profile",
        });

        // 2) S3 Direct Upload
        await uploadFileToS3(presignData.uploadUrl, file);

        // 다음 단계에서 사용할 fileUrl 반환
        return presignData.fileUrl;
      } catch (err) {
        setError(err as Error);
        console.error("Voice Upload Failed:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    return { uploadVoice, isLoading, error };
  };

  /* ===============================
   * 2. Voice Analyze
   * =============================== */
  const useVoiceAnalyze = () => {
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

  /* ===============================
   * 3. Create Profile
   * =============================== */
  const useCreateProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createProfile = async (req: IProfileRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        return await postProfile(req);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    return { createProfile, isLoading, error };
  };

  return {
    useVoiceUpload,
    useVoiceAnalyze,
    useCreateProfile,
  };
};
