import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";

import { IUserProfile } from "../../types/user";
import {
  ICreateProfileVisitResponse,
  IIdealVoiceResponse,
  IKeywordsRequest,
  INotificationSettingsPatchRequest,
  INotificationSettingsResponse,
  IPatchUserProfileRequest,
  IProfileVisitorsGetResponse,
  IPutIdealRequest,
} from "../../types/api/users/usersDTO";
//v1/users/me
export const getMyProfile = async () => {
  const { data } =
    await api.get<ApiSuccessResponse<IUserProfile>>("/v1/users/me");

  return data.success.data;
};

//v1/users/me(patch)

export const updateMyProfile = async (body: IPatchUserProfileRequest) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    "/v1/users/me",
    body,
  );

  return data.success.data;
};
//v1/users/me/deactivate(patch)
export const deactivateUser = async () => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    "/v1/users/me/deactivate",
  );

  return data.success.data;
};
//v1/users/me/interests(put)
export const putInterestKeywords = async (body: IKeywordsRequest) => {
  const { data } = await api.put<ApiSuccessResponse<null>>(
    "/v1/users/me/interests",
    body,
  );

  return data.success.data;
};

//v1/users/me/personalities(put)
export const putPersonalities = async (body: IKeywordsRequest) => {
  const { data } = await api.put<ApiSuccessResponse<null>>(
    "/v1/users/me/personalities",
    body,
  );

  return data.success.data;
};
//v1/users/me/ideal-personalities(put)
export const putIdealPersonalities = async (body: IPutIdealRequest) => {
  const { data } = await api.put<ApiSuccessResponse<null>>(
    "/v1/users/me/ideal-personalities",
    body,
  );

  return data.success.data;
};

// v1/users/me/visitors(get)
export const getMyProfileVisitors = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<IProfileVisitorsGetResponse>
  >("/v1/users/me/visitors", { params });

  return data.success.data;
};

// v1/users/{userId}/visits(post)
export const createProfileVisit = async (userId: number) => {
  const { data } = await api.post<
    ApiSuccessResponse<ICreateProfileVisitResponse>
  >(`/v1/users/${userId}/visits`);

  return data.success.data;
};

// v1/users/me/ideal-voice(get)
export const getMyIdealVoice = async () => {
  const { data } = await api.get<ApiSuccessResponse<IIdealVoiceResponse>>(
    "/v1/users/me/ideal-voice",
  );

  return data.success.data;
};

// v1/users/me/notification-settings(get)
export const getMyNotificationSettings = async () => {
  const { data } = await api.get<
    ApiSuccessResponse<INotificationSettingsResponse>
  >("/v1/users/me/notification-settings");

  return data.success.data;
};

// v1/users/me/notification-settings(patch)
export const updateMyNotificationSettings = async (
  body: INotificationSettingsPatchRequest,
) => {
  const { data } = await api.patch<
    ApiSuccessResponse<INotificationSettingsResponse>
  >("/v1/users/me/notification-settings", body);

  return data.success.data;
};
