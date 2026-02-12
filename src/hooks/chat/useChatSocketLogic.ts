import { useState, useEffect, useMemo } from "react";
import { useSocketStore } from "../../stores/useSocketStore";
import { IChatsRoomIdMessagesGetResponse } from "../../types/api/chats/chatsDTO";
import { readChatMessage } from "../../api/chats/chatsApi";
import { MessageNewData } from "../../types/api/socket";

type IMessageItem = IChatsRoomIdMessagesGetResponse["items"][number];
type MessageWithSentAt = IMessageItem & { sentAt?: string };

const normalizeMediaUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("s3://")) {
    const withoutScheme = url.replace("s3://", "");
    const [bucket, ...rest] = withoutScheme.split("/");
    const key = rest.join("/");
    if (!bucket || !key) return url;
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  return url;
};

export const useChatSocketLogic = (
  myId: number,
  initialMessages: IMessageItem[],
  setInitialMessages: React.Dispatch<React.SetStateAction<IMessageItem[]>>,
  blockId: number | null,
  currentRoomId: number // 🔥 [추가] 현재 방 번호를 인자로 받음
) => {
  const { socket } = useSocketStore();
  const [socketMessages, setSocketMessages] = useState<IMessageItem[]>([]);
  const [tempMessages, setTempMessages] = useState<IMessageItem[]>([]);

  useEffect(() => {
    if (!socket) return;

    // 1. 새 메시지 수신
    const handleMessageNew = (response: any) => {
      const newMsgData: MessageNewData = response.success?.data || response;

      // 🔥 [핵심 수정] 다른 방에서 온 메시지면 무시!
      // (단, 데이터에 chatRoomId가 없다면 백엔드 확인 필요하지만 보통 있습니다)
      if (newMsgData.chatRoomId && Number(newMsgData.chatRoomId) !== currentRoomId) {
        return; 
      }

      if (blockId) return;

      const rawType = String(newMsgData.type);
      const uiType: IMessageItem["type"] =
        rawType === "PHOTO" || rawType === "IMAGE"
          ? "PHOTO"
          : rawType === "VIDEO"
            ? "VIDEO"
            : rawType === "AUDIO"
              ? "AUDIO"
              : "TEXT";

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

      setSocketMessages((prev) => [...prev, newMsg]);

      // 임시 메시지 삭제 로직 (기존 유지)
      if (newMsgData.senderUserId === myId) {
        setTempMessages((prev) => {
          let targetIndex = -1;
          if (uiType === "TEXT") {
            targetIndex = prev.findIndex(
              (temp) => temp.type === "TEXT" && temp.text === newMsg.text,
            );
          } else {
            const normalizedUrl = normalizeMediaUrl(newMsg.mediaUrl);
            if (normalizedUrl) {
              targetIndex = prev.findIndex(
                (temp) => normalizeMediaUrl(temp.mediaUrl) === normalizedUrl,
              );
            }
            if (targetIndex === -1) {
              const newMsgTime = new Date(newMsg.sendAt).getTime();
              for (let i = prev.length - 1; i >= 0; i -= 1) {
                const temp = prev[i];
                if (temp.type !== uiType) continue;
                const tempTime = new Date(temp.sendAt).getTime();
                if (Math.abs(tempTime - newMsgTime) < 10000) {
                  targetIndex = i;
                  break;
                }
              }
            }
          }
          if (targetIndex !== -1) {
            const newList = [...prev];
            newList.splice(targetIndex, 1);
            return newList;
          }
          return prev;
        });
      }

      // 현재 방에 온 메시지이고, 상대방이 보냈으면 읽음 처리
      if (newMsgData.senderUserId !== myId) {
        readChatMessage(newMsgData.messageId).catch(console.error);
      }
    };

    // 2. 메시지 읽음 처리
    const handleMessageRead = (response: any) => {
      const data = response.success?.data || response;
      const { messageId, readAt, chatRoomId } = data; // chatRoomId 확인

      if (!messageId || !readAt) return;

      // 🔥 [추가] 다른 방의 읽음 처리는 무시
      if (chatRoomId && Number(chatRoomId) !== currentRoomId) return;

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

    // 3. 메시지 삭제 처리
    const handleMessageDelete = (response: any) => {
      const data = response.success?.data || response;
      const { messageId, chatRoomId } = data;

      if (!messageId) return;

      // 🔥 [추가] 다른 방의 삭제 이벤트는 무시
      if (chatRoomId && Number(chatRoomId) !== currentRoomId) return;

      const removeMessage = (list: IMessageItem[]) =>
        list.filter((msg) => msg.messageId !== messageId);

      setInitialMessages((prev) => removeMessage(prev));
      setSocketMessages((prev) => removeMessage(prev));
      setTempMessages((prev) => removeMessage(prev));
    };

    socket.on("message.new", handleMessageNew);
    socket.on("message.read", handleMessageRead);
    socket.on("message.deleted", handleMessageDelete);

    return () => {
      socket.off("message.new", handleMessageNew);
      socket.off("message.read", handleMessageRead);
      socket.off("message.deleted", handleMessageDelete);
    };
  }, [socket, myId, blockId, setInitialMessages, currentRoomId]); // 🔥 의존성 추가

  const displayMessages = useMemo(() => {
    // ... (기존 병합 로직 유지)
    const rawList: MessageWithSentAt[] = [
      ...initialMessages,
      ...socketMessages,
      ...tempMessages,
    ];
    const uniqueMap = new Map();

    rawList.forEach((msg) => {
      const dateStr = String(
        msg.sendAt || msg.sentAt || new Date().toISOString(),
      ).replace(" ", "T");
      const standardizedMsg = {
        ...msg,
        sendAt: dateStr,
        mediaUrl: normalizeMediaUrl(msg.mediaUrl),
      };

      const key = msg.messageId
        ? String(msg.messageId)
        : `temp-${dateStr}-${msg.type}-${msg.text || msg.mediaUrl}`;

      const existing = uniqueMap.get(key);
      if (existing) {
        const mergedMsg = { ...existing, ...standardizedMsg };
        if (existing.readAt && !standardizedMsg.readAt)
          mergedMsg.readAt = existing.readAt;
        uniqueMap.set(key, mergedMsg);
      } else {
        uniqueMap.set(key, standardizedMsg);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => {
      const aTime = new Date(a.sendAt).getTime();
      const bTime = new Date(b.sendAt).getTime();
      return aTime - bTime;
    });
  }, [initialMessages, socketMessages, tempMessages]);

  return { displayMessages, setTempMessages, socketMessages };
};