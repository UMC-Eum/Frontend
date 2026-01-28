import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";
import BackButton from "../../components/BackButton";

// API
import { 
  getChatRoomDetail, 
  getChatMessages, 
  sendChatMessage, 
  readChatMessage,
  patchChatMessage,
  // uploadFile // 🔥 [가정] 파일 업로드 API가 있다면 여기서 import
} from "../../api/chats/chatsApi"; 

import { 
  blockUser, 
  getBlocks, 
  patchBlock, 
  createReport 
} from "../../api/socials/socialsApi"; 

// DTO
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO";

type ApiMessageItem = IChatsRoomIdMessagesGetResponse["items"][number];

// UI 컴포넌트
import { MessageBubble } from "../../components/chats/MessageBubble";
import { ChatInputBar } from "../../components/chats/ChatInputBar"; // 🔥 수정된 InputBar import
import { ReportModal } from "../../components/chats/ReportModal"; 
import { formatTime } from "../../hooks/UseFormatTime"; 

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore(); 
  const myId = user?.userId ?? 0;

  // 상태
  const [messages, setMessages] = useState<ApiMessageItem[]>([]);
  const [peerInfo, setPeerInfo] = useState<{ userId: number; nickname: string; age: number; areaName: string; profileImageUrl: string } | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitLoaded, setIsInitLoaded] = useState(false);

  // 차단 상태 (null = 차단안함, 숫자 = 차단ID)
  const [blockId, setBlockId] = useState<number | null>(null);

  // UI 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // 1. [초기 로딩]
  useEffect(() => {
    if (!roomId) return;

    const initChat = async () => {
      try {
        const parsedRoomId = Number(roomId);
        
        // A. 방 정보 + 차단 상태 확인
        const roomDetail = await getChatRoomDetail(parsedRoomId);
        if (roomDetail) {
          setPeerInfo({
            userId: roomDetail.peer.userId,
            nickname: roomDetail.peer.nickname,
            age: roomDetail.peer.age,
            areaName: roomDetail.peer.areaName,
            profileImageUrl: "https://via.placeholder.com/52"
          });

          try {
            const blockRes = await getBlocks({ size: 100 });
            const targetBlock = blockRes.items.find(item => item.targetUserId === roomDetail.peer.userId);
            if (targetBlock) {
              setBlockId(targetBlock.blockId);
            }
          } catch (e) {
            console.error("차단 목록 조회 실패", e);
          }
        }

        // B. 메시지 조회
        const msgResponse = await getChatMessages(parsedRoomId, { size: 20 });
        if (msgResponse && msgResponse.items) {
          const sorted = [...msgResponse.items].sort((a, b) => 
            new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime()
          );
          setMessages(sorted);
          setNextCursor(msgResponse.nextCursor);
          setIsInitLoaded(true);

          sorted.forEach((item) => {
            if (item.senderUserId !== myId && !item.readAt) {
              readChatMessage(item.messageId).catch(console.error);
            }
          });
        }
      } catch (error) {
        console.error("채팅방 입장 실패:", error);
      }
    };

    initChat();
  }, [roomId, myId]);

  // 스크롤 핸들링
  useEffect(() => {
    if (isInitLoaded && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [isInitLoaded]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoading && isInitLoaded) {
          if (scrollContainerRef.current) {
            prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
          }
          await loadPrevMessages();
        }
      },
      { threshold: 0.5 }
    );
    if (topObserverRef.current) observer.observe(topObserverRef.current);
    return () => observer.disconnect();
  }, [nextCursor, isLoading, isInitLoaded]);

  const loadPrevMessages = async () => {
    if (!roomId || !nextCursor) return;
    setIsLoading(true);
    try {
      const response = await getChatMessages(Number(roomId), { size: 20, cursor: nextCursor });
      if (response && response.items.length > 0) {
        const oldMessages = [...response.items].sort((a, b) => 
          new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime()
        );
        setMessages((prev) => [...oldMessages, ...prev]);
        setNextCursor(response.nextCursor);
      } else {
        setNextCursor(null);
      }
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  useLayoutEffect(() => {
    if (isLoading) return;
    if (scrollContainerRef.current && prevScrollHeightRef.current > 0) {
      const currentScrollHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTop = currentScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messages, isLoading]);

  // --- [기능] 차단 / 차단 해제 ---
  const handleBlockToggle = async () => {
    if (!peerInfo) return;
    try {
      if (blockId) {
        await patchBlock(blockId);
        setBlockId(null);
        alert("차단이 해제되었습니다.");
      } else {
        const res = await blockUser({
          targetUserId: peerInfo.userId,
          reason: "채팅방 차단"
        });
        setBlockId(res.blockId);
        alert("차단되었습니다.");
      }
    } catch (error) {
      console.error("차단 요청 실패", error);
      alert("요청 처리에 실패했습니다.");
    }
  };

  // --- [기능] 신고 하기 ---
  const handleReport = async () => {
    if (!peerInfo || !roomId) return;
    const reason = prompt("신고 사유를 입력해주세요.");
    if (!reason) return;

    try {
      await createReport({
        targetUserId: peerInfo.userId,
        category: "SPAM", 
        description: reason,
        chatRoomId: Number(roomId)
      });
      alert("신고가 접수되었습니다.");
    } catch (error) {
      console.error("신고 실패", error);
      alert("신고 접수에 실패했습니다.");
    }
  };

  // --- [기능] 메시지 삭제 ---
  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("정말 이 메시지를 삭제하시겠습니까?")) return;
    try {
      await patchChatMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.messageId !== messageId));
    } catch (error) {
      console.error("삭제 실패", error);
      alert("메시지 삭제에 실패했습니다.");
    }
  };

  // ----------------------------------------------------------------------
  // 🔥 [전송 기능] 텍스트
  // ----------------------------------------------------------------------
  const handleSendText = async (text: string) => {
    if (!roomId) return;
    const parsedRoomId = Number(roomId);
    try {
      const res = await sendChatMessage(parsedRoomId, { type: "TEXT", text, mediaUrl: "", durationSec: 0 });
      const newMessage: ApiMessageItem = {
        messageId: res.messageId, senderUserId: myId, type: "TEXT", text, mediaUrl: "", durationSec: 0,
        sendAt: res.sendAt, readAt: null, isMine: true
      };
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error) { console.error(error); }
  };

  // ----------------------------------------------------------------------
  // 🔥 [전송 기능] 음성
  // ----------------------------------------------------------------------
  const handleSendVoice = async (file: File, duration: number) => {
    if (!roomId) return;
    const parsedRoomId = Number(roomId);
    const localAudioUrl = URL.createObjectURL(file);
    try {
      // TODO: 실제로는 여기서 file을 S3 등에 업로드하고 그 URL을 보내야 합니다.
      const res = await sendChatMessage(parsedRoomId, { type: "AUDIO", text: null, mediaUrl: "temp_audio_url", durationSec: duration });
      
      const newMessage: ApiMessageItem = {
        messageId: res.messageId, senderUserId: myId, type: "AUDIO", text: null, mediaUrl: localAudioUrl, durationSec: duration,
        sendAt: res.sendAt, readAt: null, isMine: true
      };
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error) { console.error(error); }
  };

  // ----------------------------------------------------------------------
  // 🔥 [전송 기능 - 추가됨] 이미지
  // ----------------------------------------------------------------------
  {/*const handleSendImage = async (file: File) => {
    if (!roomId) return;
    const parsedRoomId = Number(roomId);
    
    // 1. 사용자 경험을 위해 로컬 미리보기 URL 생성
    const localImageUrl = URL.createObjectURL(file);

    try {
      // TODO: 백엔드 API에 따라 이미지를 먼저 업로드해서 URL을 받아와야 할 수 있습니다.
      // const uploadRes = await uploadFile(file);
      // const realImageUrl = uploadRes.url; 
      
      // 여기서는 임시 URL 혹은 업로드 로직이 있다고 가정하고 메시지 전송
      const res = await sendChatMessage(parsedRoomId, { 
        type: "IMAGE",  // DTO에 IMAGE 타입이 있다고 가정
        text: null, 
        mediaUrl: "temp_image_url", // 실제로는 업로드된 URL
        durationSec: 0 
      });

      const newMessage: ApiMessageItem = {
        messageId: res.messageId, 
        senderUserId: myId, 
        type: "IMAGE", // 타입 지정
        text: null, 
        mediaUrl: localImageUrl, // 내가 보낸 건 로컬 URL로 즉시 표시
        durationSec: 0,
        sendAt: res.sendAt, 
        readAt: null, 
        isMine: true
      };

      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      
    } catch (error) { 
      console.error("이미지 전송 실패:", error); 
    }
  };
*/}

  const handlePlayAudio = (id: number) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="w-full h-dvh flex flex-col bg-white relative overflow-hidden">
      
      {/* 헤더 */}
      <header className="shrink-0 h-[45px] px-4 flex items-center justify-between bg-white z-10 border-b border-gray-100">
        <div className="-ml-5"><BackButton /></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-2">
          <span className="font-bold text-[24px] text-[#111]">
            {peerInfo?.nickname}
          </span>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className="p-2 -mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="5" r="2" fill="#111" />
            <circle cx="12" cy="12" r="2" fill="#111" />
            <circle cx="12" cy="19" r="2" fill="#111" />
          </svg>
        </button>
      </header>

      {/* 메시지 리스트 */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
        <div ref={topObserverRef} className="h-2 w-full" />

        {/* 프로필 카드 영역 */}
        <div className="flex flex-col items-center justify-center gap-3 pt-4">
          <div className="relative shrink-0 w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-200">
            <img 
              src={peerInfo?.profileImageUrl || "https://via.placeholder.com/100"} 
              alt={peerInfo?.nickname}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="font-semibold text-[18px] text-[#636970]">
              {peerInfo?.nickname}
            </span>
            {peerInfo && (
              <span className="text-[14px] text-[#636970]">
                {peerInfo.age}세 · {peerInfo.areaName}
              </span>
            )}
          </div>
          <div className="mt-10 mb-6 text-[18px] text-[#636970] flex flex-col items-center justify-center">
            <span>서로 알아가는 첫 이야기,</span>
            <span>편하게 시작해볼까요?</span>
          </div>
        </div>

        {/* 메시지 렌더링 */}
        <div className="flex flex-col mt-2 gap-3">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.messageId}
              isMe={msg.senderUserId === myId}  
              type={msg.type}
              content={msg.text}
              // 👇 [수정] mediaUrl을 상황에 맞게 전달
              audioUrl={msg.mediaUrl}           
              //imageUrl={msg.type === 'IMAGE' ? msg.mediaUrl : undefined} // MessageBubble에 imageUrl prop이 있다고 가정
              duration={msg.durationSec}
              timestamp={formatTime(msg.sendAt)}
              readAt={msg.readAt}
              isPlayingProp={playingId === msg.messageId}
              onPlay={() => handlePlayAudio(msg.messageId)}
              onDelete={msg.senderUserId === myId ? () => handleDeleteMessage(msg.messageId) : undefined}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* 🔥 [핵심 변경] ChatInputBar에 onSendImage 연결 */}
      <ChatInputBar 
        onSendText={handleSendText} 
        onSendVoice={handleSendVoice} 
        //onSendImage={handleSendImage} 
      />

      {/* 신고/차단 모달 */}
      <ReportModal 
        isOpen={isMenuOpen} 
        isBlocked={blockId !== null} 
        onClose={() => setIsMenuOpen(false)} 
        onReport={handleReport}     
        onBlock={handleBlockToggle} 
        onLeave={() => { setIsMenuOpen(false); setIsExitConfirmOpen(true); }}
      />

      {/* 나가기 확인 모달 */}
      {isExitConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
           <div className="absolute inset-0 bg-black/60" onClick={() => setIsExitConfirmOpen(false)} />
           <div className="relative bg-white rounded-[14px] p-6 w-full max-w-[322px]">
              <h3 className="font-semibold text-[20px] mb-2 text-[#111]">대화방을 나갈까요?</h3>
              <p className="text-[#636970] text-[14px] mb-6">나가면 대화가 불가능합니다.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsExitConfirmOpen(false)} className="flex-1 py-3 bg-[#E9ECED] rounded-[14px] font-semibold text-[#636970]">아니요</button>
                <button onClick={() => navigate(-1)} className="flex-1 py-3 bg-[#FC3367] rounded-[14px] font-semibold text-white">예</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}