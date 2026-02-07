import { useState, useEffect } from "react";
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

type IMessageItem = IChatsRoomIdMessagesGetResponse['items'][number];

type ModalType = "NONE" | "BLOCK" | "EXIT";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const myId = user?.userId ?? 0;
  const parsedRoomId = Number(roomId);

  const [tempMessages, setTempMessages] = useState<any[]>([]);
  const [socketMessages, setSocketMessages] = useState<IMessageItem[]>([]);

  // 🔥 [Store 사용] 스토어에서 함수들 가져오기
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

  // 소켓 연결 및 방 입장
  useEffect(() => {
    connect(); // 소켓 연결 시도
    if (parsedRoomId) {
      joinRoom(parsedRoomId); // 연결 후 방 입장
    }
    // 컴포넌트 언마운트 시 연결을 끊을지 말지는 기획에 따라 결정 (보통 스토어 방식은 유지함)
  }, [parsedRoomId, connect, joinRoom]);

  // 메시지 수신 리스너 등록 (socket.on)
  useEffect(() => {
    if (!socket) return;

    // 수신 핸들러
    const handleMessageNew = (response: any) => {
      // 1. 데이터 파싱 (서버 응답 구조에 따라 success.data 혹은 response 자체 사용)
      const newMsgData: MessageNewData = response.success?.data || response;

      // 2. 내가 보낸 메시지 무시
      if (newMsgData.senderUserId === myId) return;

      // 3. 타입 변환 (IMAGE -> PHOTO) 및 UI 포맷팅
      // DTO 타입과 소켓 타입 불일치 해결
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
        sendAt: newMsgData.sentAt, // 소켓(sentAt) -> UI(sendAt)
        readAt: null,
        isMine: false,
      };

      // 4. 상태 업데이트 & 스크롤
      setSocketMessages((prev) => [...prev, newMsg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    // 리스너 등록
    socket.on("message.new", handleMessageNew);

    // 클린업 (페이지 나갈 때 리스너 해제)
    return () => {
      socket.off("message.new", handleMessageNew);
    };
  }, [socket, myId, bottomRef]); // 의존성 배열

  // 전송 래퍼 함수 (Store의 sendMessage 사용)

  const onSendTextWrapper = async (text: string) => {
    // 1. 낙관적 업데이트
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

    // 2. 스토어 함수로 전송
    sendMessage(parsedRoomId, "TEXT", text);
  };

  const onSendVoiceWrapper = async (file: File, duration: number) => {
    // 1. 낙관적 업데이트
    const tempMsg = {
      messageId: Date.now(),
      senderUserId: myId,
      type: "AUDIO", 
      text: null,
      mediaUrl: URL.createObjectURL(file),
      durationSec: duration,
      sendAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // 2. 파일 업로드 로직 (구현 필요)
    try {
      console.log("⚠️ 파일 업로드 API 연결 필요");
      // const res = await uploadApi(file);
      // sendMessage(parsedRoomId, "AUDIO", res.url, duration);
    } catch (e) {
      console.error("전송 실패", e);
    }
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

  const combinedMessages = [...messages, ...socketMessages, ...tempMessages];

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
        className="w-full h-full overflow-y-auto px-4 pt-4 pb-[160px] scroll-smooth"
      >
        <div ref={topObserverRef} className="h-2 w-full" /> 
        <div className="flex flex-col items-center justify-center gap-3 pt-4 pb-4">
          <div className="relative shrink-0 w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-200">
            <img src={peerInfo?.profileImageUrl} alt="profile" className="w-full h-full object-cover"/>
          </div>
          <div className="text-center">
            <span className="font-semibold text-[18px] text-[#636970] block">{peerInfo?.nickname}</span>
            <span className="text-[14px] text-[#636970]">{peerInfo?.age}세 · {peerInfo?.areaName}</span>
          </div>
          <p className="mt-6 mb-2 text-[18px] text-[#636970] text-center">서로 알아가는 첫 이야기,<br/>편하게 시작해볼까요?</p>
        </div>
        
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
        <ChatInputBar 
          onSendText={onSendTextWrapper} 
          onSendVoice={onSendVoiceWrapper} 
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