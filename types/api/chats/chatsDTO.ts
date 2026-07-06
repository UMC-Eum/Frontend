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

//v1/chats/clubs/{clubId}/room(post)
export interface IChatsClubsClubIdRoomPostResponse {
  chatRoomId: number;
  clubId?: number;
  created?: boolean;
}

//v1/chats/rooms(get)
export type MessageType = "TEXT" | "AUDIO" | "PHOTO" | "VIDEO" | "SYSTEM";
export type ChatRoomType = "DM" | "CLUB" | (string & {});

export interface ILastMessage {
  type: MessageType | "SYSTEM";
  textPreview: string;
  sentAt: string;
}
export interface IChatsRoomItem {
  chatRoomId: number;
  type?: ChatRoomType;
  peer: {
    userId: number;
    nickname: string;
    profileImageUrl: string;
    areaName: string;
  } | null;
  club?: {
    clubId: number;
    name: string;
    thumbnailUrl: string | null;
  } | null;
  memberCount?: number;
  lastMessage: ILastMessage | null;
  unreadCount: number;
}
export interface IChatsRoomsGetResponse {
  nextCursor: string | null;
  totalUnreadCount?: number;
  items: IChatsRoomItem[];
}

//v1/chats/rooms/{chatRoomId}(get)
export interface IChatsRoomIdGetResponse {
  chatRoomId: number;
  type?: ChatRoomType;
  peer: {
    userId: number;
    nickname: string;
    age: number;
    areaName: string;
    profileImageUrl: string;
  } | null;
  club?: {
    clubId: number;
    name: string;
    thumbnailUrl: string | null;
  } | null;
  memberCount?: number;
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
    sentAt: string;
    readAt: string | null;
    unreadCount?: number | null;
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
  sentAt: string;
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
  requiredHeaders?: Record<string, string>;
}
