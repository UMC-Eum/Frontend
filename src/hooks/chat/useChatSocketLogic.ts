import { useState, useEffect, useMemo } from "react";
import { useSocketStore } from "../../stores/useSocketStore";
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO";
import { readChatMessage } from "../../api/chats/chatsApi";
import { MessageNewData } from "../../types/api/socket";

type IMessageItem = IChatsRoomIdMessagesGetResponse["items"][number];

export const useChatSocketLogic = (
  myId: number,
  initialMessages: IMessageItem[],
  setInitialMessages: React.Dispatch<React.SetStateAction<IMessageItem[]>>,
  blockId: number | null,
) => {
  const { socket } = useSocketStore();
  const [socketMessages, setSocketMessages] = useState<IMessageItem[]>([]);
  const [tempMessages, setTempMessages] = useState<IMessageItem[]>([]);

  // 1. 소켓 이벤트 리스너
  useEffect(() => {
    if (!socket) return;

    // 새 메시지 수신 (message.new)
    const handleMessageNew = (response: any) => {
      const newMsgData: MessageNewData = response.success?.data || response;
      if (blockId) return;

      // ✅ [수정] 타입 단언(as string)을 사용하여 ts(2367) 에러 해결
      // 서버 타입(PHOTO/IMAGE) -> UI 타입(PHOTO) 변환 및 비디오 대응
      let uiType: any = newMsgData.type;
      const rawType = newMsgData.type as string;

      if (rawType === "IMAGE" || rawType === "PHOTO") {
        uiType = "PHOTO";
      } else if (rawType === "VIDEO") {
        uiType = "VIDEO";
      }

      // 서버 데이터 매핑 (sentAt -> sendAt)
      const newMsg: IMessageItem = {
        messageId: newMsgData.messageId,
        senderUserId: newMsgData.senderUserId,
        type: uiType,
        text: newMsgData.text,
        mediaUrl: newMsgData.mediaUrl || "",
        durationSec: newMsgData.durationSec,
        sendAt: newMsgData.sentAt,
        readAt: null,
        isMine: newMsgData.senderUserId === myId,
      };

      console.log("📥 새 메시지 수신:", newMsg);
      setSocketMessages((prev) => [...prev, newMsg]);

      // 내 메시지라면 낙관적 업데이트로 추가했던 임시 메시지 삭제
      if (newMsgData.senderUserId === myId) {
        setTempMessages((prev) =>
          prev.filter(
            (temp) =>
              !(
                // 텍스트 내용이 같거나, 미디어 URL이 같은 경우 필터링
                (
                  (temp.type === uiType &&
                    temp.text &&
                    temp.text === newMsg.text) ||
                  (temp.mediaUrl && temp.mediaUrl === newMsg.mediaUrl)
                )
              ),
          ),
        );
      }

      // 상대방 메시지라면 읽음 처리 API 호출
      if (newMsgData.senderUserId !== myId) {
        readChatMessage(newMsgData.messageId).catch(console.error);
      }
    };

    // 메시지 읽음 처리 (message.read)
    const handleMessageRead = (response: any) => {
      const { messageId, readAt } = response.success?.data || response;
      if (!messageId || !readAt) return;

      const updateReadStatus = (list: IMessageItem[]) =>
        list.map((msg) => {
          if (!msg.isMine || msg.readAt) return msg;
          const isMatched =
            msg.messageId <= messageId ||
            new Date(msg.sendAt).getTime() <= new Date(readAt).getTime();
          return isMatched ? { ...msg, readAt } : msg;
        });

      setInitialMessages((prev) => updateReadStatus(prev));
      setSocketMessages((prev) => updateReadStatus(prev));
      setTempMessages((prev) => updateReadStatus(prev));
    };

    // 메시지 삭제 (message.deleted)
    const handleMessageDelete = (response: any) => {
      const { messageId } = response.success?.data || response;
      if (!messageId) return;

      const filterMsg = (list: IMessageItem[]) =>
        list.filter((msg) => msg.messageId !== messageId);

      setInitialMessages((prev) => filterMsg(prev));
      setSocketMessages((prev) => filterMsg(prev));
      setTempMessages((prev) => filterMsg(prev));
    };

    socket.on("message.new", handleMessageNew);
    socket.on("message.read", handleMessageRead);
    socket.on("message.deleted", handleMessageDelete);

    return () => {
      socket.off("message.new", handleMessageNew);
      socket.off("message.read", handleMessageRead);
      socket.off("message.deleted", handleMessageDelete);
    };
  }, [socket, myId, blockId, setInitialMessages]);

  // 2. 메시지 병합 및 정렬 (Memoization)
  const displayMessages = useMemo(() => {
    const rawList = [...initialMessages, ...socketMessages, ...tempMessages];
    const uniqueMap = new Map();

    rawList.forEach((msg) => {
      // 날짜 포맷 표준화 (공백을 T로 치환)
      const dateStr = String(msg.sendAt || new Date().toISOString()).replace(
        " ",
        "T",
      );

      const standardizedMsg = { ...msg, sendAt: dateStr };

      // 중복 제거 키 (messageId가 없으면 임시 키 생성)
      const key = msg.messageId
        ? String(msg.messageId)
        : `temp-${dateStr}-${msg.text || msg.mediaUrl}`;

      const existing = uniqueMap.get(key);
      if (existing) {
        const mergedMsg = { ...existing, ...standardizedMsg };
        // 이미 읽음 처리가 되었다면 유지
        if (existing.readAt && !standardizedMsg.readAt)
          mergedMsg.readAt = existing.readAt;
        uniqueMap.set(key, mergedMsg);
      } else {
        uniqueMap.set(key, standardizedMsg);
      }
    });

    // 시간 순 정렬
    return Array.from(uniqueMap.values()).sort(
      (a: any, b: any) =>
        new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime(),
    );
  }, [initialMessages, socketMessages, tempMessages]);

  return { displayMessages, setTempMessages, socketMessages };
};
