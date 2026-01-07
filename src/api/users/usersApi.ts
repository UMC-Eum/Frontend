import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";

import { IUserProfile } from "../../types/user";
import {
  IPatchUserProfileRequest,
  IUpdateInterestKeywordsRequest,
} from "../../types/api/users/usersDTO";
//v1/users/me
export const getMyProfile = async () => {
  const { data } = await api.get<ApiSuccessResponse<IUserProfile>>("/users/me");

  return data.success.data;
};

//v1/users/me(patch)

export const updateMyProfile = async (body: IPatchUserProfileRequest) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>("/users/me", body);

  return data.success.data;
};
//v1/users/me(delete)
export const deactivateUser = async () => {
  const { data } = await api.delete<ApiSuccessResponse<null>>("/users/me");

  return data.success.data;
};
//v1/users/me/keywords(put)
export const updateInterestKeywords = async (keywordIds: number[]) => {
  const body: IUpdateInterestKeywordsRequest = {
    interestKeywordIds: keywordIds,
  };

  const { data } = await api.put<ApiSuccessResponse<null>>(
    "/users/me/keywords",
    body
  );

  return data.success.data;
};
