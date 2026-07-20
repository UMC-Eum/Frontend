export type ClubCategory =
  | "SPORTS"
  | "HOBBY"
  | "CULTURE_ART"
  | "VOLUNTEER"
  | "FOOD"
  | "STUDY"
  | "OTHERS"
  | (string & {});

export type ClubAuthority = "HOST" | "GENERAL";
export type ClubMemberStatus =
  | "ACTIVE"
  | "PENDING"
  | "REJECTED"
  | "KICKED"
  | "LEFT";
export type ClubJoinPolicy = "AUTO" | "APPROVAL_REQUIRED";
export type ClubListSort = "POPULAR" | "RECENT" | "LIKES";

export interface IClubUserSummary {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface IClubKeyword {
  keywordId: number;
  name: string;
}

export interface IClubMeetingSummary {
  meetingId: number | string;
  name: string;
  day?: string;
  time?: string;
}

export interface IClubListParams {
  keyword?: string;
  category?: ClubCategory;
  sort?: ClubListSort;
  cursor?: string | null;
  limit?: number;
}

export interface IRecommendedClubsParams {
  cursor?: string | null;
  size?: number;
  areaCode?: string;
}

export interface IClubListItem {
  clubId: number | string;
  hostNickname: string;
  name: string;
  category: ClubCategory;
  introText: string;
  thumbnailUrl: string | null;
  likes: number;
  memberCount: number;
  createdAt: string;
}

export interface IClubsGetResponse {
  items: IClubListItem[];
  nextCursor: string | null;
}

export interface IClubCreateRequest {
  name: string;
  category: ClubCategory;
  introText: string;
  capacity: number;
  areaCode: string;
  approvalRequired: boolean;
  boardPublic: boolean;
  thumbnailUrl: string | null;
  imageUrls: string[];
}

export interface IClubCreateResponse {
  clubId: number;
  code?: string;
  name: string;
  category: ClubCategory;
  capacity: number;
  memberCount: number;
  host: IClubUserSummary;
  createdAt: string;
}

export interface IClubDetailResponse {
  clubId: number;
  name: string;
  category: ClubCategory;
  thumbnailUrl: string | null;
  introVoice: string | null;
  introText: string;
  areaCode?: string | null;
  areaName?: string | null;
  addressCode?: string | null;
  addressName?: string | null;
  capacity: number;
  memberCount: number;
  likes: number;
  isLiked: boolean;
  isJoined: boolean;
  myAuthority: ClubAuthority | null;
  host: IClubUserSummary;
  keywords: string[];
  meetings: IClubMeetingSummary[];
  createdAt: string;
}

export interface IClubTopHostsParams {
  limit?: number;
}

export interface IClubTopHost {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  clubCount: number;
  totalLikes: number;
}

export interface IClubTopHostsResponse {
  hosts: IClubTopHost[];
}

export interface IClubJoinRequest {
  message: string;
}

export interface IClubMemberRelationResponse {
  clubUserId: number;
  clubId: number;
  userId: number;
  authority: ClubAuthority;
  status: ClubMemberStatus;
  message: string;
  requestedAt: string;
  joinedAt: string | null;
}

export interface IClubLeaveResponse {
  clubId: number;
  userId: number;
  leftAt: string;
  clubDeleted?: boolean;
}

export interface IMyClubItem {
  clubId: number;
  name: string;
  category: ClubCategory;
  introText: string | null;
  thumbnailUrl: string | null;
  memberCount: number;
  authority: ClubAuthority;
  status?: ClubMemberStatus;
  joinedAt: string | null;
}

export interface IMyClubsResponse {
  items: IMyClubItem[];
}

export interface IClubLikeResponse {
  clubId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface IClubArchiveParams {
  cursor?: string | null;
  limit?: number;
}

export interface IClubArchivePhoto {
  photoId: number;
  articleId: number;
  photoUrl: string;
  uploadedBy?: {
    userId: number;
    nickname: string;
  };
  createdAt: string;
}

export interface IClubArchivesResponse {
  photos: IClubArchivePhoto[];
  nextCursor: string | null;
}

export interface IRecommendedClubItem {
  clubId: string;
  name: string;
  category: ClubCategory;
  addressCode: string;
  addressName: string;
  sidoCode: string;
  sigunguCode: string;
  introText: string | null;
  thumbnailUrl: string | null;
  capacity: number;
  likes: number;
  similarityScore: number;
  // 미검증(401로 실응답 확인 못 함). 현재 이 엔드포인트는 참석 인원을 안 내려주는 것으로 보이며,
  // 백엔드가 추가하면 홈 "나를 위한 동호회" 카드의 "N명 참석중"이 바로 표시된다.
  memberCount?: number;
}

export interface IRecommendedClubsResponse {
  items: IRecommendedClubItem[];
  page: {
    size: number;
    hasNext: boolean;
    nextCursor?: string | null;
  };
}

// v1/clubs/today-recommended (GET)
// 2026-07-20 실제 응답 확인 결과 /v1/matches/club/recommended와 shape이 다르다.
// 위치 필드(addressName/areaName/addressCode/sidoCode/sigunguCode)가 아예 없어서
// 홈 "오늘의 추천 동호회" 카드에 지역이 표시되지 않는다 — 백엔드 추가 필요.
export interface ITodayRecommendedClubItem {
  clubId: string;
  name: string;
  category: ClubCategory;
  introText: string | null;
  thumbnailUrl: string | null;
  capacity: number;
  memberCount: number;
  likes: number;
  recommendationScore: number;
  // 이 응답은 userId/clubId를 문자열로 내려줘서 IClubUserSummary(userId: number)와 다르다.
  host: {
    userId: number | string;
    nickname: string;
    profileImageUrl: string | null;
  };
}

export interface ITodayRecommendedClubsResponse {
  items: ITodayRecommendedClubItem[];
}

// v1/clubs/search/recent (GET)
export interface IRecentClubSearchesResponse {
  keywords: string[];
}

// v1/clubs/search/recent (DELETE)
export interface IClearRecentClubSearchesResponse {
  deleted: boolean;
}

// v1/clubs/search/recent/items (DELETE)
export interface IDeleteRecentClubSearchResponse {
  deletedKeyword: string;
}
