import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { MessageSendData, JoinData } from '../types/api/socket';
import { ApiSuccessResponse } from '../types/api/api';

// [Namespace] 
const NAMESPACE = "https://back.eum-dating.com/chats"; 

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  joinedRoomIds: Set<number>; // 🔥 [추가] 이미 입장한 방 목록 (중복 Join 방지)

  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: number) => void;
  
  sendMessage: (
    roomId: number, 
    type: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO", 
    text: string | null, 
    mediaUrl?: string | null, 
    durationSec?: number | null
  ) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  joinedRoomIds: new Set(), // 🔥 [추가] 초기화

  connect: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        console.error("❌ 토큰이 없습니다.");
        return;
    }

    // 이미 연결되어 있다면 재연결 하지 않음
    if (get().socket?.connected) return;

    console.log(`🔌 소켓 연결 시도: ${NAMESPACE}`);

    const newSocket = io(NAMESPACE, {
      path: "/ws", 
      transports: ["websocket"],
      auth: { 
        token: token,
      },
      reconnection: true, // 자동 재연결 활성화
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
      // 주의: 자동 재연결 시에는 joinedRoomIds를 유지해야 할 수도 있으나,
      // 완전히 끊겼을 때를 대비해 보통 여기서 초기화하거나, 재연결 로직에서 처리합니다.
      // 일단 여기서는 유지합니다 (잠깐 끊겨도 목록은 유지되도록).
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    // 🔥 [수정] 연결 끊을 때 목록도 초기화
    set({ socket: null, isConnected: false, joinedRoomIds: new Set() });
  },

  joinRoom: (roomId: number) => {
    const { socket, joinedRoomIds } = get();

    // 🔥 [핵심 수정] 소켓이 있고, "아직 이 방에 안 들어갔을 때만" 요청!
    if (socket && !joinedRoomIds.has(roomId)) {
      
      socket.emit("room.join", { chatRoomId: roomId }, (res: ApiSuccessResponse<JoinData>) => {
        console.log(`🚪 ${roomId}번 방 입장 결과:`, res);
      });

      // 🔥 [추가] Set에 방 ID 추가 (불변성 유지)
      const newSet = new Set(joinedRoomIds);
      newSet.add(roomId);
      set({ joinedRoomIds: newSet });
      
      console.log(`📌 [Local] ${roomId}번 방 입장 처리 완료 (중복 방지용)`);
    } else {
      // 이미 들어간 방이면 로그만 찍고 무시 (서버 부하 감소)
      // console.log(`⚠️ 이미 입장한 방입니다: ${roomId}`);
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
        durationSec: durationSec || null 
      };

      console.log("📤 소켓 전송 페이로드:", payload); 

      socket.emit("message.send", payload, (res: ApiSuccessResponse<MessageSendData>) => {
        console.log("📤 전송 서버 응답:", res);
      });
    } else {
      console.error("⚠️ 소켓이 연결되지 않아서 메시지를 보낼 수 없습니다.");
    }
  }
}));