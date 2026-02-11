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
) => {
  // ✅ 1. socket을 가장 먼저 가져옵니다.
  const { socket } = useSocketStore();
  const [socketMessages, setSocketMessages] = useState<IMessageItem[]>([]);
  const [tempMessages, setTempMessages] = useState<IMessageItem[]>([]);

  useEffect(() => {
    // ✅ 2. socket 선언 여부 체크
    if (!socket) return;

    const handleMessageNew = (response: any) => {
      const newMsgData: MessageNewData = response.success?.data || response;
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
                (temp) => temp.mediaUrl === normalizedUrl,
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

      if (newMsgData.senderUserId !== myId) {
        readChatMessage(newMsgData.messageId).catch(console.error);
      }
    };

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

    // ✅ 3. socket.on 호출 (컴포넌트 내의 변수가 아닌 socket 객체의 메서드 사용)
    socket.on("message.new", handleMessageNew);
    socket.on("message.read", handleMessageRead);

    return () => {
      socket.off("message.new", handleMessageNew);
      socket.off("message.read", handleMessageRead);
    };
  }, [socket, myId, blockId, setInitialMessages]);

  // ✅ 4. 메시지 병합 및 과거->최신순 정렬
  const displayMessages = useMemo(() => {
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
