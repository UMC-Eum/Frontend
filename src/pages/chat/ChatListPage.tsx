import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/standard/Navbar";
import { getChatRooms } from "../../api/chats/chatsApi";
import { IChatsRoomItem } from "../../types/api/chats/chatsDTO";
import { getBlocks } from "../../api/socials/socialsApi";
import { useSocketStore } from "../../stores/useSocketStore";

export default function ChatListPage() {
  const navigate = useNavigate();
  const { socket } = useSocketStore();
  const [rooms, setRooms] = useState<IChatsRoomItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);

  const loadingRef = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // 🔥 [수정] 차단 유저 ID 저장용 Set
  const [blockedUserIds, setBlockedUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchBlockedList = async () => {
      try {
        const response = await getBlocks({ size: 100 });
        
        // 🔥 [수정] 응답 데이터 구조 안전하게 파싱 및 로그 확인
        // response가 배열인지, { items: [] } 인지, { success: { data: ... } } 인지 확인 필요
        // 보통 페이징 API는 items 배열을 줍니다.
        const items = response?.items || [];
        
        console.log("🚫 [Debug] 차단 목록 응답:", items); // 디버깅용 로그

        if (items.length > 0) {
          // 🔥 [핵심 수정] 
          // 1. API 응답 필드명이 'userId'가 아니라 'blockedUserId' 혹은 'targetUserId'일 수 있음
          // 2. 타입이 문자열일 수도 있으니 Number()로 변환
          const ids = new Set(
            items.map((item: any) => Number(item.userId || item.blockedUserId || item.targetUserId))
          );
          
          console.log("🚫 [Debug] 차단된 ID Set:", ids); // 디버깅용 로그
          setBlockedUserIds(ids);
        }
      } catch (error) {
        console.error("차단 목록 로드 실패", error);
      }
    };
    fetchBlockedList();
  }, []);

  const fetchRooms = useCallback(
    async (cursor: string | null, isBackground = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;

      if (!isBackground) setIsLoading(true);

      try {
        const response = await getChatRooms({
          size: 20,
          cursor: cursor,
        });

        if (response) {
          const fetchedItems = response.items;

          if (!cursor) {
            setRooms(fetchedItems);
          } else {
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
        if (!isBackground) setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRooms(null, false);
  }, [fetchRooms]);

  useEffect(() => {
    if (!socket) return;

    const handleRefresh = () => {
      loadingRef.current = false;
      fetchRooms(null, true);
    };

    const handleNotification = (response: any) => {
      const payload = response.success?.data || response;
      if (payload.data?.chatRoomId) {
        handleRefresh();
      }
    };

    const handleRead = () => {
      handleRefresh();
    };

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingRef.current &&
          !isLastPage &&
          nextCursor
        ) {
          fetchRooms(nextCursor, false);
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, isLastPage, fetchRooms]);

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
          // 🔥 [수정] 타입 불일치 방지 (Number 변환)
          // room.peer.userId가 string일 수도 있으므로 안전하게 변환
          const peerId = Number(room.peer.userId);
          const isBlocked = blockedUserIds.has(peerId);
          
          const displayUnreadCount = isBlocked ? 0 : room.unreadCount;

          const displayLastMessage = isBlocked
            ? "차단된 사용자와의 대화입니다."
            : room.lastMessage?.textPreview || "대화를 시작해보세요!";

          const displayTime = isBlocked
            ? ""
            : room.lastMessage?.sentAt
              ? formatTime(room.lastMessage.sentAt)
              : "";

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
                  <span
                    className={`text-[18px] font-semibold truncate ${isBlocked ? "text-gray-400" : "text-black"}`}
                  >
                    {room.peer.nickname}
                  </span>
                  <span className="text-[14px] text-[#999]">
                    {room.peer.areaName ? room.peer.areaName : "성수동"}{" "}
                    {displayTime && `· ${displayTime}`}
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