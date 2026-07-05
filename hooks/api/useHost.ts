import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteClub,
  getClubMembers,
  kickClubMember,
  pinHostClubArticle,
  updateClub,
  updateClubMemberAuthority,
  updateClubMemberStatus,
} from "@/api/host/hostApi";
import * as DTO from "@/types/api/host/hostDTO";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_LIMIT = 20;

type InfiniteParams<T extends { cursor?: string | null; limit?: number }> = Omit<
  T,
  "cursor" | "limit"
> & {
  limit?: number;
};

export function useClubMembersInfiniteQuery(
  clubId: number,
  params: InfiniteParams<DTO.IClubMembersParams> = {},
  enabled = true,
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.host.members(clubId, { ...restParams, limit }),
    queryFn: ({ pageParam }) =>
      getClubMembers(clubId, { ...restParams, cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useUpdateClubMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.IClubUpdateRequest) => updateClub(clubId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.club.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.host.all });
    },
  });
}

export function useDeleteClubMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: number) => deleteClub(clubId),
    onSuccess: (_data, clubId) => {
      // 삭제된 클럽의 상세/모임/멤버 등 하위 쿼리를 먼저 제거해 404 재조회를 막는다.
      queryClient.removeQueries({ queryKey: queryKeys.club.detail(clubId) });
      queryClient.removeQueries({ queryKey: queryKeys.host.club(clubId) });
      // 내 동호회/목록 등 나머지는 갱신이 필요하므로 무효화한다.
      // (removeQueries로 지운 상세 키는 옵저버가 없어 refetch되지 않는다.)
      queryClient.invalidateQueries({ queryKey: queryKeys.club.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.host.all });
    },
  });
}

export function useUpdateClubMemberStatusMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: number;
      body: DTO.IClubMemberStatusUpdateRequest;
    }) => updateClubMemberStatus(clubId, userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.host.membersBase(clubId) });
    },
  });
}

export function useUpdateClubMemberAuthorityMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: number;
      body: DTO.IClubMemberAuthorityUpdateRequest;
    }) => updateClubMemberAuthority(clubId, userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.host.membersBase(clubId) });
    },
  });
}

export function useKickClubMemberMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: number;
      body?: DTO.IClubMemberKickRequest;
    }) => kickClubMember(clubId, userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.host.membersBase(clubId) });
    },
  });
}

export function usePinHostClubArticleMutation(clubId: number, articleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.IHostArticlePinRequest) =>
      pinHostClubArticle(clubId, articleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all(clubId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.host.all });
    },
  });
}
