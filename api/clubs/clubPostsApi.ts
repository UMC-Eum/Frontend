import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/clubs/clubPostsDTO";

export const createClubPost = async (
  clubId: number,
  body: DTO.IClubPostCreateRequest,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IClubPostCreateResponse>
  >(`/v1/clubs/${clubId}/posts`, body);
  return data.success.data;
};

export const getClubPostDetail = async (postId: number) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubPostDetailResponse>
  >(`/v1/club-posts/${postId}`);
  return data.success.data;
};

export const deleteClubPost = async (postId: number) => {
  const { data } = await api.delete<ApiSuccessResponse<null>>(
    `/v1/club-posts/${postId}`,
  );
  return data.success.data;
};

export const createClubPostComment = async (
  postId: number,
  body: DTO.IClubPostCommentCreateRequest,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IClubPostCommentCreateResponse>
  >(`/v1/club-posts/${postId}/comments`, body);
  return data.success.data;
};

export const getClubPostComments = async (
  postId: number,
  params: { cursor?: string | null; size: number },
) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubPostCommentsGetResponse>
  >(`/v1/club-posts/${postId}/comments`, { params });
  return data.success.data;
};
