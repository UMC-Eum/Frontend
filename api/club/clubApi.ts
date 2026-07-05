import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/club/clubDTO";
import {
  normalizeS3ObjectRef,
  normalizeS3ObjectRefs,
} from "@/utils/s3ObjectRef";

export const getClubs = async (params: DTO.IClubListParams = {}) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubsGetResponse>>(
    "/v1/clubs",
    { params },
  );
  return data.success.data;
};

export const createClub = async (body: DTO.IClubCreateRequest) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IClubCreateResponse>
  >("/v1/clubs", {
    ...body,
    thumbnailUrl: body.thumbnailUrl
      ? normalizeS3ObjectRef(body.thumbnailUrl)
      : body.thumbnailUrl,
    imageUrls: normalizeS3ObjectRefs(body.imageUrls),
  });
  return data.success.data;
};

export const getClubDetail = async (clubId: number) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubDetailResponse>>(
    `/v1/clubs/${clubId}`,
  );
  return data.success.data;
};

export const getTopHosts = async (params: DTO.IClubTopHostsParams = {}) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubTopHostsResponse>>(
    "/v1/clubs/top-hosts",
    { params },
  );
  return data.success.data;
};

export const joinClub = async (
  clubId: number,
  body: DTO.IClubJoinRequest,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IClubMemberRelationResponse>
  >(`/v1/clubs/${clubId}/members`, body);
  return data.success.data;
};

export const leaveClub = async (clubId: number) => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.IClubLeaveResponse>
  >(`/v1/clubs/${clubId}/members/me`);
  return data.success.data;
};

export const getMyClubs = async () => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IMyClubsResponse>>(
    "/v1/users/me/clubs",
  );
  return data.success.data;
};

export const getClubArchives = async (
  clubId: number,
  params: DTO.IClubArchiveParams = {},
) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubArchivesResponse>>(
    `/v1/clubs/${clubId}/archives`,
    { params },
  );
  return data.success.data;
};

export const likeClub = async (clubId: number) => {
  const { data } = await api.post<ApiSuccessResponse<DTO.IClubLikeResponse>>(
    `/v1/clubs/${clubId}/like`,
  );
  return data.success.data;
};

export const unlikeClub = async (clubId: number) => {
  const { data } = await api.delete<ApiSuccessResponse<DTO.IClubLikeResponse>>(
    `/v1/clubs/${clubId}/like`,
  );
  return data.success.data;
};

// ponytail: cursor/size 생략 — 홈은 3개만 노출, 전체 목록 화면 생기면 페이지네이션 추가
export const getRecommendedClubs = async () => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IRecommendedClubsResponse>
  >("/v1/matches/club/recommended");
  return data.success.data;
};

// v1/clubs/search/recent (GET) — 최근 동호회 검색어 목록 조회
export const getRecentClubSearches = async () => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IRecentClubSearchesResponse>
  >("/v1/clubs/search/recent");
  return data.success.data;
};

// v1/clubs/search/recent (DELETE) — 최근 동호회 검색어 전체 삭제
export const clearRecentClubSearches = async () => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.IClearRecentClubSearchesResponse>
  >("/v1/clubs/search/recent");
  return data.success.data;
};

// v1/clubs/search/recent/items (DELETE) — 최근 동호회 검색어 단건 삭제
export const deleteRecentClubSearch = async (keyword: string) => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.IDeleteRecentClubSearchResponse>
  >("/v1/clubs/search/recent/items", { params: { keyword } });
  return data.success.data;
};
