import { create } from "zustand";
import { io, Socket } from "socket.io-client";

const NAMESPACE = "https://back.eum-dating.com/chats";

export interface ChatNotification {
  chatRoomId: number;
  senderUserId: number;
  senderName: string;
  senderProfileImage: string;
  messagePreview: string;
  messageType: string;
}

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  joinedRoomIds: Set<number>;
  currentChatRoomId: number | null; // 현재 보고 있는 채팅방 ID

  // 채팅 알림 상태
  chatNotification: ChatNotification | null;
  showChatNotification: (notification: ChatNotification) => void;
  hideChatNotification: () => void;
  setCurrentChatRoomId: (roomId: number | null) => void;

  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: number) => void;

  sendMessage: (
    roomId: number,
    type: "TEXT" | "PHOTO" | "AUDIO" | "VIDEO",
    text: string | null,
    mediaUrl?: string | null,
    durationSec?: number | null,
  ) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  joinedRoomIds: new Set(),
  currentChatRoomId: null,
  chatNotification: null,

  showChatNotification: (notification: ChatNotification) => {
    set({ chatNotification: notification });
  },

  hideChatNotification: () => {
    set({ chatNotification: null });
  },

  setCurrentChatRoomId: (roomId: number | null) => {
    set({ currentChatRoomId: roomId });
  },

  connect: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("토큰이 없습니다.");
      return;
    }

    if (get().socket?.connected) return;

    const newSocket = io(NAMESPACE, {
      path: "/ws",
      transports: ["websocket"],
      auth: {
        token: token,
      },
      reconnection: true,
    });

    newSocket.on("connect", () => {
      set({ isConnected: true });

      const { joinedRoomIds } = get();
      joinedRoomIds.forEach((roomId) => {
        newSocket.emit("room.join", { chatRoomId: roomId });
      });
    });

    newSocket.on("connect_error", (err) => {
      console.error("연결 실패:", err.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("연결 끊김:", reason);
      set({ isConnected: false });
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, isConnected: false, joinedRoomIds: new Set() });
  },

  joinRoom: (roomId: number) => {
    const { socket, joinedRoomIds } = get();

    if (socket && !joinedRoomIds.has(roomId)) {
      socket.emit("room.join", { chatRoomId: roomId });

      const newSet = new Set(joinedRoomIds);
      newSet.add(roomId);
      set({ joinedRoomIds: newSet });
    }
  },

  sendMessage: (roomId, type, text, mediaUrl, durationSec) => {
    const socket = get().socket;
    if (socket) {
      const payload = {
        chatRoomId: roomId,
        type: type,
        text: text,
        mediaUrl: mediaUrl,
        durationSec: durationSec || null,
      };

      socket.emit("message.send", payload);
    } else {
      console.error("소켓이 연결되지 않아서 메시지를 보낼 수 없습니다.");
    }
  },
}));
