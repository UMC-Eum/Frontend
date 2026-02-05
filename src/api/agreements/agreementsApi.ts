import api from "../axiosInstance";
import {
  IAgreementsResponse,
  IAgreementItem,
  UpdateMarketingRequest,
  IAgreementStatusResponse,
} from "../../types/api/agreements/agreementsDTO";

/**
 * 약관 조회 점검 완료
 * 예시의 success.data.items 경로를 정확히 따릅니다.
 */
export const getAgreements = async (): Promise<IAgreementItem[]> => {
  const { data } = await api.get<IAgreementsResponse>("v1/agreements");
  
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

  const { data } = await api.post("v1/users/me/agreements", body);
  return data;
};

// 사용자의 약관 동의 여부를 가져오는 함수
export const getAgreementStatus = async () => {
  const { data } = await api.get<IAgreementStatusResponse>("v1/me/agreements");
  return data.success.data.hasPassed;
};
