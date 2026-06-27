import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createArticle,
  deleteArticle,
  getArticleArchive,
  getArticleDetail,
  getArticles,
  likeArticle,
  pinArticle,
  unlikeArticle,
  updateArticle,
} from "@/api/articles/articlesApi";
import * as DTO from "@/types/api/articles/articlesDTO";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_LIMIT = 20;

type InfiniteParams<T extends { cursor?: string | null; limit?: number }> = Omit<
  T,
  "cursor" | "limit"
> & {
  limit?: number;
};

export function useArticlesInfiniteQuery(
  clubId: number,
  params: InfiniteParams<DTO.IArticlesGetParams> = {},
  enabled = true,
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.articles.list(clubId, { ...restParams, limit }),
    queryFn: ({ pageParam }) =>
      getArticles(clubId, { ...restParams, cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useArticleDetailQuery(
  clubId: number,
  articleId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.articles.detail(clubId, articleId),
    queryFn: () => getArticleDetail(clubId, articleId),
    enabled: enabled && Number.isFinite(clubId) && Number.isFinite(articleId),
  });
}

export function useArticleArchiveInfiniteQuery(
  clubId: number,
  params: InfiniteParams<DTO.IArticleArchiveParams> = {},
  enabled = true,
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.articles.archive(clubId, { ...restParams, limit }),
    queryFn: ({ pageParam }) =>
      getArticleArchive(clubId, { ...restParams, cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useCreateArticleMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.IArticleCreateRequest) => createArticle(clubId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all(clubId) });
    },
  });
}

export function useUpdateArticleMutation(clubId: number, articleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.IArticleUpdateRequest) =>
      updateArticle(clubId, articleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all(clubId) });
    },
  });
}

export function useDeleteArticleMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: number) => deleteArticle(clubId, articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all(clubId) });
    },
  });
}

export function useLikeArticleMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: number) => likeArticle(clubId, articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all(clubId) });
    },
  });
}

export function useUnlikeArticleMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: number) => unlikeArticle(clubId, articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all(clubId) });
    },
  });
}

export function usePinArticleMutation(clubId: number, articleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.IArticlePinRequest) =>
      pinArticle(clubId, articleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all(clubId) });
    },
  });
}
