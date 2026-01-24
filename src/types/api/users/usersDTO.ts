export interface IPatchUserProfileRequest {
  nickname: string;
  areaCode: string;
  introText: string;
}

export interface IKeywordsRequest {
  interestKeywordIds: number[];
}
