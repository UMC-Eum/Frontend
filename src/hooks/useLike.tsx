// hooks/useLike.ts
import { useState } from "react";
import { sendHeart, patchHeart } from "../api/socials/socialsApi"; // 경로를 실제 api 파일 위치로 수정해주세요
import { IHeartsRequest } from "../types/api/socials/socialsDTO"; // DTO 경로 수정

interface UseLikeProps {
  targetUserId: number;
  initialIsLiked?: boolean;
  initialHeartId?: number | null; // 이미 좋아요 상태라면 ID가 있어야 취소 가능
}

export const useLike = ({ 
  targetUserId, 
  initialIsLiked = false, 
  initialHeartId = null 
}: UseLikeProps) => {
  // 1. 화면 상태 (즉각 반응용)
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  
  // 2. 실제 서버 데이터 ID (좋아요 취소할 때 필요)
  const [heartId, setHeartId] = useState<number | null>(initialHeartId);

  const toggleLike = async () => {
    // A. 현재 상태 백업 (에러 발생 시 복구용)
    const prevIsLiked = isLiked;
    const prevHeartId = heartId;

    // B. 낙관적 업데이트: 서버 응답 기다리지 않고 UI부터 변경
    const newIsLiked = !prevIsLiked;
    setIsLiked(newIsLiked);

    try {
      if (newIsLiked) {
        // [CASE 1] 좋아요 보내기 (POST)
        // targetUserId가 유효할 때만 요청
        if (targetUserId) {
          const requestBody: IHeartsRequest = { targetUserId };
          const response = await sendHeart(requestBody);
          
          // 성공하면 생성된 heartId 저장 (나중에 취소할 때 쓰려고)
          setHeartId(response.heartId);
          console.log("✅ 마음 보내기 성공, ID:", response.heartId);
        }
      } else {
        // [CASE 2] 좋아요 취소/상태변경 (PATCH)
        // heartId가 있어야 수정 가능
        if (heartId) {
          await patchHeart(heartId);
          setHeartId(null); // ID 초기화
          console.log("✅ 마음 취소(수정) 성공");
        } else {
          // ID가 없는데 취소하려는 경우 (예외적 상황)
          console.warn("⚠️ 취소할 마음 ID가 없습니다.");
        }
      }
    } catch (error) {
      // C. 실패 시 롤백 (원래대로 되돌림)
      console.error("❌ 좋아요 처리 실패, 롤백합니다.", error);
      setIsLiked(prevIsLiked);
      setHeartId(prevHeartId);
      // 필요 시 여기에 토스트 메시지 추가 (예: alert('오류가 발생했습니다'))
    }
  };

  return { isLiked, toggleLike };
};