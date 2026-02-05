// src/hooks/chat/useChatRoomInfo.ts
import { useState, useEffect } from "react";
import { getChatRoomDetail } from "../../api/chats/chatsApi";
import { blockUser, getBlocks, patchBlock, createReport } from "../../api/socials/socialsApi";

export function useChatRoomInfo(roomId: number | undefined) {
  const [peerInfo, setPeerInfo] = useState<{ userId: number; nickname: string; age: number; areaName: string; profileImageUrl: string } | null>(null);
  const [blockId, setBlockId] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 방 정보 및 차단 상태 초기 로드
  useEffect(() => {
    if (!roomId) return;
    const fetchInfo = async () => {
      try {
        const roomDetail = await getChatRoomDetail(roomId);
        if (roomDetail) {
          setPeerInfo({
            userId: roomDetail.peer.userId,
            nickname: roomDetail.peer.nickname,
            age: roomDetail.peer.age,
            areaName: roomDetail.peer.areaName,
            profileImageUrl: "https://via.placeholder.com/52" // TODO: 실제 이미지로 교체
          });

          // 차단 여부 확인
          try {
            const blockRes = await getBlocks({ size: 100 });
            const targetBlock = blockRes.items.find(item => item.targetUserId === roomDetail.peer.userId);
            if (targetBlock) setBlockId(targetBlock.blockId);
          } catch (e) { console.error("차단 조회 실패", e); }
        }
      } catch (error) { console.error("방 정보 로드 실패", error); }
    };
    fetchInfo();
  }, [roomId]);

  // 차단 토글
  const handleBlockToggle = async () => {
    if (!peerInfo) return;
    
      if (blockId) {
        await patchBlock(blockId);
        setBlockId(null);
        alert("차단이 해제되었습니다.");
      } else {
        const res = await blockUser({ targetUserId: peerInfo.userId, reason: "채팅방 차단" });
        setBlockId(res.blockId);
        alert("차단되었습니다.");
      }
    
  };

  // 신고
  const handleReport = async () => {
    if (!peerInfo || !roomId) return;
    const description = prompt("신고 사유를 입력해주세요.");
    if (!description) return;
    try {
      await createReport({ targetUserId: peerInfo.userId, category: "HARASSMENT", reason: description, chatRoomId: roomId });
      alert("신고되었습니다.");
    } catch (error) { console.error("신고 실패", error); alert("실패했습니다."); }
  };

  return { peerInfo, blockId, isMenuOpen, setIsMenuOpen, handleBlockToggle, handleReport };
}