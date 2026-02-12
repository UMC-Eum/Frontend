import { useState, useEffect } from "react";
import { getSentHearts } from "../api/socials/socialsApi";

export const useHeartStatus = (targetUserId: number) => {
  const [isLiked, setIsLiked] = useState(false);
  const [heartId, setHeartId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!targetUserId) return;

    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        const response = await getSentHearts({ size: 100 });

        const sentList = response?.items || response || [];

        const match = sentList.find(
          (item: any) => item.targetUserId === targetUserId,
        );

        if (match) {
          setIsLiked(true);
          setHeartId(match.heartId);
        } else {
          setIsLiked(false);
          setHeartId(null);
        }
      } catch (error) {
        console.error(
          `Error fetching heart status for user ${targetUserId}:`,
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [targetUserId]);

  return { isLiked, heartId, isLoading };
};
