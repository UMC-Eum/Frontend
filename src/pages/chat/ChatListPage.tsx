import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/standard/Navbar";
import { getChatRooms } from "../../api/chats/chatsApi"; 
import { IChatsRoomItem } from "../../types/api/chats/chatsDTO";
import { getBlocks } from "../../api/socials/socialsApi";
// 🔥 [1] 소켓 스토어 추가
import { useSocketStore } from "../../stores/useSocketStore";

export default function ChatListPage() {

  const navigate = useNavigate();
  // 🔥 [2] 소켓 객체 가져오기
  const { socket } = useSocketStore();

  // 채팅방 목록 저장
  const [rooms, setRooms] = useState<IChatsRoomItem[]>([]);
  // 커서
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  // UI 표시용 State
  const [isLoading, setIsLoading] = useState(false); 
  // 마지막 페이지 여부
  const [isLastPage, setIsLastPage] = useState(false);

  // 로딩 상태 Ref
  const loadingRef = useRef(false);
  // 무한 스크롤 Ref
  const observerTarget = useRef<HTMLDivElement>(null);
  // 차단 대상 사용자 ID 목록
  const [blockedUserIds, setBlockedUserIds ] = useState<Set<number>>(new Set());

  // 페이지 진입 시 차단 목록 가져오기
  useEffect(() => {
    const fetchBlockedList = async () => {
      try {
        const items = await getBlocks({ size: 100 });
        if (items) {
          // targetUserId 혹은 userId 확인 필요 (여기선 기존 로직 유지)
          const ids = new Set(items.items.map((item: any) => item.userId));
          setBlockedUserIds(ids);
          console.log("🚫 차단 목록 로드 완료:", ids);
        }
      } catch (error) {
        console.error("차단 목록 로드 실패", error);
      }
    };
    fetchBlockedList();
  }, []);

  // 채팅방 목록을 가져오는 함수
  // 🔥 [3] isBackground 추가: 소켓으로 갱신될 때는 로딩바를 보여주지 않기 위함
  const fetchRooms = useCallback(async (cursor: string | null, isBackground = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    
    // 배경 갱신(소켓)이 아닐 때만 UI 로딩바 표시
    if (!isBackground) setIsLoading(true);

    try {
      const response = await getChatRooms({ 
        size: 20, 
        cursor: cursor 
      });

      if (response) {
       const fetchedItems = response.items;

        // 커서가 없으면(첫 로딩 or 소켓 갱신) 덮어쓰기
        if (!cursor) {
          setRooms(fetchedItems);
        } else {
          // 커서가 있으면(더보기) 이어붙이기
          setRooms((prev) => [...prev, ...fetchedItems]);
        }
        
        setNextCursor(response.nextCursor);
        
        if (!response.nextCursor && fetchedItems.length === 0) {
          setIsLastPage(true);
        }
      }
    } catch (error) {
      console.error("채팅방 목록 불러오기 실패:", error);
    } finally {
      loadingRef.current = false;
      // 배경 갱신이 아닐 때만 로딩바 해제
      if (!isBackground) setIsLoading(false);
    }
  }, []); 

  // 1. 초기 진입 (로딩바 있음)
  useEffect(() => {
    fetchRooms(null, false);
  }, [fetchRooms]);

  // 🔥 [4] 소켓 이벤트 리스너 (알림, 읽음, 삭제 감지 -> 렌더링)
  useEffect(() => {
    if (!socket) return;

    // 목록 새로고침 핸들러 (커서 null로 초기화하여 처음부터 다시 로드)
    const handleRefresh = () => {
      console.log("♻️ [ChatList] 변경사항 감지! 목록 갱신");
      loadingRef.current = false; // 강제 리셋
      fetchRooms(null, true); // true = 로딩바 없이 조용히 갱신
    };

    // 1) 알림 수신 (notification.new) - 사진의 Payload 활용
    const handleNotification = (response: any) => {
      const payload = response.success?.data || response;
      // data 객체 안에 chatRoomId가 있다면 채팅 관련 알림임 -> 목록 갱신
      if (payload.data?.chatRoomId) {
        console.log("🔔 채팅 알림 수신:", payload.title);
        handleRefresh();
      }
    };

    // 2) 읽음 처리 (message.read) - 뱃지 카운트 갱신용
    const handleRead = () => {
      // 내 방 목록에 있는 방의 읽음 이벤트라면 갱신
      handleRefresh();
    };

    // 3) 삭제 처리 (message.deleted) - 미리보기 갱신용
    const handleDelete = () => {
      handleRefresh();
    };

    socket.on("notification.new", handleNotification);
    socket.on("message.read", handleRead);
    socket.on("message.deleted", handleDelete);

    return () => {
      socket.off("notification.new", handleNotification);
      socket.off("message.read", handleRead);
      socket.off("message.deleted", handleDelete);
    };
  }, [socket, fetchRooms]);


  // 2. 무한 스크롤 Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && !isLastPage && nextCursor) {
          fetchRooms(nextCursor, false); // 더보기는 로딩바 표시
        }
      },
      { threshold: 1.0 } 
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, isLastPage, fetchRooms]);

  // 시간 포맷 함수
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
        
        {rooms.map((room) => {
          const isBlocked = blockedUserIds.has(room.peer.userId);
          const displayUnreadCount = isBlocked ? 0 : room.unreadCount;
          
          const displayLastMessage = isBlocked 
            ? "차단된 사용자와의 대화입니다." 
            : (room.lastMessage?.textPreview || "대화를 시작해보세요!");
          
          const displayTime = isBlocked 
             ? "" 
             : (room.lastMessage?.sentAt ? formatTime(room.lastMessage.sentAt) : "");

          return (
            <div 
              key={room.chatRoomId}
              onClick={() => navigate(`/message/room/${room.chatRoomId}`)}
              className="flex items-center gap-4 px-5 py-4 border-b border-[#E9ECED] cursor-pointer"
            >
              <div className="relative shrink-0 w-[76px] h-[76px] rounded-full overflow-hidden bg-gray-200">
                <img 
                  src={room.peer.profileImageUrl} 
                  alt={room.peer.nickname}
                  className={`w-full h-full object-cover ${isBlocked ? "opacity-50 grayscale" : ""}`}
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[18px] font-semibold truncate ${isBlocked ? "text-gray-400" : "text-black"}`}>
                    {room.peer.nickname}
                  </span>
                  <span className="text-[14px] text-[#999]">
                     {room.peer.areaName ? room.peer.areaName : "성수동"} {displayTime && `· ${displayTime}`}
                  </span>
                </div>
                
                <p className="text-[16px] text-[#555] truncate leading-snug">
                  {!room.lastMessage && !isBlocked ? (
                    "대화를 시작해보세요!" 
                  ) : room.lastMessage?.type === "AUDIO" && !isBlocked ? (
                    <span className="flex items-center gap-1">
                      음성메시지를 보냈어요
                    </span>
                  ) : (
                    <span className={isBlocked ? "text-gray-300" : ""}>
                      {displayLastMessage}
                    </span>
                  )}
                </p>
              </div>

              {displayUnreadCount > 0 && (
                <div className="shrink-0 w-6 h-6 rounded-full bg-[#FC3367] flex items-center justify-center">
                  <span className="text-[14px] text-white">
                    {displayUnreadCount > 99 ? "99+" : displayUnreadCount}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        
        <div ref={observerTarget} className="h-5 w-full" />
      </div>
      <Navbar />
    </div>
  );
}