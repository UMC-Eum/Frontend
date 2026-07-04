export type ClubCategory =
  | "SPORTS"
  | "LANGUAGE"
  | "VOLUNTEER"
  | "OUTDOOR"
  | "CULTURE"
  | "OTHERS"
  | (string & {});

export type ClubAuthority = "HOST" | "GENERAL";
export type ClubMemberStatus =
  | "ACTIVE"
  | "PENDING"
  | "REJECTED"
  | "KICKED"
  | "LEFT";
export type ClubJoinPolicy = "AUTO" | "APPROVAL";
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
  likes: number;
  memberCount: number;
}

export interface IClubsGetResponse {
  items: IClubListItem[];
  nextCursor: string | null;
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
  joinedAt: string;
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
}

export interface IRecommendedClubsResponse {
  items: IRecommendedClubItem[];
  page: {
    size: number;
    hasNext: boolean;
    nextCursor?: string | null;
  };
}
