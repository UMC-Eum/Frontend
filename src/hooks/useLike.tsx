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
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [heartId, setHeartId] = useState<number | null>(initialHeartId);

  const refreshQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["hearts"] });
    queryClient.invalidateQueries({ queryKey: ["home", "recommendation"] });
    queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] });
  };

  const toggleLike = async () => {
    const prevIsLiked = isLiked;
    const prevHeartId = heartId;

    const newIsLiked = !prevIsLiked;
    setIsLiked(newIsLiked);

    try {
      if (newIsLiked) {
        if (heartId) {
          try {
            await patchHeart(heartId);
            console.log("✅ 마음 되살리기 성공 (PATCH)");
            refreshQueries();
          } catch (patchError: any) {
            const errorCode = patchError.response?.data?.error?.code;

            if (errorCode === "SOCIAL-005") {
              console.log("죽은 ID입니다. 새로 생성을 시도합니다.");
              const response = await sendHeart({ targetUserId });
              setHeartId(response.heartId);
              refreshQueries();
            } else {
              throw patchError;
            }
          }
        } else {
          const response = await sendHeart({ targetUserId });
          setHeartId(response.heartId);
          refreshQueries();
        }
      } else {
        if (heartId) {
          try {
            await patchHeart(heartId);
            refreshQueries();
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