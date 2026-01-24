import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IChatsRoomItem } from "../../types/api/chats/chatsDTO";
import Navbar from "../../components/Navbar";

// 👇 [UI 확인용] 가짜 데이터
const DUMMY_ROOMS: IChatsRoomItem[] = [
  {
    chatRoomId: 1,
    peer: { userId: 100, nickname: "김성수", profileImageUrl: "https://picsum.photos/200/300?random=1" },
    lastMessage: { type: "TEXT", textPreview: "안녕하세요~ 반갑습니다!", sentAt: new Date().toISOString() },
    unreadCount: 2,
  },
  {
    chatRoomId: 2,
    peer: { userId: 101, nickname: "이민지", profileImageUrl: "https://picsum.photos/200/300?random=2" },
    lastMessage: { type: "AUDIO", textPreview: "음성 메시지", sentAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() }, // 1시간 전
    unreadCount: 0,
  },
  {
    chatRoomId: 3,
    peer: { userId: 102, nickname: "박준형", profileImageUrl: "https://picsum.photos/200/300?random=3" },
    lastMessage: { type: "TEXT", textPreview: "관심 있어서 연락드렸어요.", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }, // 어제
    unreadCount: 5,
  },
  {
    chatRoomId: 4,
    peer: { userId: 103, nickname: "박준형", profileImageUrl: "https://picsum.photos/200/300?random=3" },
    lastMessage: { type: "TEXT", textPreview: "관심 있어서 연락드렸어요.", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }, // 어제
    unreadCount: 5,
  },
  {
    chatRoomId: 5,
    peer: { userId: 104, nickname: "박준형", profileImageUrl: "https://picsum.photos/200/300?random=3" },
    lastMessage: { type: "TEXT", textPreview: "관심 있어서 연락드렸어요.", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }, // 어제
    unreadCount: 5,
  },
  {
    chatRoomId: 6,
    peer: { userId: 105, nickname: "박준형", profileImageUrl: "https://picsum.photos/200/300?random=3" },
    lastMessage: { type: "TEXT", textPreview: "관심 있어서 연락드렸어요.", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }, // 어제
    unreadCount: 5,
  },
  {
    chatRoomId: 7,
    peer: { userId: 102, nickname: "박준형", profileImageUrl: "https://picsum.photos/200/300?random=3" },
    lastMessage: { type: "TEXT", textPreview: "관심 있어서 연락드렸어요.", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }, // 어제
    unreadCount: 5,
  },
  {
    chatRoomId: 8,
    peer: { userId: 102, nickname: "박준형", profileImageUrl: "https://picsum.photos/200/300?random=3" },
    lastMessage: { type: "TEXT", textPreview: "관심 있어서 연락드렸어요.", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }, // 어제
    unreadCount: 5,
  }
];

export default function ChatListPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<IChatsRoomItem[]>([]);

  useEffect(() => {
    // API 호출 대신 가짜 데이터 세팅
    setRooms(DUMMY_ROOMS);
  }, []);

  // 시간 포맷팅 (방금, 10분전, 어제 등)
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000 / 60; // 분 차이
    
    if (diff < 1) return "방금 전";
    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 60 * 24) return `${Math.floor(diff / 60)}시간 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <div className="w-full h-dvh flex flex-col bg-white overflow-hidden">
      
      {/* Header */}
      <header className="shrink-0 h-[45px] px-5 flex items-center bg-white z-10">
        <h1 className="text-[24px] font-bold text-black]">대화</h1>
      </header>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto pb-20 scroll-smooth">
        {rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm">
            진행 중인 대화가 없습니다.
          </div>
        )}

        {rooms.map((room) => (
          <div 
            key={room.chatRoomId}
            onClick={() => navigate(`/message/room/${room.chatRoomId}`)}
            className="flex items-center gap-4 px-5 py-4 border-b border-[E9ECED] cursor-pointer"
          > {/*상단 div에 px있는거 뚫고 하단 선 만들기*/}
            {/* Avatar */}
            <div className="relative shrink-0 w-[76px] h-[76px] rounded-full overflow-hidden bg-gray-200">
              <img 
                src={room.peer.profileImageUrl || "https://via.placeholder.com/52"} 
                alt={room.peer.nickname}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[18px] font-semibold text-balck truncate">
                  {room.peer.nickname}
                </span>
                <span className="text-[14px] text-[#999]">
                   성수동 · {formatTime(room.lastMessage.sentAt)}
                </span>
              </div>
              
              <p className="text-[16px] text-[#555] truncate leading-snug">
                {room.lastMessage.type === "AUDIO" ? (
                  <span className="flex items-center gap-1">
                    음성메시지를 보냈어요
                  </span>
                ) : (
                  room.lastMessage.textPreview
                )}
              </p>
            </div>

            {/* Unread Badge */}
            {room.unreadCount > 0 && (
              <div className="shrink-0 w-6 h-6 rounded-full bg-[#FC3367] flex items-center justify-center">
                <span className="text-[14px] text-white">
                  {room.unreadCount > 99 ? "99+" : room.unreadCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <Navbar />
    </div>
  );
}