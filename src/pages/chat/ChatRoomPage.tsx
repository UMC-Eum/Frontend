import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

// Hooks
import { useChatRoomInfo } from "../../hooks/chat/useChatRoomInfo";
import { useChatMessages } from "../../hooks/chat/useChatMessages";
import { useChatScroll } from "../../hooks/chat/useChatScroll";

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


// 모달 타입 정의 (어떤 모달 띄울지)
type ModalType = "NONE" | "BLOCK" | "EXIT";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const myId = user?.userId ?? 0;
  const parsedRoomId = Number(roomId);

  // 🔥 [추가 1] 임시 메시지를 담을 로컬 state 생성
  const [tempMessages, setTempMessages] = useState<any[]>([]);
  // 상대방 관련 정보 관리
  const { peerInfo, blockId, isMenuOpen, setIsMenuOpen, handleBlockToggle } = useChatRoomInfo(parsedRoomId);
  // 채팅방 메세지 관리
  const { messages, nextCursor, isLoading, isInitLoaded, loadPrevMessages, handleSendText, handleSendVoice, handleDeleteMessage } 
    = useChatMessages(parsedRoomId, myId);
  // 채팅방 스크롤 관리
  const { scrollContainerRef, topObserverRef, bottomRef } 
    = useChatScroll({ isInitLoaded, isLoading, nextCursor, messagesLength: messages.length, loadPrevMessages });
  
  // 모달 관리
  const [activeModal, setActiveModal] = useState<ModalType>("NONE");
  // 음성 메세지 재생 관리
  const [playingId, setPlayingId] = useState<number | null>(null);
  // 토스트 메시지 상태 관리
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // 신고하기 화면(ReportScreen) 상태 관리
  const [isReportScreenOpen, setIsReportScreenOpen] = useState(false);

  // 텍스트 입력창 래퍼
  
  // 텍스트 전송 래퍼
  const onSendTextWrapper = async (text: string) => {
    // 🔥 [추가 2] API 요청 보내기 전에 "가짜 메시지" 만들어서 화면에 즉시 투입
    const tempMsg = {
      messageId: Date.now(), // 임시 ID (현재 시간)
      senderUserId: myId,
      type: "TEXT",
      text: text,
      mediaUrl: null,
      durationSec: 0,
      sendAt: new Date().toISOString(),
      readAt: null, // 안 읽음 처리
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    
    // 스크롤 즉시 내리기
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // 원래 API 호출 (실패하더라도 화면엔 이미 떴음)
    await handleSendText(text);
  };
  // 음성 입력창 래퍼
  // 음성 전송 래퍼
  const onSendVoiceWrapper = async (file: File, duration: number) => {
    // 🔥 [추가 3] 음성도 가짜 메시지 투입 (blob URL 사용)
    const tempMsg = {
      messageId: Date.now(),
      senderUserId: myId,
      type: "VOICE",
      text: "",
      mediaUrl: URL.createObjectURL(file), // 💡 내 파일로 바로 재생 가능한 URL 생성
      durationSec: duration,
      sendAt: new Date().toISOString(),
      readAt: null,
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    await handleSendVoice(file, duration);
  };

  // 토스트 메시지 표시 함수
  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // 메뉴에서 [신고하기] 클릭 시 실행
  const handleReportMenuClick = () => {
    setIsMenuOpen(false); // 메뉴 닫고
    setIsReportScreenOpen(true); // 신고 전체화면 열기
  };

  // 메뉴에서 [차단하기] 클릭 시 실행
  const handleBlockRequest = async () => {
    // 차단 해제 로직 (이미 차단된 상태일 때)
    if (blockId) {
      try {
        // 1. API 호출 시도
        await handleBlockToggle(); 
        
        // 2. 성공했을 때만 토스트 띄우기
        showToast("차단이 해제되었어요.");
      } catch (error) {
        // 3. 실패 시 처리 (토스트 안 띄움)
        console.error("차단 해제 실패", error);
        alert("요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } 
    // 차단 시도 로직 (차단 안 된 상태일 때)
    else {
      setIsMenuOpen(false); // 메뉴 닫기
      setTimeout(() => {
        setActiveModal("BLOCK"); // 차단 확인 모달 열기
      }, 100);
    }
  };

  // 차단 모달에서 [예] 클릭 시 실행
  const handleRealBlock = async () => {
    try {
      // 1. API 호출 시도
      await handleBlockToggle(); 
      
      // --- 🎉 성공 시 실행되는 로직 ---
      
      // 2. 모달 상태 변경 (차단 모달 닫기 -> 나가기 모달 열기)
      setActiveModal("NONE");
      setTimeout(() => {
        setActiveModal("EXIT"); 
      }, 300);

      // 3. 성공했을 때만 토스트 띄우기
      showToast(`${peerInfo?.nickname || "상대방"}님을 차단했어요.`);

    } catch (error) {
      // 실패 시 실행되는 로직
      console.error("차단 실패", error);
      alert("차단에 실패했습니다. 네트워크 상태를 확인해주세요.");
      
      // 실패했으면 모달을 닫아주거나, 그대로 둬서 다시 누르게 할 수 있습니다.
      setActiveModal("NONE"); 
    }
  };
  const handleRealReport = async (categoryCode: string, description: string) => {
    if (!roomId || !peerInfo) return;

    // API 호출
    await createReport({
      targetUserId: peerInfo.userId,
      category: categoryCode,
      reason: `${description}`, // 위 g내용 변경과 동시에 변경
      chatRoomId: Number(roomId)
    });
  };

  return (
    <div className="w-full h-dvh flex flex-col bg-white relative overflow-hidden">
      
      <header className="shrink-0 h-[45px] px-4 flex items-center justify-between bg-white z-10 border-b border-gray-100">
        {/* 뒤로가기 버튼 */}
        <div className="-ml-5"><BackButton /></div>
        {/* 상대방 닉네임 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-2">
          <span className="font-bold text-[24px] text-[#111]">{peerInfo?.nickname}</span>
        </div>
        {/* 더보기 버튼 */}
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
          {/* 상대방 프로필 이미지 */}
          <div className="relative shrink-0 w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-200">
            <img src={peerInfo?.profileImageUrl} alt="profile" className="w-full h-full object-cover"/>
          </div>
          {/* 최초 메세지 대화시의 상대방 닉네임, 나이, 지역 */}
          <div className="text-center">
            <span className="font-semibold text-[18px] text-[#636970] block">{peerInfo?.nickname}</span>
            <span className="text-[14px] text-[#636970]">{peerInfo?.age}세 · {peerInfo?.areaName}</span>
          </div>
          <p className="mt-6 mb-2 text-[18px] text-[#636970] text-center">서로 알아가는 첫 이야기,<br/>편하게 시작해볼까요?</p>
        </div>
        {/* 메세지들 */}
        <div className="flex flex-col gap-3">
          {[...messages, ...tempMessages].map((msg) => (
            <MessageBubble
              key={msg.messageId} // 임시 ID 사용
              isMe={msg.senderUserId === myId}
              type={msg.type}
              content={msg.text}
              audioUrl={msg.mediaUrl}
              duration={msg.durationSec}
              timestamp={formatTime(msg.sendAt)}
              readAt={msg.readAt}
              isPlayingProp={playingId === msg.messageId}
              onPlay={() => setPlayingId(playingId === msg.messageId ? null : msg.messageId)}
              // 임시 메시지는 삭제 기능 막거나, 원하면 로컬에서만 지우게 처리 가능
              onDelete={msg.senderUserId === myId ? () => handleDeleteMessage(msg.messageId) : undefined}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* 공용 토스트 컴포넌트 배치 */}
      <ToastNotification 
        message={toastMessage}
        isVisible={!!toastMessage} // 메시지가 있으면 true
        onClose={() => setToastMessage(null)} // 시간 지나면 메시지 비움
      />

      {/* 채팅 입력창 */}
      <div className="absolute bottom-0 w-full z-40">

        <div className="absolute bottom-0 left-0 right-0 h-[300px] -z-10 pointer-events-none
            
            {/* 1. 배경색 그라데이션 (기존 유지): 하단으로 갈수록 완전 흰색이 되어 글씨를 가림 */}
            bg-gradient-to-t from-white from-20% via-white/50 to-transparent

            {/* 2. 블러 최대 강도 조절: 너무 강하면 [2px] or [3px]로 줄여보세요. */}
            backdrop-blur-[3px]

            {/* 3. [핵심] 블러 마스크: 
                to_bottom: 위에서 아래로
                transparent_10%: 상단 10% 지점까지는 투명 (블러 강도 0)
                black_80%: 하단 80% 지점부터는 완전 검정 (블러 강도 최대)
                -> 이 사이 구간에서 블러가 0에서 최대치로 부드럽게 변함
            */}
            [mask-image:linear-gradient(to_bottom,transparent_10%,black_80%)]"
          />
        <ChatInputBar 
          onSendText={onSendTextWrapper} 
          onSendVoice={onSendVoiceWrapper} 
          isBlocked={blockId !== null} 
        />
      </div>

      {/* 메뉴 버튼 클릭 시 실행 */}
      <ReportModal 
        isOpen={isMenuOpen} 
        isBlocked={blockId !== null} 
        onClose={() => setIsMenuOpen(false)} 
        onReport={handleReportMenuClick} 
        onBlock={handleBlockRequest} 
        onLeave={() => { setIsMenuOpen(false); setActiveModal("EXIT"); }} 
      />

      {/* 신고 버튼 클릭 시 실행 */}
      <ReportScreen 
        isOpen={isReportScreenOpen}
        onClose={() => setIsReportScreenOpen(false)}
        targetName={peerInfo?.nickname || "상대방"}
        onReport={handleRealReport}
      />

      {/* 차단 확인 모달 */}
      <ConfirmModal
        isOpen={activeModal === "BLOCK"} 
        title="상대방을 차단할까요?"
        description={`차단하면 ${peerInfo?.nickname || "상대방"}님과 대화를 할 수 없어요.\n차단하시겠어요?`}
        confirmText="예"
        cancelText="아니요"
        isDanger={true}
        onCancel={() => setActiveModal("NONE")} 
        onConfirm={handleRealBlock} // 여기서 () => handleRealBlock() 하지 말고 함수 이름만 넣으세요!
      />

      {/* 나가기 확인 모달 */}
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