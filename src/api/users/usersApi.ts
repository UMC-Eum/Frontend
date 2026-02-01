import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";

import { IUserProfile } from "../../types/user";
import {
  IKeywordsRequest,
  IPatchUserProfileRequest,
} from "../../types/api/users/usersDTO";
//v1/users/me
export const getMyProfile = async () => {
  const { data } = await api.get<ApiSuccessResponse<IUserProfile>>("/v1/users/me");

  return data.success.data;
};

//v1/users/me(patch)

export const updateMyProfile = async (body: IPatchUserProfileRequest) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>("/v1/users/me", body);

  return data.success.data;
};
//v1/users/me/deactivate(patch)
export const deactivateUser = async () => {
  const { data } = await api.patch<ApiSuccessResponse<null>>("/v1/users/me/deactivate");

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
export const putIdealPersonalities = async (body: IKeywordsRequest) => {
  const { data } = await api.put<ApiSuccessResponse<null>>(
    "/v1/users/me/ideal-personalities",
    body,
  );

  return data.success.data;
};
