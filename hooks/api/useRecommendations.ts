import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getRecommendations } from "@/api/onboarding/onboardingApi";
import { sendHeart } from "@/api/socials/socialsApi";
import { useAuthStore } from "@/stores/authStore";

import { queryKeys } from "./queryKeys";
import { useProtectedQueryEnabled } from "./useProtectedQueryEnabled";

const DEFAULT_RECOMMENDATION_SIZE = 10;

export function useRecommendationsInfiniteQuery(
  size = DEFAULT_RECOMMENDATION_SIZE,
  enabled = true,
) {
  const userId = useAuthStore((state) => state.user?.userId);
  const queryEnabled = useProtectedQueryEnabled(enabled && !!userId);

  return useInfiniteQuery({
    queryKey: queryKeys.recommendations.list(userId ?? 0, size),
    queryFn: ({ pageParam }) =>
      getRecommendations({
        cursor: pageParam ?? undefined,
        size,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: queryEnabled,
  });
}

export function useSendRecommendationHeartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: number) => sendHeart({ targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.socials.hearts.all() });
    },
  });
}
