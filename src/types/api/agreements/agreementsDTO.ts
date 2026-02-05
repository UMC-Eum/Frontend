export type AgreementType = "POLICY" | "PERSONAL_INFORMATION" | "MARKETING";

export interface IAgreementItem {
  agreementId: number; // 최신 예시 반영: number
  body: string;
  type?: AgreementType;
}

// GET /agreements 응답 전체 구조
export interface IAgreementsResponse {
  resultType: string;
  success: {
    data: {
      items: IAgreementItem[];
    };
  };
  error: null | string;
  meta: {
    timestamp: string;
    path: string;
  };
}

// POST /users/me/agreements 요청 구조
export interface UpdateMarketingRequest {
  marketingAgreements: {
    marketingAgreementId: number;
    isAgreed: boolean;
  }[];
}

// GET /me/agreements 응답 전체 구조
export interface IAgreementStatusResponse {
  resultType: string;
  success: {
    data: {
      hasPassed: boolean;
    };
  };
  error: null | string;
  meta: {
    timestamp: string;
    path: string;
  };
}
