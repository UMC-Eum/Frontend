import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  postPresign,
  postProfile,
  putIdealPersonalities,
  uploadFileToS3,
} from "@/api/onboarding/onboardingApi";
import { postVoiceAnalyze } from "@/api/onboarding/voiceAnalyze";
import {
  IPresignRequest,
  IProfileRequest,
} from "@/types/api/onboarding/onboardingDTO";

import { queryKeys } from "./queryKeys";

export function usePresignMutation() {
  return useMutation({
    mutationFn: (body: IPresignRequest) => postPresign(body),
  });
}

export function useUploadFileToS3Mutation() {
  return useMutation({
    mutationFn: ({ uploadUrl, file }: { uploadUrl: string; file: Blob }) =>
      uploadFileToS3(uploadUrl, file),
  });
}

export function usePostProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IProfileRequest) => postProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.profile() });
    },
  });
}

export function usePostVoiceAnalyzeMutation() {
  return useMutation({
    mutationFn: postVoiceAnalyze,
  });
}

export function usePutOnboardingIdealPersonalitiesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { personalityIds: string[] }) =>
      putIdealPersonalities(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboarding.idealPersonalities(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
