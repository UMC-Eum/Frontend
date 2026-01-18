import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore"; 
import BackButton from "../../components/BackButton";
// 👇 DTO 가져오기
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO";

// 🔴 [수정 완료] items가 배열이기 때문에, 그 안의 '하나'의 타입을 꺼내려면 [number]가 반드시 있어야 합니다.
// 이게 없으면 messages가 '배열의 배열'이 되어버려서 에러가 납니다.
type IMessageItem = IChatsRoomIdMessagesGetResponse["items"];

// 컴포넌트들
import { MessageBubble } from "../../components/chats/MessageBubble";
import { ChatInputBar } from "../../components/chats/ChatInputBar";
import { ReportModal } from "../../components/chats/ReportModal";
import { formatTime } from "../../hooks/UseFormatTime";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore(); // 내 user.userId
  const myId = user?.userId ?? 1;

  // 메시지 목록 상태 (IMessageItem 배열)
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  const [peerInfo, setPeerInfo] = useState<{ nickname: string; age: number; areaName: string; profileImageUrl: string } | null>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const [playingId, setPlayingId] = useState<number | null>(null);

  // 🔄 초기 더미 데이터 로딩
  useEffect(() => {
    // API 호출 대신 가짜 데이터 설정
    setPeerInfo({ nickname: "김성수", age: 53, areaName: "죽전동", profileImageUrl: "https://picsum.photos/200/300?random=1" });

    // 가짜 메시지 데이터
    setMessages([
      {
        messageId: 1,
        senderId: 999, // 상대방 ID
        type: "TEXT",
        text: "서로를 알아가는 첫 이야기,\n편하게 시작해볼까요?",
        audioUrl: "", 
        durationSec: 0,
        sendAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        readAt: null
      },
      {
        messageId: 2,
        senderId: user?.userId || 0, // 나
        type: "TEXT",
        text: "안녕하세요! 반갑습니다.",
        audioUrl: "",
        durationSec: 0,
        sendAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        readAt: null
      }
    ]);
  }, [roomId, user]);

  // 📜 스크롤 하단 이동
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 💬 텍스트 전송 (로컬 State 추가)
  const handleSendText = (text: string) => {
    const newMessage: IMessageItem = {
      messageId: Date.now(),
      senderId: myId,
      type: "TEXT",
      text: text,
      audioUrl: "",
      durationSec: 0,
      sendAt: new Date().toISOString(),
      readAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  // 🎙️ 음성 전송 (브라우저 미리보기 URL 사용)
  const handleSendVoice = (file: File) => {
    const localAudioUrl = URL.createObjectURL(file);

    const newMessage: IMessageItem = {
      messageId: Date.now(),
      senderId: myId,
      type: "AUDIO",
      text: null,
      audioUrl: localAudioUrl, 
      durationSec: 10, 
      sendAt: new Date().toISOString(),
      readAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  // ▶️ 오디오 재생 핸들러
  const handlePlayAudio = (id: number) => {
    // 이미 재생 중인 걸 또 누르면 멈춤(토글), 아니면 새로운 걸로 교체
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <div className="w-full h-dvh flex flex-col bg-white relative overflow-hidden">
      
      {/* Header */}
      <header className="shrink-0 h-[45px] px-4 flex items-center justify-between bg-white z-10">
        <div className="-ml-5">
          <BackButton />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-2">
          <span className="font-bold text-[24px] text-[#111]">{peerInfo?.nickname}</span>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className="p-2 -mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" fill="#111"/><circle cx="12" cy="12" r="2" fill="#111"/><circle cx="12" cy="19" r="2" fill="#111"/></svg>
        </button>
      </header>

      {/* Messages & 첫 대화시 화면 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
        {/* 채팅방 초기 이미지 세팅값 */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative shrink-0 w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-200">
            <img 
              src={peerInfo?.profileImageUrl || "https://via.placeholder.com/52"} 
              alt={peerInfo?.nickname}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="font-semibold text-[18px] text-[#636970]">{peerInfo?.nickname}</span>
            {peerInfo && <span className="text-[14px] text-[#636970]">{peerInfo.age}세 · {peerInfo.areaName}</span>}
          </div>

          <div className="mt-10 text-[18px] text-[#636970] flex flex-col items-center justify-center">
            <span>서로 알아가는 첫 이야기,</span>
            <span>편하게 시작해볼까요?</span>
          </div>
        </div>

        {/* message list */}
        <div className="flex flex-col mt-5">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.messageId}
              isMe={msg.senderId === myId}
              type={msg.type}
              content={msg.text}
              audioUrl={msg.audioUrl}
              duration={msg.durationSec}
              timestamp={formatTime(msg.sendAt)} 
              readAt={msg.readAt}
              // 👇 오디오 재생 로직 연결
              isPlayingProp={playingId === msg.messageId}
              onPlay={() => handlePlayAudio(msg.messageId)}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInputBar onSendText={handleSendText} onSendVoice={handleSendVoice} />

      {/* Modals */}
      <ReportModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onBlockAction={() => { 
          setIsMenuOpen(false); 
          setIsExitConfirmOpen(true); 
        }} 
        onJustExit={() => {
          setIsMenuOpen(false);
          navigate(-1);
        }}
      />

      {/* 나가기 확인 모달 */}
      {isExitConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
           <div className="absolute inset-0 bg-black/60" onClick={() => setIsExitConfirmOpen(false)} />
           <div className="relative bg-white rounded-[14px] p-6 w-full max-w-[322px]">
            <button 
              onClick={() => setIsExitConfirmOpen(false)}
              className="absolute top-4 right-4 p-1 text-[#A6AFB^] hover:text-[#111]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
              <h3 className="flex font-semibold text-[20px] mb-2 text-[#111]">대화방을 나갈까요?</h3>
              <p className="flex text-[#636970] text-[14px] mb-6">나가면 대화가 불가능합니다.</p>
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