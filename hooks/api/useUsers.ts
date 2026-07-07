import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProfileVisit,
  deactivateUser,
  getLikedClubs,
  getMyProfile,
  getMyProfileVisitors,
  getUserProfile,
  putIdealPersonalities,
  putInterestKeywords,
  putPersonalities,
  updateMyProfile,
} from "@/api/users/usersApi";
import { useAuthStore } from "@/stores/authStore";
import { removePushTokenFromServer } from "@/utils/pushNotifications";
import {
  IKeywordsRequest,
  ILikedClubsParams,
  IMyProfileVisitorsRequest,
  IPatchUserProfileRequest,
  IPutIdealRequest,
} from "@/types/api/users/usersDTO";

import { queryKeys } from "./queryKeys";
import { useProtectedQueryEnabled } from "./useProtectedQueryEnabled";

const DEFAULT_PAGE_LIMIT = 20;

type InfiniteParams<T extends { cursor?: string | null; limit?: number }> = Omit<
  T,
  "cursor" | "limit"
> & {
  limit?: number;
};

export function useMyProfileQuery(enabled = true) {
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMyProfile,
    enabled: queryEnabled,
  });
}

export function useUserProfileQuery(userId: number | null) {
  const enabled = typeof userId === "number" && Number.isFinite(userId) && userId > 0;

  return useQuery({
    queryKey: enabled
      ? queryKeys.users.detail(userId)
      : [...queryKeys.users.all, "detail", "unknown"],
    queryFn: () => getUserProfile(userId ?? 0),
    enabled,
  });
}

export function useMyProfileVisitorsQuery(
  params: IMyProfileVisitorsRequest = {},
  enabled = true,
) {
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useQuery({
    queryKey: queryKeys.users.visitors(params),
    queryFn: () => getMyProfileVisitors(params),
    enabled: queryEnabled,
  });
}

export function useLikedClubsInfiniteQuery(
  params: InfiniteParams<ILikedClubsParams> = {},
  enabled = true,
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useInfiniteQuery({
    queryKey: queryKeys.users.likedClubs({ ...restParams, limit }),
    queryFn: ({ pageParam }) =>
      getLikedClubs({ ...restParams, cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: queryEnabled,
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
    // 인증이 남아있을 때 푸시 토큰 먼저 해제한 뒤 탈퇴
    mutationFn: async () => {
      await removePushTokenFromServer();
      return deactivateUser();
    },
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

export function useCreateProfileVisitMutation() {
  return useMutation({
    mutationFn: (userId: number) => createProfileVisit(userId),
  });
}
