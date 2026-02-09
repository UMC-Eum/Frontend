import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { MessageSendData, JoinData } from '../types/api/socket';
import { ApiSuccessResponse } from '../types/api/api';

// 1. [Namespace] 문서에 명시된 "chats" 네임스페이스
const NAMESPACE = "https://back.eum-dating.com/chats";

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: number) => void;
  sendMessage: (roomId: number, type: "TEXT" | "AUDIO" | "IMAGE", content: string, durationSec?: number) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        console.error("❌ 토큰이 없습니다.");
        return;
    }

    if (get().socket?.connected) return;

    console.log(`🔌 소켓 연결 시도: ${NAMESPACE}`);

    // 2. [소켓 설정] 여기가 핵심입니다.
    const newSocket = io(NAMESPACE, {
      
      // [Path] 아까 유일하게 404가 안 떴던 그 경로
      path: "/ws", 
      
      // [Transports] ⚠️ 중요: Polling은 404가 뜨므로 반드시 뺍니다!
      transports: ["websocket"],
      
      // [Auth] 문서에 "Handshake에서 JWT 전달"이라고만 되어 있어서,
      // Bearer가 필요한지 아닌지 몰라 둘 다 보냅니다. (서버가 알아서 맞는 걸 씁니다)
      auth: { 
        token: token,             // 그냥 토큰값
      },
    });

    newSocket.on("connect", () => {
      console.log("✅ [Store] 드디어 연결 성공! ID:", newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on("connect_error", (err) => {
      // 404면 Path 문제, 아니면 Auth/Namespace 문제입니다.
      console.error("🔥 [Store] 연결 실패:", err.message);
      console.dir(err); 
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ [Store] 연결 끊김:", reason);
      set({ isConnected: false });
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, isConnected: false });
  },

  joinRoom: (roomId: number) => {
    const socket = get().socket;
    if (socket) {
      socket.emit("room.join", { chatRoomId: roomId }, (res: ApiSuccessResponse<JoinData>) => {
        console.log(`🚪 방 입장 결과:`, res);
      });
    }
  },

  sendMessage: (roomId, type, content, durationSec) => {
    const socket = get().socket;
    if (socket) {
      const payload = {
        chatRoomId: roomId,
        type,
        text: type === "TEXT" ? content : null,
        mediaUrl: type !== "TEXT" ? content : null,
        durationSec
      };
      socket.emit("message.send", payload, (res: ApiSuccessResponse<MessageSendData>) => {
        console.log("📤 전송 결과:", res);
      });
    }
  }
}));