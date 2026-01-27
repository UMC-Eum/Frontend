import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import {
  IAgreementsResponse,
  IAgreements,
  IMarketingAgreementRequest,
} from "../../types/api/agreements/agreementsDTO";
// 약관 조회
export const getAgreements = async (): Promise<IAgreements[]> => {
  const { data } = await api.get<ApiSuccessResponse<IAgreementsResponse>>(
    "/agreements"
  );

  return data.success.data.items;
};
// 마케팅 약관 동의 상태 업데이트
export const updateMarketingAgreements = async (
  items: IMarketingAgreementRequest[]
) => {
  const body = {
    marketingAgreements: items,
  };

  const { data } = await api.post<ApiSuccessResponse<null>>(
    "/users/me/agreements",
    body
  );

  return data.success.data;
};
