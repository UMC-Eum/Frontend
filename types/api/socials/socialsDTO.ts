export interface IProfileSummary {
  profileImageUrl?: string | null;
  nickname: string;
  age?: number | null;
  birthdate?: string | null;
  birthDate?: string | null;
  areaName?: string | null;
  area?: {
    name?: string | null;
  } | null;
  address?: {
    fullName?: string | null;
  } | null;
}

//v1/hearts(post)
export interface IHeartsRequest {
  targetUserId: number;
}
export interface IHeartsResponse {
  heartId: number;
  createdAt?: string;
}

//v1/hearts/sent(get)
export interface IHeartsentItem {
  heartId: number;
  targetUserId: number;
  createdAt: string;
  targetUser: IProfileSummary;
}
export interface IHeartsentResponse {
  nextCursor: string | null;
  totalCount?: number;
  items: IHeartsentItem[];
}

//v1/hearts/received(get)
export interface IHeartreceivedItem {
  heartId: number;
  fromUserId: number;
  createdAt: string;
  isLiked?: boolean;
  likedHeartId?: number | null;
  fromUser: IProfileSummary;
}
export interface IHeartreceivedResponse {
  nextCursor: string | null;
  totalCount?: number;
  items: IHeartreceivedItem[];
}

//v1/block(post)
export interface IBlocksRequest {
  targetUserId: number | string;
  reason: string;
}
export interface IBlocksResponse {
  blockId: number;
  status: "BLOCKED";
  blockedAt: string;
}
//v1/block(get)
export interface IBlocksGetResponse {
  nextCursor: string | null;
  items: {
    blockId: number;
    targetUserId: number | string;
    reason: string;
    status: "BLOCKED";
    blockedAt: string;
  }[];
}
//v1/report(post)
export type ReportCategory =
  | "INAPPROPRIATE"
  | "SEXUAL_HARASSMENT"
  | "MONEY_REQUEST"
  | "ABUSE"
  | "SPAM"
  | "OTHERS";

export interface IReportsRequest {
  targetUserId: number;
  reason: string;
  category: ReportCategory;
  chatRoomId?: number;
}
export interface IReportsResponse {
  reportId: { reportId: number };
}

export interface IClubReportRequest {
  clubId: number;
  category: string;
  reason: string;
}

export interface IClubReportResponse {
  clubReportId: number;
  reportId: number;
  reportedClubId: number;
  category: string;
  reportedAt: string;
}
