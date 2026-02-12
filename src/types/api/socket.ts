// room.join 응답 데이터
export interface JoinData {
  joined: string;
}

// message.send 응답 데이터 (ACK)
export interface MessageSendData {
  messageId: number;
  sentAt: string;
}

// message.new 푸시 데이터 (Broadcast)
export interface MessageNewData {
  messageId: number;
  chatRoomId: number;
  senderUserId: number;
  type: "TEXT" | "AUDIO" | "PHOTO" | "VIDEO";
  text: string | null;
  mediaUrl: string | null;
  durationSec: number;
  sentAt: string;
}
