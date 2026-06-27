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
    onSuccess: () => {
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
