import { io } from "socket.io-client";
import type { ManagerOptions, Socket, SocketOptions } from "socket.io-client";

import { getAccessToken } from "@/api/axiosInstance";
import type {
  MemberJoinedPayload,
  MessageDeletedPayload,
  MessageNewPayload,
  MessageReadPayload,
  MessageSendAckResponse,
  MessageSendRequest,
  PingAckResponse,
  RoomJoinAckResponse,
  RoomJoinRequest,
} from "@/types/api/socket";

const CHAT_SOCKET_NAMESPACE = "/chats";
const CHAT_SOCKET_PATH = "/ws";
const DEFAULT_ACK_TIMEOUT_MS = 10000;
export const CHAT_SOCKET_ACK_TIMEOUT_MESSAGE =
  "Socket.IO ACK 응답 시간이 초과되었습니다.";

type ChatServerToClientEvents = {
  "message.new": (payload: MessageNewPayload) => void;
  "message.read": (payload: MessageReadPayload) => void;
  "message.deleted": (payload: MessageDeletedPayload) => void;
  // CLUB(단체) 채팅방 전용: 새 멤버 입장 브로드캐스트
  "member.joined": (payload: MemberJoinedPayload) => void;
};

type ChatClientToServerEvents = {
  ping: (callback: (response: PingAckResponse) => void) => void;
  "room.join": (
    payload: RoomJoinRequest,
    callback: (response: RoomJoinAckResponse) => void,
  ) => void;
  "message.send": (
    payload: MessageSendRequest,
    callback: (response: MessageSendAckResponse) => void,
  ) => void;
};

export type ChatSocket = Socket<
  ChatServerToClientEvents,
  ChatClientToServerEvents
>;

type ChatSocketOptions = Partial<ManagerOptions & SocketOptions>;
type UnsubscribeSocketEvent = () => void;

let chatSocket: ChatSocket | null = null;

const getChatSocketBaseUrl = () => {
  const normalizedSocketBaseUrl =
    process.env.EXPO_PUBLIC_SOCKET_BASE_URL?.replace(/\/+$/, "");
  if (normalizedSocketBaseUrl) {
    return normalizedSocketBaseUrl;
  }

  const normalizedApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(
    /\/+$/,
    "",
  );
  if (normalizedApiBaseUrl) {
    return normalizedApiBaseUrl.replace(/\/api$/, "");
  }

  throw new Error(
    "EXPO_PUBLIC_SOCKET_BASE_URL 또는 EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다.",
  );
};

const getChatSocketUrl = () => {
  return `${getChatSocketBaseUrl()}${CHAT_SOCKET_NAMESPACE}`;
};

export const getChatSocketDebugConfig = () => ({
  socketUrl: getChatSocketUrl(),
  path: CHAT_SOCKET_PATH,
  hasToken: Boolean(getAccessToken()),
});

const getChatSocketAuth = () => {
  const token = getAccessToken();
  return token ? { token } : {};
};

const getChatSocketExtraHeaders = (): Record<string, string> | undefined => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const validateMessageSendRequest = (payload: MessageSendRequest) => {
  if (payload.type === "TEXT" && payload.text.trim().length === 0) {
    throw new Error("텍스트 메시지는 공백만 보낼 수 없습니다.");
  }

  if (payload.type === "AUDIO" && payload.durationSec <= 0) {
    throw new Error("음성 메시지 길이는 0보다 커야 합니다.");
  }
};

const emitWithAck = <TResponse>(
  emit: (callback: (response: TResponse) => void) => void,
  timeoutMs = DEFAULT_ACK_TIMEOUT_MS,
) => {
  return new Promise<TResponse>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(CHAT_SOCKET_ACK_TIMEOUT_MESSAGE));
    }, timeoutMs);

    emit((response) => {
      clearTimeout(timeoutId);
      resolve(response);
    });
  });
};

export const createChatSocket = (options: ChatSocketOptions = {}) => {
  const socketUrl = getChatSocketUrl();
  const auth = getChatSocketAuth();
  const extraHeaders = getChatSocketExtraHeaders();

  if (__DEV__) {
    console.log("[ChatSocket] create", getChatSocketDebugConfig());
  }

  return io(socketUrl, {
    path: CHAT_SOCKET_PATH,
    transports: ["websocket"],
    autoConnect: false,
    auth,
    extraHeaders,
    ...options,
  }) as ChatSocket;
};

export const getChatSocket = (options?: ChatSocketOptions) => {
  if (!chatSocket) {
    chatSocket = createChatSocket(options);
  }

  return chatSocket;
};

export const connectChatSocket = (options?: ChatSocketOptions) => {
  const socket = getChatSocket(options);

  // 재연결 시 최신 accessToken을 handshake auth에 반영
  socket.auth = getChatSocketAuth();
  socket.io.opts.extraHeaders = getChatSocketExtraHeaders();

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectChatSocket = () => {
  chatSocket?.disconnect();
  chatSocket = null;
};

export const pingChatSocket = (
  socket = connectChatSocket(),
  timeoutMs?: number,
) => {
  return emitWithAck<PingAckResponse>(
    (callback) => socket.emit("ping", callback),
    timeoutMs,
  );
};

export const joinChatRoomSocket = (
  payload: RoomJoinRequest,
  socket = connectChatSocket(),
  timeoutMs?: number,
) => {
  return emitWithAck<RoomJoinAckResponse>(
    (callback) => socket.emit("room.join", payload, callback),
    timeoutMs,
  );
};

export const sendChatMessageSocket = (
  payload: MessageSendRequest,
  socket = connectChatSocket(),
  timeoutMs?: number,
) => {
  validateMessageSendRequest(payload);

  return emitWithAck<MessageSendAckResponse>(
    (callback) => socket.emit("message.send", payload, callback),
    timeoutMs,
  );
};

export const onMessageNew = (
  listener: (payload: MessageNewPayload) => void,
  socket = connectChatSocket(),
): UnsubscribeSocketEvent => {
  socket.on("message.new", listener);
  return () => socket.off("message.new", listener);
};

export const onMessageRead = (
  listener: (payload: MessageReadPayload) => void,
  socket = connectChatSocket(),
): UnsubscribeSocketEvent => {
  socket.on("message.read", listener);
  return () => socket.off("message.read", listener);
};

export const onMessageDeleted = (
  listener: (payload: MessageDeletedPayload) => void,
  socket = connectChatSocket(),
): UnsubscribeSocketEvent => {
  socket.on("message.deleted", listener);
  return () => socket.off("message.deleted", listener);
};

// CLUB(단체) 채팅방 전용: 새 멤버 입장 이벤트 구독
export const onMemberJoined = (
  listener: (payload: MemberJoinedPayload) => void,
  socket = connectChatSocket(),
): UnsubscribeSocketEvent => {
  socket.on("member.joined", listener);
  return () => socket.off("member.joined", listener);
};
