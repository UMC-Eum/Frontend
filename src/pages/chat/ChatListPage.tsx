import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getChatRooms } from "../../api/chats/chatsApi"; 
import { IChatsRoomItem } from "../../types/api/chats/chatsDTO";

export default function ChatListPage() {
  const navigate = useNavigate();
  // 채팅방 목록 저장
  const [rooms, setRooms] = useState<IChatsRoomItem[]>([]);
  // 다음 페이지 커서(무한 스크롤 위한)
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  // UI 표시용 State
  const [isLoading, setIsLoading] = useState(false); 
  // 마지막 페이지 여부(커서를 받아오기 위해서)
  const [isLastPage, setIsLastPage] = useState(false);

  // 로딩 상태를 즉시 확인하기 위한 Ref (무한루프 방지용)
  const loadingRef = useRef(false);
  // 무한 스크롤을 위한 Ref (화면을 감시함)
  const observerTarget = useRef<HTMLDivElement>(null);
  // 채팅방 목록을 가져오는 함수
  const fetchRooms = useCallback(async (cursor: string | null) => {
    // State인 isLoading 대신 Ref를 확인하여 함수가 재생성되지 않게 함
    if (loadingRef.current) return;
    
    // 로딩 상태를 true로 하여 함수 재 호출 되지 않도록 함
    loadingRef.current = true;
    // UI 표시용 State
    setIsLoading(true);

    try {
      const response = await getChatRooms({ 
        size: 20, 
        cursor: cursor 
      });

      if (response) {
        // 🚨 [핵심 수정 2] response.items를 변수에 담고, 더미 데이터 로직을 적용
        let fetchedItems = response.items;

        // 데이터가 없고 첫 페이지 로딩일 때만 더미 데이터 사용
        if (fetchedItems.length === 0 && !cursor) {
          console.log("데이터가 없어서 더미 데이터를 사용합니다.");
          fetchedItems = [
            {
              chatRoomId: 55,
              peer: { userId: 9, nickname: "루시", profileImageUrl: "https://cdn.example.com/files/u9.jpg" },
              lastMessage: { type: "TEXT", textPreview: "이것은 테스트 메시지입니다.", sentAt: new Date().toISOString() },
              unreadCount: 3,
            },
            {
              chatRoomId: 555,
              peer: { userId: 2, nickname: "개발자", profileImageUrl: "https://via.placeholder.com/52" },
              lastMessage: { type: "AUDIO", textPreview: "", sentAt: new Date().toISOString() },
              unreadCount: 0,
            }
          ];
        }

        // 커서 값이 있다면 추가 로딩된 데이터를 기존 데이터에 추가
        if (!cursor) {
          setRooms(fetchedItems);
        } else {
          setRooms((prev) => [...prev, ...fetchedItems]);
        }
        
        setNextCursor(response.nextCursor);
        
        // 다음 커서가 없고, 가져온 아이템도(더미포함) 없으면 마지막 페이지
        if (!response.nextCursor && fetchedItems.length === 0) {
          setIsLastPage(true);
        }
      }
    } catch (error) {
      console.error("채팅방 목록 불러오기 실패:", error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
    // 의존성 배열을 빈 배열로 설정해서 fetchRooms 함수가 초기 1번만 생성되고 재생성되지 않도록 함
  }, []); //

  // 1. 초기 진입 usecallback이라 1번만 실행 됨(변하지 않기에)
  useEffect(() => {
    fetchRooms(null);
  }, [fetchRooms]);

  // 2. 무한 스크롤 Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 로딩중이 아니고, 마지막 페이지 아니고, 다음 커서가 있을 때만 실행
        if (entries[0].isIntersecting && !loadingRef.current && !isLastPage && nextCursor) {
          fetchRooms(nextCursor);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, isLastPage, fetchRooms]); // isLoading 제거

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000 / 60;
    
    if (diff < 1) return "방금 전";
    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 60 * 24) return `${Math.floor(diff / 60)}시간 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <div className="w-full h-dvh flex flex-col bg-white overflow-hidden">
      <header className="shrink-0 h-[45px] px-5 flex items-center bg-white z-10">
        <h1 className="text-[24px] font-bold text-black">대화</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-20 scroll-smooth">
        {!isLoading && rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm">
            진행 중인 대화가 없습니다.
          </div>
        )}

        {rooms.map((room) => (
          <div 
            key={room.chatRoomId}
            onClick={() => navigate(`/message/room/${room.chatRoomId}`)}
            className="flex items-center gap-4 px-5 py-4 border-b border-[#E9ECED] cursor-pointer"
          >
            <div className="relative shrink-0 w-[76px] h-[76px] rounded-full overflow-hidden bg-gray-200">
              <img 
                src={room.peer.profileImageUrl} 
                alt={room.peer.nickname}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[18px] font-semibold text-black truncate">
                  {room.peer.nickname}
                </span>
                <span className="text-[14px] text-[#999]">
                   성수동 · {room.lastMessage?.sentAt ? formatTime(room.lastMessage.sentAt) : ""}
                </span>
              </div>
              
              <p className="text-[16px] text-[#555] truncate leading-snug">
                {!room.lastMessage ? (
                  "대화를 시작해보세요!" 
                ) : room.lastMessage.type === "AUDIO" ? (
                  <span className="flex items-center gap-1">
                    음성메시지를 보냈어요
                  </span>
                ) : (
                  room.lastMessage.textPreview
                )}
              </p>
            </div>

            {room.unreadCount > 0 && (
              <div className="shrink-0 w-6 h-6 rounded-full bg-[#FC3367] flex items-center justify-center">
                <span className="text-[14px] text-white">
                  {room.unreadCount > 99 ? "99+" : room.unreadCount}
                </span>
              </div>
            )}
          </div>
        ))}
        
        <div ref={observerTarget} className="h-5 w-full" />
      </div>
      <Navbar />
    </div>
  );
}