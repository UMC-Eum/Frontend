import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import type { IArticleResponse } from "../../types/api/articles/articlesDTO";
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
  >(`/v1/clubs/${clubId}/articles`, body);
  return data.success.data;
};

export const getClubPostDetail = async (postId: number, clubId?: number) => {
  if (clubId) {
    const { data } = await api.get<ApiSuccessResponse<IArticleResponse>>(
      `/v1/clubs/${clubId}/articles/${postId}`,
    );
    return mapArticleToClubPostDetail(data.success.data);
  }

  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubPostDetailResponse>
  >(`/v1/club-posts/${postId}`);
  return data.success.data;
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
    body,
  );
  return data.success.data;
};

export const deleteClubPost = async (postId: number, clubId?: number) => {
  if (clubId) {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      `/v1/clubs/${clubId}/articles/${postId}`,
    );
    return data.success.data;
  }

  const { data } = await api.delete<ApiSuccessResponse<null>>(
    `/v1/club-posts/${postId}`,
  );
  return data.success.data;
};

export const createClubPostComment = async (
  postId: number,
  body: DTO.IClubPostCommentCreateRequest,
  clubId?: number,
) => {
  if (clubId) {
    const { data } = await api.post<
      ApiSuccessResponse<DTO.IClubPostCommentCreateResponse>
    >(`/v1/clubs/${clubId}/articles/${postId}/comments`, body);
    return data.success.data;
  }

  const { data } = await api.post<
    ApiSuccessResponse<DTO.IClubPostCommentCreateResponse>
  >(`/v1/club-posts/${postId}/comments`, body);
  return data.success.data;
};

export const getClubPostComments = async (
  postId: number,
  params: { cursor?: string | null; size: number },
  clubId?: number,
) => {
  if (clubId) {
    const { data } = await api.get<
      ApiSuccessResponse<DTO.IClubPostCommentsGetResponse>
    >(`/v1/clubs/${clubId}/articles/${postId}/comments`, { params });
    return data.success.data;
  }

  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubPostCommentsGetResponse>
  >(`/v1/club-posts/${postId}/comments`, { params });
  return data.success.data;
};

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
  const { data } = await api.post<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/articles/${postId}/like`,
  );
  return data.success.data;
};

export const unlikeClubPost = async (clubId: number, postId: number) => {
  const { data } = await api.delete<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/articles/${postId}/like`,
  );
  return data.success.data;
};

export const toggleClubPostPin = async (clubId: number, postId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/articles/${postId}/pin`,
  );
  return data.success.data;
};
