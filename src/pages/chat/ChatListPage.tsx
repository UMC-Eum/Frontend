import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getChatRooms } from "../../api/chats/chatsApi"; 
import { IChatsRoomItem } from "../../types/api/chats/chatsDTO";
import { getBlocks } from "../../api/socials/socialsApi";

export default function ChatListPage() {

  const navigate = useNavigate();
  // 채팅방 목록 저장
  const [rooms, setRooms] = useState<IChatsRoomItem[]>([]);
  // 커서(채팅 룸이 많다면 필요함, 아래로 내릴 때 )
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  // UI 표시용 State(채팅방 목록 로딩 중인지)
  const [isLoading, setIsLoading] = useState(false); 
  // 마지막 페이지 여부(커서를 받아오기 위해서), lastpage있으면 cursor 있음
  const [isLastPage, setIsLastPage] = useState(false);

  // 로딩 상태를 즉시 확인하기 위한 Ref (무한루프 방지용)
  const loadingRef = useRef(false);
  // 무한 스크롤을 위한 Ref (화면 최하단을 감시함)
  const observerTarget = useRef<HTMLDivElement>(null);
  //차단 대상 사용자 ID 목록 (차단시 채팅방 목록에서 )
  const [blockedUserIds, setBlockedUserIds ] = useState<Set<number>>(new Set());

  // 🔥 [3] 페이지 진입 시 차단 목록을 서버에서 가져오기
  useEffect(() => {
    const fetchBlockedList = async () => {
      try {
        // 차단 목록을 넉넉하게 가져옵니다 (size: 100)
        // 만약 차단한 사람이 100명이 넘으면 더 큰 숫자를 쓰거나 반복 호출해야 합니다.
        const items = await getBlocks({ size: 100 });
        
        if (items) {
          // items 안에서 상대방 ID를 뽑아내야 합니다.
          // ⚠️ 중요: getBlocks의 응답 item 안에 'userId'가 들어있는지, 'targetUserId'인지 확인 필요
          // 보통 user 객체 안에 있거나, 바로 userId 필드가 있습니다. 아래는 userId라고 가정한 코드입니다.
          const ids = new Set(items.items.map((item: any) => item.userId || item.targetUserId));
          
          setBlockedUserIds(ids);
          console.log("🚫 차단 목록 로드 완료:", ids);
        }
      } catch (error) {
        console.error("차단 목록 로드 실패", error);
      }
    };
    fetchBlockedList();
  }, []);

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
       const fetchedItems = response.items;


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
{rooms.map((room) => {
  // 1. 차단 목록(blockedUserIds)에 이 방 상대방이 있는지 확인
  const isBlocked = blockedUserIds.has(room.peer.userId);

  // 2. 🔥 [핵심] 차단됐다면 0으로 강제 고정
  // 새로고침 해도 blockedUserIds만 잘 불러와지면 무조건 0으로 뜸
  const displayUnreadCount = isBlocked ? 0 : room.unreadCount;
  
  // 3. 🔥 [핵심] 메시지 내용도 숨김
  const displayLastMessage = isBlocked 
    ? "차단된 사용자와의 대화입니다." 
    : (room.lastMessage?.textPreview || "대화를 시작해보세요!");
          
          // 차단되면 시간도 안 보여주거나, 기존 시간 유지
          const displayTime = isBlocked 
             ? "" // 혹은 room.lastMessage?.sentAt (마지막 시점 고정)
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
                  className={`w-full h-full object-cover ${isBlocked ? "opacity-50 grayscale" : ""}`} // 차단 시 프로필 흐리게(선택사항)
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
                  {/* 🔥 변조된 메시지 내용 표시 */}
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

              {/* 🔥 차단 안 된 경우에만 뱃지 표시 (0보다 클 때) */}
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