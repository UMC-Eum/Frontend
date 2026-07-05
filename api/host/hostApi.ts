import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/host/hostDTO";

export const updateClub = async (
  clubId: number,
  body: DTO.IClubUpdateRequest,
) => {
  const { data } = await api.patch<
    ApiSuccessResponse<DTO.IClubUpdateResponse>
  >(`/v1/clubs/${clubId}`, body);
  return data.success.data;
};

export const deleteClub = async (clubId: number) => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.IClubDeleteResponse>
  >(`/v1/clubs/${clubId}`);
  return data.success.data;
};

export const getClubMembers = async (
  clubId: number,
  params: DTO.IClubMembersParams = {},
) => {
  if (params.status === "PENDING") {
    const { data } = await api.get<ApiSuccessResponse<DTO.IClubMembersResponse>>(
      `/v1/clubs/${clubId}/members/requests`,
    );
    const response = data.success.data;

    return {
      ...response,
      members: response.members ?? response.items ?? [],
      nextCursor: response.nextCursor ?? null,
    };
  }

  const { data } = await api.get<ApiSuccessResponse<DTO.IClubMembersResponse>>(
    `/v1/clubs/${clubId}/members`,
  );
  const response = data.success.data;

  return {
    ...response,
    members: response.members ?? response.items ?? [],
    nextCursor: response.nextCursor ?? null,
  };
};

export const updateClubMemberStatus = async (
  clubId: number,
  userId: number,
  body: DTO.IClubMemberStatusUpdateRequest,
) => {
  const { data } = await api.patch<
    ApiSuccessResponse<DTO.IClubMemberStatusUpdateResponse>
  >(`/v1/clubs/${clubId}/members/${userId}`, body);
  return data.success.data;
};

export const updateClubMemberAuthority = async (
  clubId: number,
  userId: number,
  body: DTO.IClubMemberAuthorityUpdateRequest,
) => {
  const { data } = await api.patch<
    ApiSuccessResponse<DTO.IClubMemberAuthorityUpdateResponse>
  >(`/v1/clubs/${clubId}/members/${userId}/authority`, body);
  return data.success.data;
};

export const kickClubMember = async (
  clubId: number,
  userId: number,
  body: DTO.IClubMemberKickRequest = {},
) => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.IClubMemberKickResponse>
  >(`/v1/clubs/${clubId}/members/${userId}`, { data: body });
  return data.success.data;
};

export const pinHostClubArticle = async (
  clubId: number,
  articleId: number,
  body: DTO.IHostArticlePinRequest,
) => {
  const { data } = await api.patch<
    ApiSuccessResponse<DTO.IHostArticlePinResponse>
  >(`/v1/clubs/${clubId}/articles/${articleId}/pin`, body);
  return data.success.data;
};
