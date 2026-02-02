import { useState, useEffect } from "react";
// api 함수 경로에 맞게 수정해주세요
import { getSentHearts } from "../api/socials/socialsApi"; 

export const useHeartStatus = (targetUserId: number) => {
  const [isLiked, setIsLiked] = useState(false);
  const [heartId, setHeartId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ID가 없거나 유효하지 않으면 실행하지 않음
    if (!targetUserId) return;

    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        // 1. 보낸 마음 목록 조회 (충분한 사이즈로 조회)
        const response = await getSentHearts({ size: 100 }); 
        
        // 2. DTO 구조에 맞게 배열 추출 (response.content, response.items 등 확인 필요)
        const sentList = response?.items || response || [];

        // 3. 내 목록에서 현재 타겟 유저 찾기
        // 주의: 백엔드 필드명이 receiverId 인지 targetUserId 인지 꼭 확인하세요!
        const match = sentList.find((item: any) => item.targetUserId === targetUserId);

        if (match) {
          setIsLiked(true);
          setHeartId(match.heartId); // 혹은 match.id
        } else {
          setIsLiked(false);
          setHeartId(null);
        }
      } catch (error) {
        console.error(`Error fetching heart status for user ${targetUserId}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [targetUserId]);

  return { isLiked, heartId, isLoading };
};