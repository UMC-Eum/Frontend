import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/meetings/meetingsDTO";

export const createMeeting = async (
  clubId: number,
  body: DTO.IMeetingCreateRequest,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IMeetingCreateResponse>
  >(`/v1/clubs/${clubId}/meetings`, body);
  return data.success.data;
};

export const getMeetings = async (
  clubId: number,
  params: DTO.IMeetingsGetParams = {},
) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IMeetingsGetResponse>>(
    `/v1/clubs/${clubId}/meetings`,
    { params },
  );
  return data.success.data;
};

export const getMeetingDetail = async (clubId: number, meetingId: number) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IMeetingDetailResponse>
  >(`/v1/clubs/${clubId}/meetings/${meetingId}`);
  return data.success.data;
};

export const updateMeeting = async (
  clubId: number,
  meetingId: number,
  body: DTO.IMeetingUpdateRequest,
) => {
  const { data } = await api.patch<
    ApiSuccessResponse<DTO.IMeetingUpdateResponse>
  >(`/v1/clubs/${clubId}/meetings/${meetingId}`, body);
  return data.success.data;
};

export const deleteMeeting = async (clubId: number, meetingId: number) => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.IMeetingDeleteResponse>
  >(`/v1/clubs/${clubId}/meetings/${meetingId}`);
  return data.success.data;
};

export const attendMeeting = async (clubId: number, meetingId: number) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IMeetingAttendResponse> | DTO.IMeetingAttendResponse | null
  >(`/v1/clubs/${clubId}/meetings/${meetingId}/attendees/me`);
  if (!data) return undefined;
  if (typeof data === "object" && "success" in data) {
    return data.success?.data;
  }
  return data;
};

export const getMeetingAttendees = async (
  clubId: number,
  meetingId: number,
  params: DTO.IMeetingAttendeesGetParams = {},
) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IMeetingAttendeesGetResponse>
  >(`/v1/clubs/${clubId}/meetings/${meetingId}/attendees`, { params });
  return data.success.data;
};

export const cancelMeetingAttendance = async (
  clubId: number,
  meetingId: number,
) => {
  const { data } = await api.delete<
    ApiSuccessResponse<DTO.IMeetingCancelAttendanceResponse>
  >(`/v1/clubs/${clubId}/meetings/${meetingId}/attendees/me`);
  return data.success.data;
};
