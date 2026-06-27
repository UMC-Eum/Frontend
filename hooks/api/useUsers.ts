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
  getMyProfileVisitors,
  getMyProfile,
  putIdealPersonalities,
  putInterestKeywords,
  putPersonalities,
  updateMyProfile,
} from "@/api/users/usersApi";
import { useAuthStore } from "@/stores/authStore";
import {
  IKeywordsRequest,
  ILikedClubsParams,
  IMyProfileVisitorsRequest,
  IPatchUserProfileRequest,
  IPutIdealRequest,
} from "@/types/api/users/usersDTO";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_LIMIT = 20;

type InfiniteParams<T extends { cursor?: string | null; limit?: number }> = Omit<
  T,
  "cursor" | "limit"
> & {
  limit?: number;
};

export function useMyProfileQuery() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMyProfile,
  });
}

export function useMyProfileVisitorsQuery(
  params: IMyProfileVisitorsRequest = {},
) {
  return useQuery({
    queryKey: queryKeys.users.visitors(params),
    queryFn: () => getMyProfileVisitors(params),
  });
}

export function useLikedClubsInfiniteQuery(
  params: InfiniteParams<ILikedClubsParams> = {},
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.users.likedClubs({ ...restParams, limit }),
    queryFn: ({ pageParam }) =>
      getLikedClubs({ ...restParams, cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
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

export function useCreateProfileVisitMutation() {
  return useMutation({
    mutationFn: (userId: number) => createProfileVisit(userId),
  });
}
