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
  const { socket } = useSocketStore();
  const [socketMessages, setSocketMessages] = useState<IMessageItem[]>([]);
  const [tempMessages, setTempMessages] = useState<IMessageItem[]>([]);

  useEffect(() => {
    if (!socket) return;

    // 1. [수정] 새 메시지 수신 (미디어 매칭 개선)
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

      // 내가 보낸 메시지라면 임시 메시지 삭제 (중복 방지)
      if (newMsgData.senderUserId === myId) {
        setTempMessages((prev) => {
          let targetIndex = -1;

          if (uiType === "TEXT") {
            // 텍스트는 내용으로 찾기
            targetIndex = prev.findIndex(
              (temp) => temp.type === "TEXT" && temp.text === newMsg.text,
            );
          } else {
            // 미디어(이미지/비디오/오디오)는 URL이 다를 수 있음 (blob vs s3)
            // 1차 시도: 정규화된 URL 비교
            const normalizedUrl = normalizeMediaUrl(newMsg.mediaUrl);
            if (normalizedUrl) {
              targetIndex = prev.findIndex(
                (temp) => normalizeMediaUrl(temp.mediaUrl) === normalizedUrl,
              );
            }

            // 2차 시도: 시간차 비교 (URL이 달라도 10초 내 같은 타입이면 인정)
            if (targetIndex === -1) {
              const newMsgTime = new Date(newMsg.sendAt).getTime();
              // 뒤에서부터(최신부터) 탐색
              for (let i = prev.length - 1; i >= 0; i -= 1) {
                const temp = prev[i];
                if (temp.type !== uiType) continue; // 타입 다르면 패스
                
                // temp.sendAt이 Date 객체일 수도, 문자열일 수도 있음
                const tempTime = new Date(temp.sendAt).getTime();
                
                // 10초(10000ms) 이내면 같은 메시지로 간주
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

    // 2. 메시지 읽음 처리
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

    // 🔥 3. [추가] 메시지 삭제 처리 (message.deleted)
    const handleMessageDelete = (response: any) => {
      const data = response.success?.data || response;
      const { messageId } = data;

      if (!messageId) return;

      console.log("🗑️ 상대방이 메시지 삭제함:", messageId);

      // 공통 삭제 함수
      const removeMessage = (list: IMessageItem[]) =>
        list.filter((msg) => msg.messageId !== messageId);

      // 3곳 모두에서 삭제 (어디에 있을지 모르니)
      setInitialMessages((prev) => removeMessage(prev));
      setSocketMessages((prev) => removeMessage(prev));
      setTempMessages((prev) => removeMessage(prev)); // 혹시 모르니
    };

    socket.on("message.new", handleMessageNew);
    socket.on("message.read", handleMessageRead);
    socket.on("message.deleted", handleMessageDelete); // 리스너 등록

    return () => {
      socket.off("message.new", handleMessageNew);
      socket.off("message.read", handleMessageRead);
      socket.off("message.deleted", handleMessageDelete);
    };
  }, [socket, myId, blockId, setInitialMessages]);

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