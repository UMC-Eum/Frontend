import type { ApiFailResponse, ApiSuccessResponse } from "./api";

// Socket.IO ACK 실패 응답 타입
export type SocketFailResponse<TErrorCode extends string = string> = Omit<
  ApiFailResponse,
  "error"
> & {
  error: ApiFailResponse["error"] & {
    code: TErrorCode;
  };
};

// Socket.IO ACK 공통 응답 타입
export type SocketAckResponse<
  TData,
  TErrorCode extends string = string,
> = ApiSuccessResponse<TData> | SocketFailResponse<TErrorCode>;

// Socket.IO Broadcast 공통 payload 타입
export type SocketBroadcastPayload<TData> = ApiSuccessResponse<TData>;

export type ChatMessageType = "TEXT" | "AUDIO" | "PHOTO" | "VIDEO";

// ping 응답 데이터 (ACK)
export interface PingAckData {
  ok: boolean;
  userId: number;
  ts: string;
}

export type PingAckResponse = SocketAckResponse<PingAckData>;

// room.join 요청 데이터
export interface RoomJoinRequest {
  chatRoomId: number;
}

// room.join 응답 데이터 (ACK)
export interface RoomJoinAckData {
  joined: string;
}

// CHAT-003: CLUB(단체) 방에 가입 승인 안 된 사용자가 입장 시도 (delta 명세)
export type RoomJoinErrorCode =
  | "VALID-001"
  | "AUTH-001"
  | "CHAT-002"
  | "CHAT-003";

export type RoomJoinAckResponse = SocketAckResponse<
  RoomJoinAckData,
  RoomJoinErrorCode
>;

// message.send 요청 데이터: TEXT는 text, AUDIO/PHOTO/VIDEO는 mediaUrl 필수
export type MessageSendRequest =
  | {
      chatRoomId: number;
      type: "TEXT";
      // 공백 불가 검증은 전송 전 런타임에서 처리
      text: string;
      mediaUrl?: null;
      durationSec?: null;
    }
  | {
      chatRoomId: number;
      type: "AUDIO";
      text?: null;
      mediaUrl: string;
      // 양수 검증은 전송 전 런타임에서 처리
      durationSec: number;
    }
  | {
      chatRoomId: number;
      type: "PHOTO" | "VIDEO";
      text?: null;
      mediaUrl: string;
      durationSec?: null;
    };

// message.send 응답 데이터 (ACK)
export interface MessageSendAckData {
  messageId: number;
  sentAt: string;
}

export type MessageSendErrorCode =
  | "VALID-001"
  | "VALID-002"
  | "AUTH-001"
  | "CHAT-002"
  | "CHAT-001";

export type MessageSendAckResponse = SocketAckResponse<
  MessageSendAckData,
  MessageSendErrorCode
>;

// message.new 푸시 데이터 (Broadcast)
export interface MessageNewData {
  messageId: number;
  chatRoomId: number;
  senderUserId: number;
  type: ChatMessageType;
  text: string | null;
  mediaUrl: string | null;
  durationSec: number;
  sentAt: string;
  // 서버에서 제공하는 경우 (선택적)
  senderName?: string;
  senderProfileImage?: string;
}

export type MessageNewPayload = SocketBroadcastPayload<MessageNewData>;

// message.read 푸시 데이터 (Broadcast)
export interface MessageReadData {
  messageId: number;
  chatRoomId: number;
  readerUserId: number;
  readAt: string;
  // CLUB delta: 아직 안 읽은 멤버 수(본인 제외). DIRECT는 0/1, CLUB은 ≥0.
  unreadCount?: number;
}

export type MessageReadPayload = SocketBroadcastPayload<MessageReadData>;

// message.deleted 푸시 데이터 (Broadcast)
export interface MessageDeletedData {
  messageId: number;
  chatRoomId: number;
  deletedByUserId: number;
  deletedAt: string;
}

export type MessageDeletedPayload =
  SocketBroadcastPayload<MessageDeletedData>;

// member.joined 푸시 데이터 (Broadcast) — CLUB(단체) 채팅방 전용
export interface MemberJoinedData {
  chatRoomId: number;
  userId: number;
  nickname: string;
  joinedAt: string;
  memberCount: number;
}

export type MemberJoinedPayload = SocketBroadcastPayload<MemberJoinedData>;
