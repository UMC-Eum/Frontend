export interface IProfileSummary {
  id?: number;
  profileImageUrl?: string | null;
  nickname: string;
  age?: number | null;
  // 신규 서버 응답은 birthdate를 사용하고, birthDate는 기존 응답 호환용입니다.
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
  targetUserId: number | string;
}
export interface IHeartsResponse {
  heartId: number;
  createdAt?: string;
}

//v1/hearts/sent(get)
export interface IHeartsentItem {
  heartId: number;
  targetUserId: number | null;
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
  fromUserId: number | null;
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

//v1/report/clubs/{clubId}(post), v1/report/clubs/{clubId}/articles/{articleId}(post)
export interface IClubReportRequest {
  category: ReportCategory;
  reason: string;
}
export interface IClubReportResponse {
  reportId: number;
  category: ReportCategory;
  reason: string;
  clubId: number;
  articleId?: number;
}
