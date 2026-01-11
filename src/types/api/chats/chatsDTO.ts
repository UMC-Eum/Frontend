//v1/chats/rooms(post)
export interface IPeer {
  userId: number;
  nickname: string;
  profileImageUrl: string;
}

export interface IChatsRoomsPostRequest {
  targetUserId: number;
}
export interface IChatsRoomsPostResponse {
  chatRoomId: number;
  created: boolean;
  peer: IPeer;
}

//v1/chats/rooms(get)
export type MessageType = "TEXT" | "AUDIO" | "PHOTO" | "VIDEO";

export interface ILastMessage {
  type: MessageType;
  textPreview: string;
  sentAt: string;
}
export interface IChatsRoomItem {
  chatRoomId: number;
  peer: IPeer;
  lastMessage: ILastMessage;
  unreadCount: number;
}
export interface IChatsRoomsGetResponse {
  nextCursor: string | null;
  items: IChatsRoomItem[];
}

//v1/chats/rooms/{chatRoomId}(get)
export interface IChatsRoomIdGetResponse {
  chatRoomId: number;
  peer: {
    userId: number;
    nickname: string;
    age: number;
    areaName: string;
  };
}

//v1/chats/rooms/{chatRoomId}/messages(get)
export interface IChatsRoomIdMessagesGetResponse {
  nextCursor: string | null;
  items: {
    messageId: number;
    senderId: number;
    type: MessageType;
    audioUrl: string;
    durationSec: number;
    text: null | string;
    sendAt: string;
    readAt: string | null;
  };
}
//v1/chats/rooms/{chatRoomId}/messages(post)
export interface IChatsRoomIdMessagesPostRequset {
  type: MessageType;
  text: null | string;
  mediaUrl: string;
  durationSec: number;
}
export interface IChatsRoomIdMessagesPostResponse {
  messageId: number;
  sendAt: string;
}

//v1/chats/messages/{messageId}/read(patch)
// {
//   "success": true,
//   "data": null,
//   "error": null,
//   "timestamp": "2025-12-30T04:10:00.000Z",
//   "path": "/api/v1/chats/messages/9001/read"
// }

//v1/chats/messages/{messageId}(patch)
// {
//   "resultType": "SUCCESS",
//   "success": {
//     "data": null
//   },
//   "error": null,
//   "meta": {
//     "timestamp": "2025-12-30T04:10:00.000Z",
//     "path": "/api/v1/chats/messages/345"
//   }
// }
