export type AgreementType = "POLICY" | "PERSONAL_INFORMATION" | "MARKETING";

export interface IAgreementItem {
  agreementId: number;
  body: string;
  type?: AgreementType;
}

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

export interface UpdateMarketingRequest {
  marketingAgreements: {
    marketingAgreementId: number;
    isAgreed: boolean;
  }[];
}

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
