export type AgreementType = "POLICY" | "PERSONAL_INFORMATION" | "MARKETING";

export interface IAgreements {
  agreementId: number;
  type: AgreementType;
  required: boolean;
  body: string;
}

export interface IAgreementsResponse {
  items: IAgreements[];
}

export interface IMarketingAgreementRequest {
  marketingAgreementId: number;
  isAgreed: boolean;
}
