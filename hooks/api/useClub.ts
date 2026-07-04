import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createClub,
  getClubArchives,
  getClubDetail,
  getClubs,
  getMyClubs,
  getRecommendedClubs,
  getTopHosts,
  joinClub,
  leaveClub,
  likeClub,
  unlikeClub,
} from "@/api/club/clubApi";
import * as DTO from "@/types/api/club/clubDTO";

import { queryKeys } from "./queryKeys";
import { useProtectedQueryEnabled } from "./useProtectedQueryEnabled";

const DEFAULT_PAGE_LIMIT = 20;

type InfiniteParams<T extends { cursor?: string | null; limit?: number }> = Omit<
  T,
  "cursor" | "limit"
> & {
  limit?: number;
};

export function useClubsInfiniteQuery(
  params: InfiniteParams<DTO.IClubListParams> = {},
  enabled = true,
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.club.list({ ...restParams, limit }),
    queryFn: ({ pageParam }) =>
      getClubs({ ...restParams, cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
}

export function useClubDetailQuery(clubId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.club.detail(clubId),
    queryFn: () => getClubDetail(clubId),
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useRecommendedClubsQuery() {
  return useQuery({
    queryKey: queryKeys.club.recommended(),
    queryFn: getRecommendedClubs,
  });
}

export function useTopHostsQuery(limit = 10) {
  return useQuery({
    queryKey: queryKeys.club.topHosts(limit),
    queryFn: () => getTopHosts({ limit }),
  });
}

export function useMyClubsInfiniteQuery(
  params: InfiniteParams<DTO.IMyClubsParams> = {},
  enabled = true,
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useInfiniteQuery({
    queryKey: queryKeys.club.my({ ...restParams, limit }),
    queryFn: ({ pageParam }) =>
      getMyClubs({ ...restParams, cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: queryEnabled,
  });
}

export function useClubArchivesInfiniteQuery(
  clubId: number,
  params: InfiniteParams<DTO.IClubArchiveParams> = {},
  enabled = true,
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.club.archives(clubId, { ...restParams, limit }),
    queryFn: ({ pageParam }) =>
      getClubArchives(clubId, { ...restParams, cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useCreateClubMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.IClubCreateRequest) => createClub(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.club.all });
    },
  });
}

export function useJoinClubMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.IClubJoinRequest = {}) => joinClub(clubId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.club.all });
    },
  });
}

export function useLeaveClubMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: number) => leaveClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.club.all });
    },
  });
}

export function useLikeClubMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: number) => likeClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.club.all });
    },
  });
}

export function useUnlikeClubMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: number) => unlikeClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.club.all });
    },
  });
}
