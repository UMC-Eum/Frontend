import { useState, useEffect } from "react";
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
import { readChatMessage } from "../../api/chats/chatsApi";

type ModalType = "NONE" | "BLOCK" | "EXIT";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const myId = user?.userId ?? 0;
  const parsedRoomId = Number(roomId);

  const { connect, joinRoom } = useSocketStore();
  const [activeModal, setActiveModal] = useState<ModalType>("NONE");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReportScreenOpen, setIsReportScreenOpen] = useState(false);

  // 1. 채팅방 기본 정보 및 상태 (차단, 상대방 정보)
  const { peerInfo, blockId, isMenuOpen, setIsMenuOpen, handleBlockToggle } =
    useChatRoomInfo(parsedRoomId);

  // 2. API로 과거 메시지 로드 (initialMessages로 명명)
  const {
    messages: initialMessages,
    setMessages: setInitialMessages,
    nextCursor,
    isLoading,
    isInitLoaded,
    loadPrevMessages,
    handleDeleteMessage,
  } = useChatMessages(parsedRoomId, myId);

  // 3. 🔥 소켓 로직 & 메시지 병합 관리
  // displayMessages: initialMessages + socketMessages + tempMessages가 병합된 최종 리스트
  const { displayMessages, setTempMessages, socketMessages } =
    useChatSocketLogic(myId, initialMessages, setInitialMessages, blockId);

  // 4. 스크롤 관리
  const { scrollContainerRef, topObserverRef, bottomRef } = useChatScroll({
    isInitLoaded,
    isLoading,
    nextCursor,
    messagesLength: displayMessages.length,
    loadPrevMessages,
  });

  // 5. 🔥 전송 로직
  const { sendText, sendVoice, sendImageOrVideo } = useChatSender(
    parsedRoomId,
    myId,
    setTempMessages,
    () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
  );

  // 소켓 연결 및 방 입장
  useEffect(() => {
    connect();
    if (parsedRoomId) joinRoom(parsedRoomId);
  }, [parsedRoomId, connect, joinRoom]);

  // 안 읽은 메시지 실시간 읽음 처리 (상대방 메시지가 들어왔을 때)
  useEffect(() => {
    const unread = socketMessages.filter(
      (msg) => !msg.isMine && msg.readAt === null,
    );
    if (unread.length > 0) {
      // 가장 최신 메시지 ID로 읽음 처리 호출
      readChatMessage(unread[unread.length - 1].messageId).catch(console.error);
    }
  }, [socketMessages]);

  // --- 기타 핸들러 (신고/차단) ---
  const handleReportMenuClick = () => {
    setIsMenuOpen(false);
    setIsReportScreenOpen(true);
  };

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

  const handleBlockRequest = () => {
    if (blockId) {
      handleBlockToggle()
        .then(() => setToastMessage("차단 해제됨"))
        .catch(() => alert("실패"));
    } else {
      setIsMenuOpen(false);
      setTimeout(() => setActiveModal("BLOCK"), 100);
    }
  };

  const handleRealBlock = async () => {
    try {
      await handleBlockToggle();
      setActiveModal("EXIT"); // 차단 후 방 나가기 유도 또는 자동 퇴장
      setToastMessage("차단 완료");
    } catch {
      alert("차단 실패");
      setActiveModal("NONE");
    }
  };

  return (
    <div className="w-full h-dvh flex flex-col bg-white relative overflow-hidden">
      {/* 헤더 */}
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

      {/* 메시지 리스트 영역 */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-auto px-4 pt-4 pb-[160px] scrollbar-hide"
      >
        {/* 무한 스크롤 옵저버 */}
        <div ref={topObserverRef} className="h-1 w-full" />

        {isLoading && (
          <div className="w-full flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-gray-600" />
          </div>
        )}

        {/* 첫 인사말 (과거 내역이 없을 때만 노출) */}
        {!isLoading && !nextCursor && displayMessages.length < 10 && (
          <div className="flex flex-col items-center justify-center gap-3 pt-8 pb-12 animate-fade-in">
            <div className="relative shrink-0 w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-100 border border-gray-50">
              <img
                src={
                  peerInfo?.profileImageUrl || "https://via.placeholder.com/80"
                }
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <span className="font-semibold text-[16px] text-[#333] block">
                {peerInfo?.nickname}님과 대화를 시작해보세요
              </span>
              <span className="text-[13px] text-[#999]">
                {peerInfo?.age}세 · {peerInfo?.areaName}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {displayMessages.map((msg: any, index: number) => {
            const currentDate = getFormattedDate(msg.sendAt);
            const prevMsg: any = index > 0 ? displayMessages[index - 1] : null;
            const prevDate = prevMsg ? getFormattedDate(prevMsg.sendAt) : null;
            const showDateSeparator = !prevDate || currentDate !== prevDate;

            return (
              <div key={msg.messageId || `idx-${index}`}>
                {showDateSeparator && <DateSeparator date={currentDate} />}
                <MessageBubble
                  isMe={msg.senderUserId === myId}
                  type={msg.type} // "TEXT" | "AUDIO" | "PHOTO" | "VIDEO"
                  content={msg.text}
                  audioUrl={msg.mediaUrl}
                  duration={msg.durationSec}
                  timestamp={formatTime(msg.sendAt)}
                  readAt={msg.readAt}
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
          })}
          <div ref={bottomRef} className="h-4 w-full" />
        </div>
      </div>

      {/* 하단 입력창 */}
      <div className="absolute bottom-0 w-full z-40 bg-white">
        <ChatInputBar
          onSendText={sendText}
          onSendVoice={sendVoice}
          onSelectImage={sendImageOrVideo}
          isBlocked={blockId !== null}
        />
      </div>

      {/* 모달 및 알림 */}
      <ToastNotification
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage(null)}
      />

      <ReportModal
        isOpen={isMenuOpen}
        isBlocked={blockId !== null}
        onClose={() => setIsMenuOpen(false)}
        onReport={handleReportMenuClick}
        onBlock={handleBlockRequest}
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
        title="상대방을 차단할까요?"
        description="차단하면 서로의 프로필이 노출되지 않으며 대화가 중단됩니다."
        confirmText="차단하기"
        cancelText="취소"
        isDanger={true}
        onCancel={() => setActiveModal("NONE")}
        onConfirm={handleRealBlock}
      />

      <ConfirmModal
        isOpen={activeModal === "EXIT"}
        title="대화방을 나갈까요?"
        description="방을 나가면 기존 대화 내용이 모두 사라집니다."
        confirmText="나가기"
        cancelText="취소"
        isDanger={true}
        onCancel={() => setActiveModal("NONE")}
        onConfirm={() => navigate("/chats")}
      />
    </div>
  );
}
