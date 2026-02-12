// hooks/useLike.ts
import { useState } from "react";
import { sendHeart, patchHeart } from "../api/socials/socialsApi"; 

interface UseLikeProps {
  targetUserId: number;
  initialIsLiked?: boolean; 
  initialHeartId?: number | null; 
}

export const useLike = ({ 
  targetUserId, 
  initialIsLiked = false, 
  initialHeartId = null 
}: UseLikeProps) => {
  // 1. 화면 상태 
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  
  // 2. 실제 서버 데이터 ID 
  const [heartId, setHeartId] = useState<number | null>(initialHeartId);

  const toggleLike = async () => {
  const prevIsLiked = isLiked;
  const prevHeartId = heartId;

  // 낙관적 업데이트 (UI 먼저 변경)
  const newIsLiked = !prevIsLiked;
  setIsLiked(newIsLiked);

  try {
    if (newIsLiked) {
      // ✅ [CASE 1] 좋아요 켜기 (여기가 핵심!)
      
      if (heartId) {
        // 1-1. ID가 있으면 일단 살려보기(PATCH) 시도
        try {
          await patchHeart(heartId);
          console.log("✅ 마음 되살리기 성공 (PATCH)");
        } catch (patchError: any) {
          // 🚨 실패! 에러 코드를 확인합니다.
          const errorCode = patchError.response?.data?.error?.code;

          // "기록을 찾을 수 없음(SOCIAL-005)"이라면 -> ID가 죽은 것임 -> 새로 생성(POST) 시도
          if (errorCode === "SOCIAL-005") {
            console.log("⚠️ 죽은 ID입니다. 새로 생성을 시도합니다. (Fallback to POST)");
            
            // 바로 POST 요청 전송
            const response = await sendHeart({ targetUserId });
            setHeartId(response.heartId); // 새로운 ID로 교체
          } else {
            // 다른 에러(DB 오류 등)면 진짜 에러니까 던짐
            throw patchError;
          }
        }
      } else {
        // 1-2. ID가 아예 없으면 그냥 새로 생성(POST)
        const response = await sendHeart({ targetUserId });
        setHeartId(response.heartId);
      }

    } else {
      // [CASE 2] 좋아요 끄기
      if (heartId) {
        try {
           await patchHeart(heartId);
           // 끄기 성공 시에는 ID 유지 (혹시 되살릴 수 있으니까)
        } catch {
           // 끄려고 했는데 "이미 없다(SOCIAL-005)"고 하면? 
           // 어차피 꺼진 거니 무시해도 됨. (혹은 setHeartId(null) 처리)
           console.warn("이미 삭제된 마음입니다.");
        }
      }
    }
  } catch (error) {
    // 최종 실패 시 롤백
    console.error("❌ 좋아요 처리 완전 실패, 롤백합니다.", error);
    setIsLiked(prevIsLiked);
    setHeartId(prevHeartId);
  }
};

  // ✅ [수정 핵심] setIsLiked와 setHeartId를 밖으로 내보내야 
  // IdleCard의 useEffect에서 값을 수정할 수 있습니다.
  return { 
    isLiked, 
    toggleLike, 
    setIsLiked, // 👈 추가됨
    setHeartId  // 👈 추가됨
  };
};