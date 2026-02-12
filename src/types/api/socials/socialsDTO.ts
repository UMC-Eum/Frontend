// 공통: 프로필 정보
export interface IProfileSummary {
  profileImageUrl: string;
  nickname: string;
  age: number;
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
  items: IHeartsentItem[];
}

//v1/hearts/received(get)
export interface IHeartreceivedItem {
  heartId: number;
  fromUserId: number;
  createdAt: string;
  fromUser: IProfileSummary;
}
export interface IHeartreceivedResponse {
  nextCursor: string | null;
  items: IHeartreceivedItem[];
}

//v1/hearts/{heartId}(patch)
// {
//   "resultType": "SUCCESS",
//   "success": {
//     "data": null
//   },
//   "error": null,
//   "meta": {
//     "timestamp": "2025-12-30T04:10:00.000Z",
//     "path": "/api/v1/hearts/101"
//   }
// }

//v1/blocks(post)
export interface IBlocksRequest {
  targetUserId: number;
  reason: string;
}
export interface IBlocksResponse {
  blockId: number;
  status: "BLOCKED";
  blockedAt: string;
}
//v1/blocks(get)
export interface IBlocksGetResponse {
  nextCursor: "opaque_cursor" | null;
  items: {
    blockId: number;
    targetUserId: number;
    reason: string;
    status: "BLOCKED";
    blockedAt: string;
  }[];
}
//v1/blocks/{blockId}(patch)
//   {
//   "resultType": "SUCCESS",
//   "success": {
//     "data": null
//   },
//   "error": null,
//   "meta": {
//     "timestamp": "2025-12-30T04:10:00.000Z",
//     "path": "/api/v1/blocks/1"
//   }
// }

//v1/reports(post)
export interface IReportsRequest {
  targetUserId: number;
  reason: string;
  category: string;
  chatRoomId: number;
}
export interface IReportsResponse {
  reportId: { reportId: number };
}
