// 서버 공통 응답 포맷
export interface SocketResponse<T = any> {
  resultType: "SUCCESS" | "ERROR";
  success: {
    data: T;
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
  meta: {
    timestamp: string;
    path: string;
  };
}

// room.join 응답 데이터
export interface JoinData {
  joined: string; // 예: "room:55"
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
  type: "TEXT" | "AUDIO" | "IMAGE";
  text: string | null;
  mediaUrl: string | null;
  durationSec: number;
  sentAt: string;
}
