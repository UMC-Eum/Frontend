import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/comments/commentsDTO";

export const getComments = async (
  clubId: number,
  articleId: number,
  params: DTO.ICommentsGetParams = {},
) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.ICommentsGetResponse>>(
    `/v1/clubs/${clubId}/articles/${articleId}/comments`,
    { params },
  );
  return data.success.data;
};

export const createComment = async (
  clubId: number,
  articleId: number,
  body: DTO.ICommentCreateRequest,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.ICommentCreateResponse>
  >(`/v1/clubs/${clubId}/articles/${articleId}/comments`, body);
  return data.success.data;
};

export const updateComment = async (
  clubId: number,
  articleId: number,
  commentId: number,
  body: DTO.ICommentUpdateRequest,
) => {
  const { data } = await api.patch<
    ApiSuccessResponse<DTO.ICommentUpdateResponse>
  >(`/v1/clubs/${clubId}/articles/${articleId}/comments/${commentId}`, body);
  return data.success.data;
};

export const deleteComment = async (
  clubId: number,
  articleId: number,
  commentId: number,
) => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.ICommentDeleteResponse>
  >(`/v1/clubs/${clubId}/articles/${articleId}/comments/${commentId}`);
  return data.success.data;
};
