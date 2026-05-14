import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deactivateUser,
  getMyProfile,
  putIdealPersonalities,
  putInterestKeywords,
  putPersonalities,
  updateMyProfile,
} from "@/api/users/usersApi";
import { IPatchUserProfileRequest, IKeywordsRequest, IPutIdealRequest } from "@/types/api/users/usersDTO";

import { queryKeys } from "./queryKeys";

export function useMyProfileQuery() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMyProfile,
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IPatchUserProfileRequest) => updateMyProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

export function useDeactivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function usePutInterestKeywordsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IKeywordsRequest) => putInterestKeywords(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

export function usePutPersonalitiesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IKeywordsRequest) => putPersonalities(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

export function usePutIdealPersonalitiesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IPutIdealRequest) => putIdealPersonalities(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
