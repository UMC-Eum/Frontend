import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query"; // 1. 이거 추가
import { sendHeart, patchHeart } from "../api/socials/socialsApi";

interface UseLikeProps {
  targetUserId: number;
  initialIsLiked?: boolean;
  initialHeartId?: number | null;
}

export const useLike = ({
  targetUserId,
  initialIsLiked = false,
  initialHeartId = null,
}: UseLikeProps) => {
  const queryClient = useQueryClient(); // 2. 쿼리 클라이언트 가져오기
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [heartId, setHeartId] = useState<number | null>(initialHeartId);

  // 성공했을 때 실행할 데이터 갱신 함수 (재사용을 위해 분리)
  const refreshQueries = () => {
    // "이 이름표(Key)를 가진 데이터들은 다 낡았으니, 다음에 볼 때 새로 받아와!" 라고 명령
    queryClient.invalidateQueries({ queryKey: ["hearts"] }); // 보낸/받은 마음함 갱신
    queryClient.invalidateQueries({ queryKey: ["home", "recommendation"] }); // 홈 추천 리스트 갱신
    // 만약 상세 프로필도 갱신해야 한다면:
    // queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] }); 
  };

  const toggleLike = async () => {
    const prevIsLiked = isLiked;
    const prevHeartId = heartId;

    const newIsLiked = !prevIsLiked;
    setIsLiked(newIsLiked);

    try {
      if (newIsLiked) {
        // [하트 보내기 로직]
        if (heartId) {
          try {
            await patchHeart(heartId);
            console.log("✅ 마음 되살리기 성공 (PATCH)");
            refreshQueries(); // 3. 성공 시 갱신 요청
          } catch (patchError: any) {
            const errorCode = patchError.response?.data?.error?.code;

            if (errorCode === "SOCIAL-005") {
              console.log("죽은 ID입니다. 새로 생성을 시도합니다.");
              const response = await sendHeart({ targetUserId });
              setHeartId(response.heartId);
              refreshQueries(); // 3. 성공 시 갱신 요청
            } else {
              throw patchError;
            }
          }
        } else {
          const response = await sendHeart({ targetUserId });
          setHeartId(response.heartId);
          refreshQueries(); // 3. 성공 시 갱신 요청
        }
      } else {
        // [하트 취소 로직]
        if (heartId) {
          try {
            await patchHeart(heartId);
            refreshQueries(); // 3. 성공 시 갱신 요청 (취소 후에도 목록 갱신 필요)
          } catch {
            console.warn("이미 삭제된 마음입니다.");
          }
        }
      }
    } catch (error) {
      console.error("좋아요 처리 완전 실패, 롤백합니다.", error);
      setIsLiked(prevIsLiked);
      setHeartId(prevHeartId);
    }
  };

  return {
    isLiked,
    toggleLike,
    setIsLiked,
    setHeartId,
  };
};