//v1/hearts(post)
export interface IHeartsRequest {
  targetUserId: number;
}
export interface IHeartsResponse {
  heartId: number;
}

//v1/hearts/sent(get)
export interface IHeartsentResponse {
  nextCursor: string | null;
  items: { heartId: number; targetUserId: number; createdAt: string }[];
}

//v1/hearts/received(get)
export interface IHeartreceivedResponse {
  nextCursor: string | null;
  items: {
    heartId: number;
    fromUserId: number;
    createdAt: string;
  }[];
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
  category: string;
  description: string;
  chatRoomId: number;
}
export interface IReportsResponse {
  reportId: { reportId: number };
}
