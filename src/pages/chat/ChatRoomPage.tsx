import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

// Hooks
import { useChatRoomInfo } from "../../hooks/chat/useChatRoomInfo";
import { useChatMessages } from "../../hooks/chat/useChatMessages";
import { useChatScroll } from "../../hooks/chat/useChatScroll";
import { useSocketStore } from "../../stores/useSocketStore";
import { useChatSocketLogic } from "../../hooks/chat/useChatSocketLogic";
import { useChatSender } from "../../hooks/chat/useChatSender";

// Components
import BackButton from "../../components/BackButton";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { ChatInputBar } from "../../components/chat/ChatInputBar";
import { ReportModal } from "../../components/chat/ReportModal";
import { formatTime } from "../../hooks/UseFormatTime";
import ConfirmModal from "../../components/common/ConfirmModal";
import ToastNotification from "../../components/common/ToastNotification";
import ReportScreen from "../../components/chat/ReportScreen";
import { DateSeparator } from "../../components/chat/DateSeparator";
import { getFormattedDate } from "../../hooks/useFormatDate";
import { createReport } from "../../api/socials/socialsApi";

type ModalType = "NONE" | "BLOCK" | "EXIT";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const myId = user?.userId ?? 0;
  const parsedRoomId = Number(roomId);

  const prevLastMessageIdRef = useRef<number | null>(null);

  const { connect, joinRoom } = useSocketStore();
  const [activeModal, setActiveModal] = useState<ModalType>("NONE");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReportScreenOpen, setIsReportScreenOpen] = useState(false);

  // 1. 데이터 및 로직 훅
  const { peerInfo, blockId, isMenuOpen, setIsMenuOpen, handleBlockToggle } =
    useChatRoomInfo(parsedRoomId);

  const {
    messages: initialMessages,
    setMessages: setInitialMessages,
    nextCursor,
    isLoading,
    isInitLoaded,
    loadPrevMessages,
    handleDeleteMessage,
  } = useChatMessages(parsedRoomId, myId);

  const { displayMessages, setTempMessages } = useChatSocketLogic(
    myId,
    initialMessages,
    setInitialMessages,
    blockId,
  );

  const { scrollContainerRef, topObserverRef, bottomRef, scrollToBottom, isAtBottomRef } = useChatScroll({
    isInitLoaded,
    isLoading,
    nextCursor,
    messagesLength: displayMessages.length,
    loadPrevMessages,
  });

  const { sendText, sendVoice, sendImageOrVideo } = useChatSender(
    parsedRoomId,
    myId,
    setTempMessages,
    () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
  );

  useEffect(() => {
    // 1. 로딩 중이거나 메시지 없으면 패스
    if (!isInitLoaded || displayMessages.length === 0) return;

    const currentLastMsg = displayMessages[displayMessages.length - 1];
    const currentLastId = currentLastMsg.messageId;
    const prevLastId = prevLastMessageIdRef.current;

    // 2. "마지막 메시지가 바뀌었을 때"만 실행 (새 메시지 수신/전송 시)
    // 과거 메시지 로딩 시에는 리스트 '앞'이 바뀌므로 여기 안 걸림 -> 스크롤 안 튐 ✅
    if (currentLastId !== prevLastId) {
      
      const isMyMessage = currentLastMsg.senderUserId === myId;
      const isInitialLoad = prevLastId === null;
      const isUserAtBottom = isAtBottomRef.current; // 사용자가 바닥 근처를 보고 있었나?

      // 3. 스크롤을 내려야 하는 3가지 상황
      // A. 초기 로딩 시
      // B. 내가 메시지를 보냈을 시 (무조건 내림)
      // C. 남이 보냈는데, 내가 이미 바닥을 보고 있었을 시 (읽고 있던 중이면 안 내림)
      if (isInitialLoad || isMyMessage || isUserAtBottom) {
        scrollToBottom("smooth"); // 부드럽게 이동
      } else {
        // 남이 보냈고 내가 위를 보고 있다면? -> "새 메시지" 토스트나 버튼 띄우기 좋은 위치
        console.log("새 메시지가 왔지만 스크롤을 내리지 않았습니다."); 
      }
    }

    // 현재 ID 저장
    prevLastMessageIdRef.current = currentLastId;
    
  }, [displayMessages, isInitLoaded, myId, scrollToBottom]);

  useEffect(() => {
    connect();
    if (parsedRoomId) joinRoom(parsedRoomId);
  }, [parsedRoomId, connect, joinRoom]);

  const handleRealReport = async (code: string, desc: string) => {
    if (!peerInfo) return;
    try {
      await createReport({
        targetUserId: peerInfo.userId,
        category: code,
        reason: desc,
        chatRoomId: parsedRoomId,
      });
      setToastMessage("신고가 접수되었습니다.");
    } catch (e) {
      console.error(e);
    }
  };

  if (!parsedRoomId) return null;

  return (
    // ✅ 구조 변경: absolute 대신 flex-col로 전체 높이 제어
    <div className="w-full h-dvh flex flex-col bg-white overflow-hidden">
      {/* 헤더: shrink-0으로 높이 유지 */}
      <header className="shrink-0 h-[45px] px-4 flex items-center justify-between bg-white z-50 border-b border-gray-100">
        <div className="-ml-5">
          <BackButton />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-2">
          <span className="font-bold text-[20px] text-[#111]">
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

      {/* ✅ 메시지 영역: flex-1을 주어 남은 모든 공간을 차지하게 함 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 scrollbar-hide flex flex-col"
      >
        <div ref={topObserverRef} className="h-1 shrink-0" />

        {isLoading && (
          <div className="w-full flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-gray-600" />
          </div>
        )}

        {/* ✅ mt-auto를 주어 메시지가 적을 때 하단부터 쌓이게 함 */}
        <div className="flex flex-col gap-4 py-4">
          {(() => {
            let lastMyIndex = -1;
            for (let i = displayMessages.length - 1; i >= 0; i -= 1) {
              if (displayMessages[i].senderUserId === myId) {
                lastMyIndex = i;
                break;
              }
            }
            return displayMessages.map((msg: any, index: number) => {
              const currentDate = getFormattedDate(msg.sendAt);
              const currentTime = formatTime(msg.sendAt);
              const prevMsg: any =
                index > 0 ? displayMessages[index - 1] : null;
              const nextMsg: any =
                index + 1 < displayMessages.length
                  ? displayMessages[index + 1]
                  : null;
              const showDateSeparator =
                !prevMsg || currentDate !== getFormattedDate(prevMsg.sendAt);
              const nextSameTime =
                nextMsg && formatTime(nextMsg.sendAt) === currentTime;
              const showTimestamp = !nextSameTime;
              const showRead = index === lastMyIndex;

              return (
                <div key={msg.messageId || `temp-${index}`}>
                  {showDateSeparator && <DateSeparator date={currentDate} />}
                  <MessageBubble
                    isMe={msg.senderUserId === myId}
                    type={msg.type}
                    content={msg.text}
                    audioUrl={msg.mediaUrl}
                    duration={msg.durationSec}
                    timestamp={currentTime}
                    readAt={msg.readAt}
                    showTimestamp={showTimestamp}
                    showRead={showRead}
                    isPlayingProp={playingId === msg.messageId}
                    onPlay={() =>
                      setPlayingId(
                        playingId === msg.messageId ? null : msg.messageId,
                      )
                    }
                    onDelete={
                      msg.senderUserId === myId && msg.messageId
                        ? () => handleDeleteMessage(msg.messageId)
                        : undefined
                    }
                  />
                </div>
              );
            });
          })()}
          {/* ✅ 하단 스크롤 기준점 */}
          <div ref={bottomRef} className="h-2 shrink-0" />
        </div>
      </div>

      {/* ✅ 하단 입력창: absolute를 제거하고 shrink-0으로 영역 고정 */}
      <div className="shrink-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <ChatInputBar
          onSendText={sendText}
          onSendVoice={sendVoice}
          onSelectImage={sendImageOrVideo}
          isBlocked={blockId !== null}
        />
      </div>

      {/* 모달 및 알림 컴포넌트들 (기존과 동일) */}
      <ToastNotification
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage(null)}
      />
      <ReportModal
        isOpen={isMenuOpen}
        isBlocked={blockId !== null}
        onClose={() => setIsMenuOpen(false)}
        onReport={() => {
          setIsMenuOpen(false);
          setIsReportScreenOpen(true);
        }}
        onBlock={() => {
          setIsMenuOpen(false);
          setActiveModal("BLOCK");
        }}
        onLeave={() => {
          setIsMenuOpen(false);
          setActiveModal("EXIT");
        }}
      />
      <ReportScreen
        isOpen={isReportScreenOpen}
        onClose={() => setIsReportScreenOpen(false)}
        targetName={peerInfo?.nickname || "상대방"}
        onReport={handleRealReport}
      />
      <ConfirmModal
        isOpen={activeModal === "BLOCK"}
        title={!blockId ? "차단할까요?" : "차단을 해제할까요?"}
        description={!blockId ? "서로의 프로필이 노출되지 않습니다." : "다시 채팅을 진행할 수 있습니다."}
        confirmText={!blockId ? "차단하기" : "차단 해제하기"}
        cancelText="취소"
        isDanger
        onCancel={() => setActiveModal("NONE")}
        onConfirm={() => {
          handleBlockToggle();
          setActiveModal("NONE");
        }}
      />
      <ConfirmModal
        isOpen={activeModal === "EXIT"}
        title="나갈까요?"
        description="대화 내용이 모두 사라집니다."
        confirmText="나가기"
        cancelText="취소"
        isDanger
        onCancel={() => setActiveModal("NONE")}
        onConfirm={() => navigate("/message")}
      />
    </div>
  );
}
