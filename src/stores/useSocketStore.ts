import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { MessageSendData, JoinData } from '../types/api/socket';
import { ApiSuccessResponse } from '../types/api/api';

// [Namespace] 
// ⚠️ 주의: 백엔드 네임스페이스가 '/chats'라면 주소 뒤에 붙여야 합니다.
// 예: "https://back.eum-dating.com/chats"
const NAMESPACE = "https://back.eum-dating.com/chats"; 

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: number) => void;
  
  // 🔥 [수정] 인자 구조 변경: text와 mediaUrl 분리
  sendMessage: (
    roomId: number, 
    type: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO", // VIDEO 추가
    text: string | null, 
    mediaUrl?: string | null, 
    durationSec?: number | null
  ) => void;
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

    const newSocket = io(NAMESPACE, {
      // [Path] 백엔드 설정에 맞게 유지 (아까 /ws가 되었다면 유지)
      // 보통 NestJS 기본값은 /socket.io 이지만, 설정에 따라 다름
      path: "/ws", 
      
      transports: ["websocket"],
      
      auth: { 
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("✅ [Store] 연결 성공! ID:", newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on("connect_error", (err) => {
      console.error("🔥 [Store] 연결 실패:", err.message);
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

  // 🔥 [수정] ChatRoomPage에서 보내주는 5개 인자를 그대로 받아서 처리
  sendMessage: (roomId, type, text, mediaUrl, durationSec) => {
    const socket = get().socket;
    if (socket) {
      // 백엔드 DTO(JSON) 규격에 맞게 조립
      const payload = {
        chatRoomId: roomId,
        type: type,
        text: text,          // null이면 null로 전송
        mediaUrl: mediaUrl,  // null이면 null로 전송
        durationSec: durationSec || null // undefined 방지
      };

      console.log("📤 소켓 전송 페이로드:", payload); // 디버깅용 로그

      socket.emit("message.send", payload, (res: ApiSuccessResponse<MessageSendData>) => {
        console.log("📤 전송 서버 응답:", res);
      });
    } else {
      console.error("⚠️ 소켓이 연결되지 않아서 메시지를 보낼 수 없습니다.");
    }
  }
}));