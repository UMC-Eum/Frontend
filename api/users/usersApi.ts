import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";

import { IUserProfile, IUserPublicProfile } from "../../types/user";
import {
  IKeywordsRequest,
  ILikedClubsParams,
  ILikedClubsResponse,
  IMyProfileVisitorsRequest,
  IMyProfileVisitorsResponse,
  IPatchUserProfileRequest,
  IProfileVisitResponse,
  IPutIdealRequest,
} from "../../types/api/users/usersDTO";
//v1/users/me
export const getMyProfile = async () => {
  const { data } =
    await api.get<ApiSuccessResponse<IUserProfile>>("/v1/users/me");

  return data.success.data;
};

//v1/users/{userId}/profile
export const getUserProfile = async (userId: number) => {
  const { data } = await api.get<ApiSuccessResponse<IUserPublicProfile>>(
    `/v1/users/${userId}/profile`,
  );

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

//v1/users/{userId}/visits(post)
export const createProfileVisit = async (userId: number) => {
  const { data } = await api.post<ApiSuccessResponse<IProfileVisitResponse>>(
    `/v1/users/${userId}/visits`,
  );

  return data.success.data;
};

//v1/users/me/visitors(get)
export const getMyProfileVisitors = async (
  params: IMyProfileVisitorsRequest = {},
) => {
  const { data } = await api.get<
    ApiSuccessResponse<IMyProfileVisitorsResponse>
  >("/v1/users/me/visitors", { params });

  return data.success.data;
};

//v1/users/me/clubs/liked(get)
export const getLikedClubs = async (params: ILikedClubsParams = {}) => {
  const { data } = await api.get<ApiSuccessResponse<ILikedClubsResponse>>(
    "/v1/users/me/clubs/liked",
    { params },
  );

  return data.success.data;
};
