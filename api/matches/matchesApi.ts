import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import { IMatchCountResponse } from "../../types/api/matches/matchesDTO";

export const getMatchCount = async () => {
  const { data } =
    await api.get<ApiSuccessResponse<IMatchCountResponse>>("/v1/matches/count");
  return data.success.data;
};
