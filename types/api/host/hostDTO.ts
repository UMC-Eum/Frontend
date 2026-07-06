import type {
  ClubAuthority,
  ClubCategory,
  ClubMemberStatus,
  IClubKeyword,
  IClubMemberRelationResponse,
} from "../club/clubDTO";

export interface IClubUpdateRequest {
  name?: string;
  introText?: string;
  introVoice?: string | null;
  capacity?: number;
  category?: ClubCategory;
}

export interface IClubUpdateResponse {
  clubId: number;
  name: string;
  introText: string;
  introVoice: string | null;
  category: ClubCategory;
  capacity: number;
  keywords: IClubKeyword[];
  updatedAt: string;
}

export interface IClubDeleteResponse {
  clubId: number;
  deletedAt: string;
}

export interface IClubMembersParams {
  status?: ClubMemberStatus;
  cursor?: string | null;
  limit?: number;
}

export interface IClubMemberBadge {
  badgeId: number;
  name: string;
}

export interface IClubMemberItem {
  clubUserId: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  authority: ClubAuthority;
  status?: ClubMemberStatus | "KICKED" | "LEFT";
  message?: string;
  requestedAt?: string;
  joinedAt: string | null;
  age?: number;
  sex?: string;
  badges?: IClubMemberBadge[];
}

export interface IClubMembersResponse {
  members: IClubMemberItem[];
  items?: IClubMemberItem[];
  nextCursor: string | null;
}

export interface IClubMemberStatusUpdateRequest {
  status: ClubMemberStatus;
}

export interface IClubMemberAuthorityUpdateRequest {
  authority: ClubAuthority;
}

export interface IClubMemberAuthorityUpdateResponse {
  clubUserId: number;
  clubId: number;
  userId: number;
  authority: ClubAuthority;
  updatedAt: string;
}

export interface IClubMemberKickRequest {
  reason?: string;
}

export interface IClubMemberKickResponse {
  clubId: number;
  userId: number;
  kickedAt: string;
}

export interface IHostArticlePinRequest {
  isPinned: boolean;
}

export interface IHostArticlePinResponse {
  articleId: number;
  isPinned: boolean;
  updatedAt: string;
}

export type IClubMemberStatusUpdateResponse = IClubMemberRelationResponse;
