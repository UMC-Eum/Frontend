import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  blockUser,
  createArticleReport,
  createClubReport,
  createCommentReport,
  createReport,
  getBlocks,
  getReceivedHearts,
  getSentHearts,
  patchBlock,
  patchHeart,
  sendHeart,
} from "@/api/socials/socialsApi";
import {
  IBlocksRequest,
  IClubReportRequest,
  IReportsRequest,
} from "@/types/api/socials/socialsDTO";

import { queryKeys } from "./queryKeys";
import { useProtectedQueryEnabled } from "./useProtectedQueryEnabled";

const DEFAULT_PAGE_SIZE = 20;

type InfiniteQueryBehaviorOptions = {
  enabled?: boolean;
  staleTime?: number;
  refetchOnMount?: boolean | "always";
};

export function useReceivedHeartsInfiniteQuery(
  size = DEFAULT_PAGE_SIZE,
  options: InfiniteQueryBehaviorOptions = {},
) {
  const { enabled = true, ...queryOptions } = options;
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useInfiniteQuery({
    queryKey: queryKeys.socials.hearts.received(size),
    queryFn: ({ pageParam }) => getReceivedHearts({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...queryOptions,
    enabled: queryEnabled,
  });
}

export function useSentHeartsInfiniteQuery(
  size = DEFAULT_PAGE_SIZE,
  options: InfiniteQueryBehaviorOptions = {},
) {
  const { enabled = true, ...queryOptions } = options;
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useInfiniteQuery({
    queryKey: queryKeys.socials.hearts.sent(size),
    queryFn: ({ pageParam }) => getSentHearts({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...queryOptions,
    enabled: queryEnabled,
  });
}

export function useSendHeartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: number) => sendHeart({ targetUserId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.socials.hearts.all() }),
  });
}

export function usePatchHeartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (heartId: number) => patchHeart(heartId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.socials.hearts.all() }),
  });
}

export function useBlocksInfiniteQuery(
  size = DEFAULT_PAGE_SIZE,
  options: InfiniteQueryBehaviorOptions = {},
) {
  const { enabled = true, ...queryOptions } = options;
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useInfiniteQuery({
    queryKey: queryKeys.socials.blocks(size),
    queryFn: ({ pageParam }) => getBlocks({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...queryOptions,
    enabled: queryEnabled,
  });
}

export function useBlockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IBlocksRequest) => blockUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.socials.all });
    },
  });
}

export function usePatchBlockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: number) => patchBlock(blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.socials.all });
    },
  });
}

export function useCreateReportMutation() {
  return useMutation({
    mutationFn: (body: IReportsRequest) => createReport(body),
  });
}

export function useCreateClubReportMutation(clubId: number) {
  return useMutation({
    mutationFn: (body: IClubReportRequest) => createClubReport(clubId, body),
  });
}

export function useCreateArticleReportMutation(
  clubId: number,
  articleId: number,
) {
  return useMutation({
    mutationFn: (body: IClubReportRequest) =>
      createArticleReport(clubId, articleId, body),
  });
}

export function useCreateCommentReportMutation(
  clubId: number,
  articleId: number,
  commentId: number,
) {
  return useMutation({
    mutationFn: (body: IClubReportRequest) =>
      createCommentReport(clubId, articleId, commentId, body),
  });
}
