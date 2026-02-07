import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

// 타입들 불러오기
import { SocketResponse, MessageSendData, JoinData } from '../types/api/socket';

// 배포 서버 주소로 변경
const SOCKET_URL = import.meta.env.VITE_API_URL+"/chats";
interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  
  // 소켓 연결 함수 (방 번호 필수 아님, 일단 연결부터)
  connect: () => void;
  
  // 연결 해제 함수
  disconnect: () => void;

  // 채팅방 입장
  joinRoom: (roomId: number) => void;

  // 메시지 전송
  sendMessage: (
    roomId: number,
    type: "TEXT" | "AUDIO" | "IMAGE",
    content: string,
    durationSec?: number
  ) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,

  //연결시도, 토큰 없으면 연결 안함
  connect: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // 이미 연결되어 있으면 재연결 안 함 (중복 방지)
    if (get().socket?.connected) return;


    //소켓 연결
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("✅ [Store] 소켓 전역 연결 성공:", newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ [Store] 소켓 연결 끊김");
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
      socket.emit("room.join", { chatRoomId: roomId }, (res: SocketResponse<JoinData>) => {
        console.log(`🚪 ${roomId}번 방 입장 시도:`, res);
      });
    }
  },

  sendMessage: (roomId, type, content, durationSec) => {
    const socket = get().socket;
    if (!socket) return;

    const payload = {
      chatRoomId: roomId,
      type,
      text: type === "TEXT" ? content : null,
      mediaUrl: type !== "TEXT" ? content : null,
      durationSec
    };

    socket.emit("message.send", payload, (res: SocketResponse<MessageSendData>) => {
      console.log("📤 전송 결과:", res);
    });
  }
}));