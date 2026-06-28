import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "@/api/comments/commentsApi";
import * as DTO from "@/types/api/comments/commentsDTO";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_LIMIT = 20;

type InfiniteParams<T extends { cursor?: string | null; limit?: number }> = Omit<
  T,
  "cursor" | "limit"
> & {
  limit?: number;
};

export function useCommentsInfiniteQuery(
  clubId: number,
  articleId: number,
  params: InfiniteParams<DTO.ICommentsGetParams> = {},
  enabled = true,
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.comments.list(clubId, articleId, {
      ...restParams,
      limit,
    }),
    queryFn: ({ pageParam }) =>
      getComments(clubId, articleId, {
        ...restParams,
        cursor: pageParam,
        limit,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId) && Number.isFinite(articleId),
  });
}

export function useCreateCommentMutation(clubId: number, articleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.ICommentCreateRequest) =>
      createComment(clubId, articleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.all(clubId, articleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.articles.detail(clubId, articleId),
      });
    },
  });
}

export function useUpdateCommentMutation(
  clubId: number,
  articleId: number,
  commentId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.ICommentUpdateRequest) =>
      updateComment(clubId, articleId, commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.all(clubId, articleId),
      });
    },
  });
}

export function useDeleteCommentMutation(clubId: number, articleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(clubId, articleId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.all(clubId, articleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.articles.detail(clubId, articleId),
      });
    },
  });
}
