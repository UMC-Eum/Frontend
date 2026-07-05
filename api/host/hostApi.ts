import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/host/hostDTO";
import { normalizeS3ObjectRef } from "@/utils/s3ObjectRef";

export const updateClub = async (
  clubId: number,
  body: DTO.IClubUpdateRequest,
) => {
  const requestBody = {
    ...body,
    introVoice:
      typeof body.introVoice === "string"
        ? normalizeS3ObjectRef(body.introVoice)
        : body.introVoice,
  };
  const { data } = await api.patch<
    ApiSuccessResponse<DTO.IClubUpdateResponse>
  >(`/v1/clubs/${clubId}`, requestBody);
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
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubMembersResponse>>(
    `/v1/clubs/${clubId}/members`,
    { params },
  );
  return data.success.data;
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
