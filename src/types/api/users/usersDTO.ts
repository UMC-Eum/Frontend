export interface IPatchUserProfileRequest {
  nickname: string;
  areaCode: string;
  introText: string;
}

export interface IUpdateInterestKeywordsRequest {
  interestKeywordIds: number[];
}
