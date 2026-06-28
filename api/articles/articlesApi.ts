import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/articles/articlesDTO";

export const getArticles = async (
  clubId: number,
  params: DTO.IArticlesGetParams = {},
) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IArticlesGetResponse>>(
    `/v1/clubs/${clubId}/articles`,
    { params },
  );
  return data.success.data;
};

export const createArticle = async (
  clubId: number,
  body: DTO.IArticleCreateRequest,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IArticleCreateResponse>
  >(`/v1/clubs/${clubId}/articles`, body);
  return data.success.data;
};

export const getArticleDetail = async (clubId: number, articleId: number) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IArticleResponse>>(
    `/v1/clubs/${clubId}/articles/${articleId}`,
  );
  return data.success.data;
};

export const updateArticle = async (
  clubId: number,
  articleId: number,
  body: DTO.IArticleUpdateRequest,
) => {
  const { data } = await api.patch<
    ApiSuccessResponse<DTO.IArticleUpdateResponse>
  >(`/v1/clubs/${clubId}/articles/${articleId}`, body);
  return data.success.data;
};

export const deleteArticle = async (clubId: number, articleId: number) => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.IArticleDeleteResponse>
  >(`/v1/clubs/${clubId}/articles/${articleId}`);
  return data.success.data;
};

export const likeArticle = async (clubId: number, articleId: number) => {
  const { data } = await api.post<ApiSuccessResponse<DTO.IArticleLikeResponse>>(
    `/v1/clubs/${clubId}/articles/${articleId}/like`,
  );
  return data.success.data;
};

export const unlikeArticle = async (clubId: number, articleId: number) => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.IArticleLikeResponse>
  >(`/v1/clubs/${clubId}/articles/${articleId}/like`);
  return data.success.data;
};

export const pinArticle = async (
  clubId: number,
  articleId: number,
  body: DTO.IArticlePinRequest,
) => {
  const { data } = await api.patch<ApiSuccessResponse<DTO.IArticlePinResponse>>(
    `/v1/clubs/${clubId}/articles/${articleId}/pin`,
    body,
  );
  return data.success.data;
};

export const getArticleArchive = async (
  clubId: number,
  params: DTO.IArticleArchiveParams = {},
) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IArticleArchiveResponse>
  >(`/v1/clubs/${clubId}/articles/archive`, { params });
  return data.success.data;
};
