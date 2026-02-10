import { useState, useEffect, useMemo } from "react";
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

  // 상대 정보 관리 및 메뉴 관리
  const { peerInfo, blockId, isMenuOpen, setIsMenuOpen, handleBlockToggle } = useChatRoomInfo(parsedRoomId);
  
  // 메세지 불러오기 및 삭제 관리
  const { messages, setMessages, nextCursor, isLoading, isInitLoaded, loadPrevMessages, handleDeleteMessage } 
    = useChatMessages(parsedRoomId, myId);

  // 전체 메세지 길이 계산 왜냐 3가지 메세지가 변하면 다시 계산 시기키위해서 존재
  const allMessagesLength = messages.length + socketMessages.length + tempMessages.length;

  // 스크롤 관리
  const { scrollContainerRef, topObserverRef, bottomRef } 
    = useChatScroll({ isInitLoaded, isLoading, nextCursor, messagesLength: allMessagesLength, loadPrevMessages });
  
  // 채팅방내 상태 관리
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
  }, [parsedRoomId, connect, joinRoom]);

  // 메시지 수신 및 상태 변화 리스너 등록 (socket.on)
  useEffect(() => {
    if (!socket) return;

// 1. [수정] 새 메시지 수신 핸들러
    const handleMessageNew = (response: any) => {
      const newMsgData: MessageNewData = response.success?.data || response;

      // 🔥 [삭제] 내가 보낸 건 무시하던 코드 제거
      // if (newMsgData.senderUserId === myId) return;

      if (blockId) {
        console.log("🚫 차단된 사용자의 메시지를 무시했습니다.");
        return; 
      }

      let uiType: any = newMsgData.type;
      if (newMsgData.type === "IMAGE") {
        uiType = "PHOTO";
      }

      // 서버에서 온 '진짜 ID'를 가진 메시지 객체 생성
      const newMsg: IMessageItem = {
        messageId: newMsgData.messageId, // ✅ 여기가 핵심! 진짜 DB ID
        senderUserId: newMsgData.senderUserId,
        type: uiType,
        text: newMsgData.text,
        mediaUrl: newMsgData.mediaUrl || "",
        durationSec: newMsgData.durationSec,
        sendAt: newMsgData.sentAt,
        readAt: null,
        isMine: newMsgData.senderUserId === myId, // 내 메시지인지 확인
      };

      // 1. 소켓 메시지 목록에 진짜 메시지 추가
      setSocketMessages((prev) => [...prev, newMsg]);

      // 2. 🔥 [핵심 추가] 만약 '내 메시지'라면, 가짜(temp) 메시지를 삭제해야 함!
      // (그래야 화면에 가짜 ID 대신 진짜 ID를 가진 메시지가 남음)
      if (newMsgData.senderUserId === myId) {
         setTempMessages((prev) => {
            // 내용과 타입이 같은 가장 오래된 임시 메시지 하나를 찾아서 제거 (FIFO)
            // (완벽한 매칭을 위해선 FE에서 보낼 때 uuid를 생성해서 갔다와야 하지만, 
            //  지금 구조에선 내용 매칭으로 처리합니다)
            const index = prev.findIndex(temp => 
               temp.type === uiType && 
               temp.text === newMsg.text
            );

            if (index !== -1) {
               const newTemp = [...prev];
               newTemp.splice(index, 1); // 찾은 놈 삭제
               return newTemp;
            }
            return prev;
         });
      }

      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      
      // 내 메시지가 아닐 때만 읽음 처리 요청
      if (newMsgData.senderUserId !== myId) {
        try {
          readChatMessage(newMsgData.messageId); 
        } catch (e) {
          console.error("읽음 처리 실패", e);
        }
      }
    };

// 🔥 [수정] 상대방이 읽었을 때 처리 (message.read)
    const handleMessageRead = (response: any) => {
      const data = response.success?.data || response;
      const { messageId, readAt } = data; 

      if (!messageId || !readAt) return;

      console.log(`👀 상대방이 ID ${messageId}번(혹은 그 시점)까지 읽었습니다.`);
      
      const readTime = new Date(readAt).getTime(); // 읽은 시점의 타임스탬프

      // (공통 함수) 리스트 업데이트 로직
      const updateReadStatus = (prevList: IMessageItem[]) => 
        prevList.map((msg) => {
          // 이미 읽음 처리된 건 패스
          if (!msg.isMine || msg.readAt) return msg;

          // 조건 1: DB ID 기준 비교 (서버 메시지용) -> ID가 작거나 같으면 읽은 것
          const isIdMatched = msg.messageId <= messageId;
          
          // 조건 2: 시간 기준 비교 (tempMessages용) -> 읽은 시간보다 이전에 보냈으면 읽은 것
          // (임시 메시지 ID는 Date.now()라 ID 비교가 불가능하므로 시간으로 체크)
          const msgTime = new Date(msg.sendAt).getTime();
          const isTimeMatched = msgTime <= readTime;

          // 둘 중 하나라도 만족하면 읽음 처리!
          if (isIdMatched || isTimeMatched) {
             // ⚠️ 만약 기존 readAt이 있으면 유지 (안전장치)
             return { ...msg, readAt: readAt };
          }
          return msg;
        });

      // 3가지 리스트 모두 갱신
      if (setMessages) setMessages(updateReadStatus); 
      setSocketMessages(updateReadStatus);
      setTempMessages(updateReadStatus); // 🔥 이제 임시 메시지도 시간 비교로 인해 업데이트 됨!
    };

    // 🔥 3. [추가] 메시지가 삭제되었을 때 (message.deleted)
    const handleMessageDelete = (response: any) => {
      const data = response.success?.data || response;
      const { messageId } = data;

      if (!messageId) return;

      console.log("🗑️ 메시지 삭제됨:", messageId);

      // (공통 함수) 리스트에서 해당 ID 제거 (filter)
      const removeMessage = (prevList: IMessageItem[]) =>
        prevList.filter((msg) => msg.messageId !== messageId);

      // 3가지 리스트 모두에서 삭제
      if (setMessages) setMessages(removeMessage); // 훅에서 가져온 setter
      setSocketMessages(removeMessage);
      setTempMessages(removeMessage);
    };

    // ✅ 이벤트 등록
    socket.on("message.new", handleMessageNew);
    socket.on("message.read", handleMessageRead);     // 읽음 리스너 연결
    socket.on("message.deleted", handleMessageDelete); // 삭제 리스너 연결

    // ❌ 이벤트 해제 (Cleanup)
    return () => {
      socket.off("message.new", handleMessageNew);
      socket.off("message.read", handleMessageRead);
      socket.off("message.deleted", handleMessageDelete);
    };
    
    // 의존성 배열에 setMessages 추가
  }, [socket, myId, bottomRef, blockId, setMessages]);

  useEffect(() => {
    // 1. 전체 메시지 합치기 (순서: 과거 -> 최신)
    const allMessages = [...messages, ...socketMessages];

    if (allMessages.length === 0) return;

    // 2. '상대방'이 보냈고, '아직 안 읽은(readAt === null)' 메시지 필터링
    const unreadMessages = allMessages.filter(
      (msg) => !msg.isMine && msg.readAt === null
    );

    // 3. 안 읽은 게 있다면 '가장 마지막(최신)' 메시지 ID로 읽음 요청
    if (unreadMessages.length > 0) {
      const lastUnreadMsg = unreadMessages[unreadMessages.length - 1];

      // 중복 호출 방지를 위해 로컬 스토리지나 Ref로 마지막 요청 ID를 체크하는 게 좋지만,
      // 일단 기능 동작 확인을 위해 바로 호출합니다.
      console.log(`👀 읽음 처리 요청: ${lastUnreadMsg.messageId} (내용: ${lastUnreadMsg.text})`);
      readChatMessage(lastUnreadMsg.messageId).catch(err => console.error(err));
    }
    
    // 🔥 [핵심] 의존성 배열에 socketMessages 추가!
  }, [messages, socketMessages]);

  // ------------------------------------------------------------------
  // 1️⃣ 텍스트 전송
  // ------------------------------------------------------------------
  const onSendTextWrapper = async (text: string) => {
  // 1. 낙관적 업데이트
  // ⚠️ 중요: 변수 뒤에 : IMessageItem 을 붙여서 타입을 고정합니다.
  const tempMsg: IMessageItem = {
    messageId: Date.now(),
    senderUserId: myId,
    type: "TEXT",     // 이제 TS가 이걸 'string'이 아니라 'MessageType'의 "TEXT"로 인식합니다.
    text: text,
    mediaUrl: "",     // ⚠️ 중요: 에러 로그상 null이 안 되므로 빈 문자열로 변경
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

  // ------------------------------------------------------------------
  // 2️⃣ 음성 메세지 전송 (Audio) - 🔥 [수정됨: 가짜 URL 사용]
  // ------------------------------------------------------------------
  const onSendVoiceWrapper = async (file: File, duration: number) => {
  const fakeUrl = URL.createObjectURL(file);

  // ⚠️ 타입 명시
  const tempMsg: IMessageItem = {
    messageId: Date.now(),
    senderUserId: myId,
    type: "AUDIO",
    text: null,       // TEXT가 아니면 text는 null (타입 정의에 따라 ""일 수도 있음, 에러 나면 ""로 변경)
    mediaUrl: fakeUrl,
    durationSec: duration,
    sendAt: new Date().toISOString(),
    readAt: null,
    isMine: true,
  };
  setTempMessages((prev) => [...prev, tempMsg]);
  setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  sendMessage(parsedRoomId, "AUDIO", null, fakeUrl, duration);
};

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const isVideo = file.type.startsWith("video");
    const uiType = isVideo ? "VIDEO" : "PHOTO"; 

    const fakeUrl = URL.createObjectURL(file);

    const tempMsg: IMessageItem = {
      messageId: Date.now(),
      senderUserId: myId,
      type: uiType, 
      text: null,
      mediaUrl: fakeUrl,
      durationSec: 0, 
      sendAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
    };
    setTempMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // 소켓 전송용 타입 (VIDEO / IMAGE)
    const socketType = isVideo ? "VIDEO" : "IMAGE";
    sendMessage(parsedRoomId, socketType, null, fakeUrl, null);
    
    // 🔥 [삭제] fileInputRef 초기화 코드는 더 이상 필요 없음
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

  // [수정] 중복 제거 시 '읽음 상태(readAt)' 지키기
  const combinedMessages = useMemo(() => {
    const rawList = [...messages, ...socketMessages, ...tempMessages];
    const uniqueMap = new Map();

    rawList.forEach((msg: any) => {
      // 날짜 표준화
      const originalDate = msg.sendAt || msg.sentAt || new Date().toISOString();
      const standardizedDate = String(originalDate).replace(" ", "T");

      const standardizedMsg = {
        ...msg,
        sendAt: standardizedDate, 
        sentAt: standardizedDate, 
      };

      // Key 생성
      const key = msg.messageId ? String(msg.messageId) : `temp-${standardizedDate}`;
      
      // 🔥 [핵심 수정] 이미 맵에 있는 데이터와 비교해서 똑똑하게 합치기
      const existing = uniqueMap.get(key);

      if (existing) {
        // 1. 기본적으로는 뒤에 오는 데이터(최신)로 덮어씀 (내용 수정 등을 위해)
        const mergedMsg = { ...existing, ...standardizedMsg };

        // 2. [방어 로직] 
        // 기존 맵에 있는 건 '읽음(값이 있음)'인데, 지금 들어온 건 '안 읽음(null)'이라면?
        // -> 읽음 상태를 유지시킨다! (tempMessage가 덮어쓰는 것 방지)
        if (existing.readAt && !standardizedMsg.readAt) {
          mergedMsg.readAt = existing.readAt;
        }
        
        // 반대로 지금 들어온 게 읽음이면 자연스럽게 덮어써지니 OK
        
        uniqueMap.set(key, mergedMsg);
      } else {
        // 없으면 그냥 넣음
        uniqueMap.set(key, standardizedMsg);
      }
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
        

        <ChatInputBar 
          onSendText={onSendTextWrapper} 
          onSendVoice={onSendVoiceWrapper} 
          // 🔥 [수정] onClickPlus 삭제 -> onSelectImage 추가
          onSelectImage={handleFileSelect}
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