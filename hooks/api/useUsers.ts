import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProfileVisit,
  deactivateUser,
  getMyIdealVoice,
  getMyNotificationSettings,
  getMyProfile,
  getMyProfileVisitors,
  putIdealPersonalities,
  putInterestKeywords,
  putPersonalities,
  updateMyNotificationSettings,
  updateMyProfile,
} from "@/api/users/usersApi";
import { useAuthStore } from "@/stores/authStore";
import {
  IKeywordsRequest,
  INotificationSettingsPatchRequest,
  IPatchUserProfileRequest,
  IPutIdealRequest,
} from "@/types/api/users/usersDTO";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_SIZE = 20;

export function useMyProfileQuery() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMyProfile,
  });
}

export function useMyProfileVisitorsInfiniteQuery(size = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: queryKeys.users.visitors(size),
    queryFn: ({ pageParam }) =>
      getMyProfileVisitors({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useCreateProfileVisitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => createProfileVisit(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.visitors(DEFAULT_PAGE_SIZE) });
    },
  });
}

export function useMyIdealVoiceQuery() {
  return useQuery({
    queryKey: queryKeys.users.idealVoice(),
    queryFn: getMyIdealVoice,
  });
}

export function useMyNotificationSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.users.notificationSettings(),
    queryFn: getMyNotificationSettings,
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
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      clearAuth();
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

export function useUpdateMyNotificationSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: INotificationSettingsPatchRequest) =>
      updateMyNotificationSettings(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.notificationSettings(),
      });
    },
  });
}
