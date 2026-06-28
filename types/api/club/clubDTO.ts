export type ClubCategory =
  | "HOBBY"
  | "SPORTS"
  | "STUDY"
  | "CULTURE"
  | "SOCIAL"
  | "ETC"
  | (string & {});

export type ClubAuthority = "HOST" | "MANAGER" | "GENERAL";
export type ClubMemberStatus = "ACTIVE" | "PENDING" | "REJECTED";
export type ClubJoinPolicy = "AUTO" | "APPROVAL";
export type ClubListSort = "POPULAR" | "RECENT" | "LIKES";
export type MyClubRole = "ALL" | "HOST" | "MEMBER";

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
  meetingId: number;
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

export interface IClubListItem {
  clubId: number;
  name: string;
  category: ClubCategory;
  introText: string;
  thumbnailUrl: string | null;
  capacity?: number;
  memberCount: number;
  likeCount: number;
  isLiked: boolean;
  isJoined: boolean;
  host: IClubUserSummary;
  keywords: string[];
  createdAt?: string;
}

export interface IClubsGetResponse {
  clubs: IClubListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface IClubCreateRequest {
  name: string;
  category: ClubCategory;
  introText: string;
  introVoice?: string | null;
  capacity: number;
  keywordIds: number[];
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
  introVoice: string | null;
  introText: string;
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
  message?: string;
}

export interface IClubMemberRelationResponse {
  clubUserId: number;
  clubId: number;
  userId: number;
  authority: ClubAuthority;
  status: ClubMemberStatus;
  joinedAt?: string;
  permittedAt?: string;
}

export interface IClubLeaveResponse {
  clubId: number;
  userId: number;
  leftAt: string;
  clubDeleted?: boolean;
}

export interface IMyClubsParams {
  role?: MyClubRole;
  cursor?: string | null;
  limit?: number;
}

export interface IMyClubItem {
  clubId: number;
  name: string;
  category: ClubCategory;
  introText: string;
  thumbnailUrl: string | null;
  capacity: number;
  memberCount: number;
  likes: number;
  myAuthority: ClubAuthority;
  joinedAt: string;
}

export interface IMyClubsResponse {
  clubs: IMyClubItem[];
  nextCursor: string | null;
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

export interface IRecommendedClubItem extends IClubListItem {
  introVoiceUrl?: string | null;
  matchScore: number;
  matchedKeywords: string[];
}

export interface IRecommendedClubsResponse {
  clubs: IRecommendedClubItem[];
}
