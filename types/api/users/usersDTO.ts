export interface IPatchUserProfileRequest {
  nickname?: string;
  gender?: "M" | "F";
  birthDate?: string;
  age?: number;
  areaCode?: string;
  introText?: string;
  keywords?: string[];
  personalities?: string[];
  idealPersonalities?: string[];
  introAudioUrl?: string | null;
  profileImageUrl?: string;
}

export interface IDeleteAccountRequest {
  appleAuthorizationCode?: string;
}

export interface IKeywordsRequest {
  interestKeywordIds: number[];
}
export interface IPutIdealRequest {
  personalityKeywords: string[];
}

export interface IProfileVisitResponse {
  watchLogId: number;
  visitedTo: number;
  visitedBy: number;
  visitedAt: string;
}

export interface IMyProfileVisitorsRequest {
  cursor?: string | null;
  size?: number;
}

export interface IMyProfileVisitorItem {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  age: number;
  gender: "M" | "F" | (string & {});
  areaName?: string | null;
  introText?: string | null;
  visitedAt: string;
}

export interface IMyProfileVisitorsResponse {
  items: IMyProfileVisitorItem[];
  nextCursor: string | null;
}

export interface IActiveUsersParams {
  areaCode?: string;
  cursor?: string | null;
  size?: number;
}

export interface IActiveUserItem {
  userId: number;
  nickname: string;
  gender: "M" | "F" | (string & {});
  age: number;
  areaName: string | null;
  introText: string;
  profileImageUrl: string;
  lastActiveAt: string;
}

export interface IActiveUsersPage {
  size: number;
  hasNext: boolean;
  nextCursor: string | null;
}

export interface IActiveUsersResponse {
  items: IActiveUserItem[];
  page: IActiveUsersPage;
}

export interface ILikedClubsParams {
  cursor?: string | null;
  limit?: number;
}

export interface ILikedClubItem {
  clubId: number;
  name: string;
  category: string;
  introText: string;
  thumbnailUrl: string | null;
  memberCount: number;
  likeCount: number;
  isJoined: boolean;
  likedAt: string;
}

export interface ILikedClubsResponse {
  clubs: ILikedClubItem[];
  nextCursor: string | null;
  hasMore: boolean;
}
