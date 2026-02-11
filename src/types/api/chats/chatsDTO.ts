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
  peer: {
    userId: number;
    nickname: string;
    profileImageUrl: string;
    areaName: string;
  };
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
    profileImageUrl: string;
  };
}

//v1/chats/rooms/{chatRoomId}/messages(get)
export interface IChatsRoomIdMessagesGetResponse {
  chatRoomId: number;
  peer: {
    userId: number;
    nickname: string;
    age: number;
    areaName: string;
  };
  items: {
    messageId: number;
    type: MessageType;
    text: null | string;
    mediaUrl: string;
    durationSec: number;
    senderUserId: number;
    sendAt: string;
    readAt: string | null;
    isMine: boolean;
  }[];

  nextCursor: string | null;
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
//v1/chats/rooms/{chatRoomId}/media/presign(post)
export interface IChatsRoomIdMediaPresignPostRequest {
  type: MessageType;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}
export interface IChatsRoomIdMediaPresignPostResponse {
  uploadUrl: string;
  mediaRef: string;
  expiresAt: string;
  requireHeaders: {
    "Content-Type": string;
  };
}
