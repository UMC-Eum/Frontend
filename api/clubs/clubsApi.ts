import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/clubs/clubsDTO";

export const getClubs = async (params: DTO.IClubListRequest) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubListResponse>>(
    "/v1/clubs",
    { params },
  );
  return data.success.data;
};

export const getRecommendedClubs = async (params: DTO.IClubListRequest) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubListResponse>>(
    "/v1/clubs/recommended",
    { params },
  );
  return data.success.data;
};

export const getTopHostClubs = async (params: DTO.IClubListRequest) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubListResponse>>(
    "/v1/clubs/top-hosts",
    { params },
  );
  return data.success.data;
};

export const getMyClubs = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubListResponse>>(
    "/v1/users/me/clubs",
    { params },
  );
  return data.success.data;
};

export const getLikedClubs = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IClubListResponse>>(
    "/v1/users/me/clubs/liked",
    { params },
  );
  return data.success.data;
};

export const getClubDetail = async (clubId: number) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubDetailResponse>
  >(`/v1/clubs/${clubId}`);
  return data.success.data;
};

export const joinClub = async (
  clubId: number,
  body: DTO.IJoinClubRequest = {},
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IJoinClubResponse>
  >(`/v1/clubs/${clubId}/members`, body);
  return data.success.data;
};

export const leaveClub = async (clubId: number) => {
  const { data } = await api.delete<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/members/me`,
  );
  return data.success.data;
};

export const likeClub = async (clubId: number) => {
  const { data } = await api.post<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/like`,
  );
  return data.success.data;
};

export const unlikeClub = async (clubId: number) => {
  const { data } = await api.delete<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/like`,
  );
  return data.success.data;
};

export const getClubArchives = async (
  clubId: number,
  params: { cursor?: string | null; size: number },
) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubArchivesGetResponse>
  >(`/v1/clubs/${clubId}/archives`, { params });
  return data.success.data;
};

export const getClubMeetings = async (
  clubId: number,
  params: { cursor?: string | null; size: number },
) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubMeetingsGetResponse>
  >(`/v1/clubs/${clubId}/meetings`, { params });
  return data.success.data;
};

export const getClubMeetingDetail = async (
  clubId: number,
  meetingId: number,
) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubMeetingDetailResponse>
  >(`/v1/clubs/${clubId}/meetings/${meetingId}`);
  return data.success.data;
};

export const getClubMeetingAttendees = async (
  clubId: number,
  meetingId: number,
  params: { cursor?: string | null; size: number },
) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IClubMeetingAttendeesGetResponse>
  >(`/v1/clubs/${clubId}/meetings/${meetingId}/attendees`, { params });
  return data.success.data;
};

export const attendClubMeeting = async (
  clubId: number,
  meetingId: number,
) => {
  const { data } = await api.post<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/meetings/${meetingId}/attendees/me`,
  );
  return data.success.data;
};

export const cancelClubMeetingAttendance = async (
  clubId: number,
  meetingId: number,
) => {
  const { data } = await api.delete<ApiSuccessResponse<null>>(
    `/v1/clubs/${clubId}/meetings/${meetingId}/attendees/me`,
  );
  return data.success.data;
};
