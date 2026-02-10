import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

// Hooks
import { useChatRoomInfo } from "../../hooks/chat/useChatRoomInfo";
import { useChatMessages } from "../../hooks/chat/useChatMessages";
import { useChatScroll } from "../../hooks/chat/useChatScroll";
import { useSocketStore } from "../../stores/useSocketStore"; // ✅ Store 사용

// Components
import BackButton from "../../components/BackButton";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { ChatInputBar } from "../../components/chat/ChatInputBar";
import { ReportModal } from "../../components/chat/ReportModal";
import { formatTime } from "../../hooks/UseFormatTime";
import ConfirmModal from "../../components/common/ConfirmModal"; 
import ToastNotification from "../../components/common/ToastNotification";
import { createReport } from "../../api/socials/socialsApi";
import ReportScreen from "../../components/chat/ReportScreen";
import { DateSeparator } from "../../components/chat/DateSeparator";
import { getFormattedDate } from "../../hooks/useFormatDate";

// Types
import { MessageNewData } from "../../types/api/socket"; 
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO"; 
import { readChatMessage } from "../../api/chats/chatsApi";

type IMessageItem = IChatsRoomIdMessagesGetResponse['items'][number];

// 어떤 모달 보여줄지 정하기 위한 모달 타입
type ModalType = "NONE" | "BLOCK" | "EXIT";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const myId = user?.userId ?? 0;
  const parsedRoomId = Number(roomId);


 // 메세지 저장 관리
  const [tempMessages, setTempMessages] = useState<IMessageItem[]>([]);
  const [socketMessages, setSocketMessages] = useState<IMessageItem[]>([]);

  // [Store 사용] 스토어에서 함수들 가져오기
  const { socket, connect, joinRoom, sendMessage } = useSocketStore();

  const { peerInfo, blockId, isMenuOpen, setIsMenuOpen, handleBlockToggle } = useChatRoomInfo(parsedRoomId);
  
  const { messages, nextCursor, isLoading, isInitLoaded, loadPrevMessages, handleDeleteMessage } 
    = useChatMessages(parsedRoomId, myId);

  const allMessagesLength = messages.length + socketMessages.length + tempMessages.length;
  const { scrollContainerRef, topObserverRef, bottomRef } 
    = useChatScroll({ isInitLoaded, isLoading, nextCursor, messagesLength: allMessagesLength, loadPrevMessages });
  
  const [activeModal, setActiveModal] = useState<ModalType>("NONE");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReportScreenOpen, setIsReportScreenOpen] = useState(false);

  // 🔥 [추가] 파일 인풋 제어용 Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 소켓 연결 및 방 입장
  useEffect(() => {
    connect(); // 소켓 연결 시도
    if (parsedRoomId) {
      joinRoom(parsedRoomId); // 연결 후 방 입장
    }
  }, [parsedRoomId, connect, joinRoom]);

  // 메시지 수신 리스너 등록 (socket.on)
  useEffect(() => {
    if (!socket) return;

    // 수신 핸들러
    const handleMessageNew = (response: any) => {
      const newMsgData: MessageNewData = response.success?.data || response;

      if (newMsgData.senderUserId === myId) return;

      let uiType: any = newMsgData.type;
      if (newMsgData.type === "IMAGE") {
        uiType = "PHOTO";
      }

      const newMsg: IMessageItem = {
        messageId: newMsgData.messageId,
        senderUserId: newMsgData.senderUserId,
        type: uiType,
        text: newMsgData.text,
        mediaUrl: newMsgData.mediaUrl || "",
        durationSec: newMsgData.durationSec,
        sendAt: newMsgData.sentAt,
        readAt: null,
        isMine: false,
      };

      setSocketMessages((prev) => [...prev, newMsg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      
      try {
        readChatMessage(newMsgData.messageId); 
      } catch (e) {
        console.error("읽음 처리 실패", e);
      }
    };

    socket.on("message.new", handleMessageNew);

    return () => {
      socket.off("message.new", handleMessageNew);
    };
  }, [socket, myId, bottomRef]);

  // 읽음 처리 로직
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const unreadMessages = messages.filter(
      (msg) => !msg.isMine && msg.readAt === null
    );
    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg) => {
        readChatMessage(msg.messageId);
      });
    }
  }, [messages]);

  // ------------------------------------------------------------------
  // 1️⃣ 텍스트 전송
  // ------------------------------------------------------------------
  const onSendTextWrapper = async (text: string) => {
    const tempMsg = {
      messageId: Date.now(),
      senderUserId: myId,
      type: "TEXT",
      text: text,
      mediaUrl: null,
      durationSec: 0,
      sendAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    sendMessage(parsedRoomId, "TEXT", text);
  };

  // ------------------------------------------------------------------
  // 2️⃣ 음성 메세지 전송 (Audio) - 🔥 [수정됨: 가짜 URL 사용]
  // ------------------------------------------------------------------
  const onSendVoiceWrapper = async (file: File, duration: number) => {
    // S3 구현 전이므로 Blob URL(가짜 주소) 사용
    const fakeUrl = URL.createObjectURL(file);

    const tempMsg = {
      messageId: Date.now(),
      senderUserId: myId,
      type: "AUDIO", 
      text: null,
      mediaUrl: fakeUrl,
      durationSec: duration,
      sendAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // 소켓 전송 (규칙: AUDIO 타입은 durationSec 필수)
    sendMessage(parsedRoomId, "AUDIO", null, fakeUrl, duration);
  };

  // ------------------------------------------------------------------
  // 3️⃣ 이미지/비디오 파일 선택 및 전송 (Image/Video) - 🔥 [추가됨]
  // ------------------------------------------------------------------
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 확인
    const isVideo = file.type.startsWith("video");
    const type = isVideo ? "VIDEO" : "IMAGE"; // UI 타입은 PHOTO일 수 있으나 소켓은 IMAGE/VIDEO

    // S3 구현 전이므로 Blob URL 생성
    const fakeUrl = URL.createObjectURL(file);

    // UI용 임시 메시지 타입 (PHOTO / VIDEO)
    const uiType = isVideo ? "VIDEO" : "PHOTO";

    const tempMsg = {
      messageId: Date.now(),
      senderUserId: myId,
      type: uiType,
      text: null,
      mediaUrl: fakeUrl,
      durationSec: null, 
      sendAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // 소켓 전송 (규칙: text=null, mediaUrl=필수)
    // sendMessage(roomId, type, text, mediaUrl, duration)
    sendMessage(parsedRoomId, type, null, fakeUrl, null);

    // 같은 파일 다시 선택 가능하게 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const showToast = (msg: string) => setToastMessage(msg);

  const handleReportMenuClick = () => {
    setIsMenuOpen(false); 
    setIsReportScreenOpen(true);
  };

  const handleBlockRequest = async () => {
    if (blockId) {
      try {
        await handleBlockToggle(); 
        showToast("차단이 해제되었어요.");
      } catch (error) {
        console.error("차단 해제 실패", error);
        alert("요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } else {
      setIsMenuOpen(false);
      setTimeout(() => setActiveModal("BLOCK"), 100);
    }
  };

  const handleRealBlock = async () => {
    try {
      await handleBlockToggle(); 
      setActiveModal("NONE");
      setTimeout(() => setActiveModal("EXIT"), 300);
      showToast(`${peerInfo?.nickname || "상대방"}님을 차단했어요.`);
    } catch (error) {
      console.error("차단 실패", error);
      alert("차단에 실패했습니다.");
      setActiveModal("NONE"); 
    }
  };

  const handleRealReport = async (categoryCode: string, description: string) => {
    if (!roomId || !peerInfo) return;
    await createReport({
      targetUserId: peerInfo.userId,
      category: categoryCode,
      reason: `${description}`,
      chatRoomId: Number(roomId)
    });
  };

  // [수정] 데이터 표준화(Normalization) + 중복 제거 + 정렬
  const combinedMessages = useMemo(() => {
    const rawList = [...messages, ...socketMessages, ...tempMessages];
    const uniqueMap = new Map();

    rawList.forEach((msg: any) => {
      const originalDate = msg.sendAt || msg.sentAt || new Date().toISOString();
      const standardizedDate = String(originalDate).replace(" ", "T");

      const standardizedMsg = {
        ...msg,
        sendAt: standardizedDate, 
        sentAt: standardizedDate, 
      };

      const key = msg.messageId ? String(msg.messageId) : `temp-${standardizedDate}`;
      uniqueMap.set(key, standardizedMsg);
    });
    
    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.sort((a: any, b: any) => {
      const timeA = new Date(a.sendAt).getTime();
      const timeB = new Date(b.sendAt).getTime();
      const validTimeA = isNaN(timeA) ? 0 : timeA;
      const validTimeB = isNaN(timeB) ? 0 : timeB;
      return validTimeA - validTimeB;
    });
  }, [messages, socketMessages, tempMessages]);

  return (
    <div className="w-full h-dvh flex flex-col bg-white relative overflow-hidden">
      
      <header className="shrink-0 h-[45px] px-4 flex items-center justify-between bg-white z-10 border-b border-gray-100">
        <div className="-ml-5"><BackButton /></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-2">
          <span className="font-bold text-[24px] text-[#111]">{peerInfo?.nickname}</span>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className="p-2 -mr-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" fill="#111" /><circle cx="12" cy="12" r="2" fill="#111" /><circle cx="12" cy="19" r="2" fill="#111" /></svg>
        </button>
      </header>

      <div 
        ref={scrollContainerRef} 
        className="w-full h-full overflow-y-auto px-4 pt-4 pb-[160px]"
      >
        <div ref={topObserverRef} className="h-2 w-full" /> 

        {isLoading && (
          <div className="w-full flex justify-center py-4 my-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-600" />
          </div>
        )}

        {!isLoading && !nextCursor && (
          <div className="flex flex-col items-center justify-center gap-3 pt-4 pb-4 animate-fade-in">
            <div className="relative shrink-0 w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-200">
              <img src={peerInfo?.profileImageUrl} alt="profile" className="w-full h-full object-cover"/>
            </div>
            <div className="text-center">
              <span className="font-semibold text-[18px] text-[#636970] block">{peerInfo?.nickname}</span>
              <span className="text-[14px] text-[#636970]">{peerInfo?.age}세 · {peerInfo?.areaName}</span>
            </div>
            <p className="mt-6 mb-2 text-[18px] text-[#636970] text-center">
              서로 알아가는 첫 이야기,<br/>편하게 시작해볼까요?
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          {combinedMessages.map((msg, index) => {
            const currentDate = getFormattedDate(msg.sendAt);
            const prevMsg = index > 0 ? combinedMessages[index - 1] : null;
            const prevDate = prevMsg ? getFormattedDate(prevMsg.sendAt) : null;
            const showDateSeparator = !prevDate || currentDate !== prevDate;

            return (
              <div key={msg.messageId || index}>
                {showDateSeparator && <DateSeparator date={currentDate} />}

                <MessageBubble
                  isMe={msg.senderUserId === myId}
                  type={msg.type}
                  content={msg.text}
                  audioUrl={msg.mediaUrl}
                  duration={msg.durationSec}
                  timestamp={formatTime(msg.sendAt)}
                  readAt={msg.readAt}
                  isPlayingProp={playingId === msg.messageId}
                  onPlay={() => setPlayingId(playingId === msg.messageId ? null : msg.messageId)}
                  onDelete={msg.senderUserId === myId ? () => handleDeleteMessage(msg.messageId) : undefined}
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <ToastNotification 
        message={toastMessage}
        isVisible={!!toastMessage} 
        onClose={() => setToastMessage(null)} 
      />

      <div className="absolute bottom-0 w-full z-40">
        <div className="absolute bottom-0 left-0 right-0 h-[300px] -z-10 pointer-events-none
            bg-gradient-to-t from-white from-20% via-white/50 to-transparent
            backdrop-blur-[3px]
            [mask-image:linear-gradient(to_bottom,transparent_10%,black_80%)]"
          />
        
        {/* 🔥 [추가] 숨겨진 파일 인풋 (ChatInputBar 버튼과 연결됨) */}
        <input 
           type="file" 
           ref={fileInputRef}
           className="hidden"
           accept="image/*,video/*"
           onChange={handleFileSelect}
        />

        <ChatInputBar 
          onSendText={onSendTextWrapper} 
          onSendVoice={onSendVoiceWrapper} 
          // 🔥 [추가] 플러스 버튼 누르면 숨겨진 인풋 클릭
          onClickPlus={() => fileInputRef.current?.click()}
          isBlocked={blockId !== null} 
        />
      </div>

      <ReportModal 
        isOpen={isMenuOpen} 
        isBlocked={blockId !== null} 
        onClose={() => setIsMenuOpen(false)} 
        onReport={handleReportMenuClick} 
        onBlock={handleBlockRequest} 
        onLeave={() => { setIsMenuOpen(false); setActiveModal("EXIT"); }} 
      />

      <ReportScreen 
        isOpen={isReportScreenOpen}
        onClose={() => setIsReportScreenOpen(false)}
        targetName={peerInfo?.nickname || "상대방"}
        onReport={handleRealReport}
      />

      <ConfirmModal
        isOpen={activeModal === "BLOCK"} 
        title="상대방을 차단할까요?"
        description={`차단하면 ${peerInfo?.nickname || "상대방"}님과 대화를 할 수 없어요.\n차단하시겠어요?`}
        confirmText="예"
        cancelText="아니요"
        isDanger={true}
        onCancel={() => setActiveModal("NONE")} 
        onConfirm={handleRealBlock} 
      />

      <ConfirmModal
        isOpen={activeModal === "EXIT"}
        title="대화방을 나갈까요?"
        description="나가면 대화가 불가능합니다."
        confirmText="예"
        cancelText="아니요"
        isDanger={true}
        onCancel={() => setActiveModal("NONE")} 
        onConfirm={() => navigate(-1)}
      />

    </div>
  );
}