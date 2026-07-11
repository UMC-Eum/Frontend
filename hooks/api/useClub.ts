import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import {
  clearRecentClubSearches,
  createClub,
  deleteRecentClubSearch,
  getClubArchives,
  getClubDetail,
  getClubs,
  getMyClubs,
  getRecentClubSearches,
  getRecommendedClubs,
  getTodayRecommendedClubs,
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

export function useRecommendedClubsQuery(
  params: DTO.IRecommendedClubsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.club.recommended(params),
    queryFn: () => getRecommendedClubs(params),
    enabled,
  });
}

export function useTodayRecommendedClubsQuery(limit = 10) {
  return useQuery({
    queryKey: queryKeys.club.todayRecommended(limit),
    queryFn: () => getTodayRecommendedClubs({ limit }),
  });
}

export function useTopHostsQuery(limit = 10) {
  return useQuery({
    queryKey: queryKeys.club.topHosts(limit),
    queryFn: () => getTopHosts({ limit }),
  });
}

export function useMyClubsQuery(
  enabled = true,
  options: { includeInactive?: boolean } = {},
) {
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useQuery({
    queryKey: queryKeys.club.my(),
    queryFn: getMyClubs,
    enabled: queryEnabled,
    select: options.includeInactive
      ? undefined
      : (data) => ({
          ...data,
          items: data.items.filter((club) => club.status === "ACTIVE"),
        }),
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
    mutationFn: (body: DTO.IClubJoinRequest) => joinClub(clubId, body),
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

// 캐시된 응답(목록/추천/내 동호회 등)을 훑어 해당 클럽의 썸네일 URL을 찾는다.
function findClubThumbnail(value: unknown, clubId: number): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findClubThumbnail(item, clubId);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.clubId === clubId && typeof record.thumbnailUrl === "string") {
      return record.thumbnailUrl;
    }
    for (const nested of Object.values(record)) {
      const found = findClubThumbnail(nested, clubId);
      if (found) return found;
    }
  }
  return null;
}

// 상세 응답을 기다리는 동안 목록 캐시에 이미 있는 썸네일을 먼저 보여준다.
// 목록에서 같은 URL을 이미 렌더링했으므로 이미지 디스크 캐시에도 있어 즉시 뜬다.
export function useCachedClubThumbnail(clubId: number): string | null {
  const queryClient = useQueryClient();

  return useMemo(() => {
    if (!Number.isFinite(clubId)) return null;
    for (const query of queryClient
      .getQueryCache()
      .findAll({ queryKey: queryKeys.club.all })) {
      const found = findClubThumbnail(query.state.data, clubId);
      if (found) return found;
    }
    return null;
  }, [queryClient, clubId]);
}

export function useRecentClubSearchesQuery(enabled = true) {
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useQuery({
    queryKey: queryKeys.club.recentSearches(),
    queryFn: getRecentClubSearches,
    enabled: queryEnabled,
  });
}

export function useDeleteRecentClubSearchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyword: string) => deleteRecentClubSearch(keyword),
    onSuccess: (_data, keyword) => {
      queryClient.setQueryData<DTO.IRecentClubSearchesResponse>(
        queryKeys.club.recentSearches(),
        (current) =>
          current && {
            keywords: current.keywords.filter((item) => item !== keyword),
          },
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.club.recentSearches(),
      });
    },
  });
}

export function useClearRecentClubSearchesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearRecentClubSearches,
    onSuccess: () => {
      queryClient.setQueryData<DTO.IRecentClubSearchesResponse>(
        queryKeys.club.recentSearches(),
        { keywords: [] },
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.club.recentSearches(),
      });
    },
  });
}
