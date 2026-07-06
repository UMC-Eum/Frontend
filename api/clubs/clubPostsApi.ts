import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import type {
  IArticleLikeResponse,
  IArticleResponse,
} from "../../types/api/articles/articlesDTO";
import { normalizeS3ObjectRefs } from "@/utils/s3ObjectRef";
import type {
  ICommentItem,
  ICommentsGetResponse,
} from "../../types/api/comments/commentsDTO";
import * as DTO from "../../types/api/clubs/clubPostsDTO";

export const getClubPosts = async (
  clubId: number,
  params: DTO.IClubPostsGetRequest,
) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubPostsGetResponse>
  >(`/v1/clubs/${clubId}/articles`, { params });
  return data.success.data;
};

export const createClubPost = async (
  clubId: number,
  body: DTO.IClubPostCreateRequest,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IClubPostCreateResponse>
  >(`/v1/clubs/${clubId}/articles`, {
    ...body,
    imageUrls: normalizeS3ObjectRefs(body.imageUrls),
  });
  return data.success.data;
};

export const getClubPostDetail = async (clubId: number, postId: number) => {
  const { data } = await api.get<ApiSuccessResponse<IArticleResponse>>(
    `/v1/clubs/${clubId}/articles/${postId}`,
  );
  return mapArticleToClubPostDetail(data.success.data);
};

function mapArticleToClubPostDetail(
  article: IArticleResponse,
): DTO.IClubPostDetailResponse {
  return {
    postId: article.articleId,
    clubId: article.clubId,
    category: article.category as DTO.ClubPostCategory,
    title: article.title,
    content: article.contents,
    author: article.author,
    images: (article.photos ?? []).map((photo) => ({
      imageId: photo.photoId,
      imageUrl: photo.photoUrl,
    })),
    likeCount: article.likeCount,
    commentCount: article.commentCount,
    createdAt: article.createdAt,
    isLiked: article.isLiked ?? false,
    isPinned: article.isPinned,
    isMine: article.isMine,
  };
}

export const updateClubPost = async (
  clubId: number,
  postId: number,
  body: DTO.IClubPostUpdateRequest,
) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/articles/${postId}`,
    {
      ...body,
      imageUrls: normalizeS3ObjectRefs(body.imageUrls),
    },
  );
  return data.success.data;
};

export const deleteClubPost = async (clubId: number, postId: number) => {
  const { data } = await api.delete<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/articles/${postId}`,
  );
  return data.success.data;
};

export const createClubPostComment = async (
  clubId: number,
  postId: number,
  body: DTO.IClubPostCommentCreateRequest,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IClubPostCommentCreateResponse>
  >(`/v1/clubs/${clubId}/articles/${postId}/comments`, {
    contents: body.content,
    parentCommentId: body.parentCommentId ?? null,
  });
  return data.success.data;
};

export const getClubPostComments = async (
  clubId: number,
  postId: number,
  params: { cursor?: string | null; limit?: number },
) => {
  const { data } = await api.get<ApiSuccessResponse<ICommentsGetResponse>>(
    `/v1/clubs/${clubId}/articles/${postId}/comments`,
    { params },
  );
  return mapCommentsToClubPostComments(data.success.data);
};

function mapCommentsToClubPostComments(
  response: ICommentsGetResponse,
): DTO.IClubPostCommentsGetResponse {
  const flatten = (comment: ICommentItem): DTO.IClubPostCommentItem[] => [
    {
      commentId: comment.commentId,
      parentCommentId: comment.parentCommentId,
      author: comment.author,
      content: comment.contents,
      createdAt: comment.createdAt,
      isMine: comment.isMine,
    },
    ...(comment.replies ?? []).flatMap(flatten),
  ];

  return {
    nextCursor: response.hasMore ? response.nextCursor : null,
    items: response.comments.flatMap(flatten),
  };
}

export const updateClubPostComment = async (
  clubId: number,
  postId: number,
  commentId: number,
  body: DTO.IClubPostCommentUpdateRequest,
) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/articles/${postId}/comments/${commentId}`,
    body,
  );
  return data.success.data;
};

export const deleteClubPostComment = async (
  clubId: number,
  postId: number,
  commentId: number,
) => {
  const { data } = await api.delete<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/articles/${postId}/comments/${commentId}`,
  );
  return data.success.data;
};

export const likeClubPost = async (clubId: number, postId: number) => {
  const { data } = await api.post<ApiSuccessResponse<IArticleLikeResponse>>(
    `/v1/clubs/${clubId}/articles/${postId}/like`,
  );
  return data.success.data;
};

export const unlikeClubPost = async (clubId: number, postId: number) => {
  const { data } = await api.delete<ApiSuccessResponse<IArticleLikeResponse>>(
    `/v1/clubs/${clubId}/articles/${postId}/like`,
  );
  return data.success.data;
};

export const toggleClubPostPin = async (
  clubId: number,
  postId: number,
  isPinned: boolean,
) => {
  const { data } = await api.patch<
    ApiSuccessResponse<DTO.IClubPostPinResponse>
  >(
    `/v1/clubs/${clubId}/articles/${postId}/pin`,
    { isPinned },
  );
  return {
    postId: data.success.data.postId ?? data.success.data.articleId ?? postId,
    isPinned: data.success.data.isPinned,
  };
};
