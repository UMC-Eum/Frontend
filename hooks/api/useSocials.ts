import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  blockUser,
  createReport,
  getBlocks,
  getReceivedHearts,
  getSentHearts,
  patchBlock,
  patchHeart,
  sendHeart,
} from "@/api/socials/socialsApi";
import { IBlocksRequest, IReportsRequest } from "@/types/api/socials/socialsDTO";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_SIZE = 20;

type InfiniteQueryBehaviorOptions = {
  staleTime?: number;
  refetchOnMount?: boolean | "always";
};

export function useReceivedHeartsInfiniteQuery(
  size = DEFAULT_PAGE_SIZE,
  options: InfiniteQueryBehaviorOptions = {},
) {
  return useInfiniteQuery({
    queryKey: queryKeys.socials.hearts.received(size),
    queryFn: ({ pageParam }) => getReceivedHearts({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...options,
  });
}

export function useSentHeartsInfiniteQuery(
  size = DEFAULT_PAGE_SIZE,
  options: InfiniteQueryBehaviorOptions = {},
) {
  return useInfiniteQuery({
    queryKey: queryKeys.socials.hearts.sent(size),
    queryFn: ({ pageParam }) => getSentHearts({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...options,
  });
}

export function useSendHeartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: number) => sendHeart({ targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.socials.hearts.all() });
    },
  });
}

export function usePatchHeartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (heartId: number) => patchHeart(heartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.socials.hearts.all() });
    },
  });
}

export function useBlocksInfiniteQuery(size = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: queryKeys.socials.blocks(size),
    queryFn: ({ pageParam }) => getBlocks({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
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
