import api from "../axiosInstance";
import {
  IAgreementsResponse,
  IAgreementItem,
  UpdateMarketingRequest,
} from "../../types/api/agreements/agreementsDTO";

/**
 * 약관 조회 점검 완료
 * 예시의 success.data.items 경로를 정확히 따릅니다.
 */
export const getAgreements = async (): Promise<IAgreementItem[]> => {
  const { data } = await api.get<IAgreementsResponse>("/agreements");
  
  // 예시 구조: data { success: { data: { items: [...] } } }
  return data.success.data.items;
};

/**
 * 마케팅 동의 업데이트 점검 완료
 * 예시의 { "marketingAgreements": [...] } 바디 구조를 정확히 따릅니다.
 */
export const updateMarketingAgreements = async (
  items: UpdateMarketingRequest["marketingAgreements"]
) => {
  // 예시 구조: { "marketingAgreements": [ { "marketingAgreementId": 1, ... } ] }
  const body: UpdateMarketingRequest = {
    marketingAgreements: items,
  };

  const { data } = await api.post("/users/me/agreements", body);
  return data;
};