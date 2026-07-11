import { QueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useEffect } from "react";

import { getChatRooms } from "@/api/chats/chatsApi";
import {
  getClubDetail,
  getMyClubs,
  getRecommendedClubs,
  getTodayRecommendedClubs,
} from "@/api/club/clubApi";
import {
  getNotificationClubs,
  getNotificationHearts,
} from "@/api/notifications/notificationsApi";
import { getRecommendations } from "@/api/onboarding/onboardingApi";
import { getReceivedHearts, getSentHearts } from "@/api/socials/socialsApi";
import { getActiveUsers, getMyProfile, getMyProfileVisitors } from "@/api/users/usersApi";
import { queryKeys } from "@/hooks/api/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import { useClubLocationStore } from "@/stores/clubLocationStore";

// 응답 JSON을 훑어 이미지로 보이는 URL을 모은다.
// (키 이름에 image/photo/... 가 들어가거나, 값이 이미지 확장자로 끝나는 http URL)
const IMAGE_KEY_RE = /image|photo|thumbnail|avatar|profile/i;
const IMAGE_URL_RE = /\.(jpe?g|png|webp|gif|heic)(\?|#|$)/i;

function collectImageUrls(value: unknown, out: Set<string>, key = "") {
  if (typeof value === "string") {
    if (
      value.startsWith("http") &&
      (IMAGE_KEY_RE.test(key) || IMAGE_URL_RE.test(value))
    ) {
      out.add(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectImageUrls(item, out, key);
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collectImageUrls(v, out, k);
  }
}

const MAX_PREFETCH_IMAGES = 100;
const MAX_PREFETCH_CLUB_DETAILS = 8;

// 로그인 완료 시점에 모든 탭(홈·마음·채팅·마이)과 알림 화면의 첫 화면 데이터를
// 화면과 동일한 queryKey로 미리 채우고, 응답에 포함된 이미지 URL을 디스크 캐시에 내려받는다.
// staleTime(1시간) 동안은 화면 진입 시 재요청 없이 즉시 렌더링된다.
export function usePrefetchAppData(queryClient: QueryClient) {
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const ready = isAuthInitialized && isAuthenticated;

  useEffect(() => {
    if (!ready) return;

    const prefetchInfinite = <TPage,>(
      queryKey: readonly unknown[],
      queryFn: (cursor: string | null) => Promise<TPage>,
    ) =>
      queryClient.prefetchInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam }) => queryFn(pageParam as string | null),
        initialPageParam: null as string | null,
      });

    const run = async () => {
      // 내 동호회·오늘의 추천 동호회는 상세까지 미리 받아 상세 진입도 즉시 뜨게 한다
      const clubDetailIds = new Set<number>();
      const tasks: Promise<unknown>[] = [
        // 홈
        prefetchInfinite(queryKeys.recommendations.list(10), (cursor) =>
          getRecommendations({ cursor: cursor ?? undefined, size: 10 }),
        ),
        queryClient.prefetchQuery({
          queryKey: queryKeys.users.visitors({ size: 12 }),
          queryFn: () => getMyProfileVisitors({ size: 12 }),
        }),
        queryClient
          .fetchQuery({
            queryKey: queryKeys.club.todayRecommended(10),
            queryFn: () => getTodayRecommendedClubs({ limit: 10 }),
          })
          .then((data) =>
            // 오늘의 추천 DTO만 clubId가 string이라 숫자로 맞춘다
            data.items.forEach((club) => clubDetailIds.add(Number(club.clubId))),
          )
          .catch(() => {}),
        queryClient
          .fetchQuery({ queryKey: queryKeys.club.my(), queryFn: getMyClubs })
          .then((data) => data.items.forEach((club) => clubDetailIds.add(club.clubId)))
          .catch(() => {}),
        // 알림 화면 + 홈 상단 알림 dot
        prefetchInfinite(queryKeys.notifications.list("heart", 20), (cursor) =>
          getNotificationHearts({ cursor, size: 20 }),
        ),
        prefetchInfinite(queryKeys.notifications.list("club", 20), (cursor) =>
          getNotificationClubs({ cursor, size: 20 }),
        ),
        // 마음 탭
        prefetchInfinite(queryKeys.socials.hearts.received(20), (cursor) =>
          getReceivedHearts({ cursor, size: 20 }),
        ),
        prefetchInfinite(queryKeys.socials.hearts.sent(20), (cursor) =>
          getSentHearts({ cursor, size: 20 }),
        ),
        // 채팅 탭
        prefetchInfinite(queryKeys.chats.rooms(30), (cursor) =>
          getChatRooms({ cursor, size: 30 }),
        ),
        prefetchInfinite(queryKeys.users.active({ size: 20 }), (cursor) =>
          getActiveUsers({ cursor, size: 20 }),
        ),
      ];

      // 홈 동호회 탭 추천은 지역 코드(프로필 지역 fallback)에 따라 키가 달라진다
      tasks.push(
        queryClient
          .fetchQuery({ queryKey: queryKeys.users.me(), queryFn: getMyProfile })
          .then((profile) => {
            const areaCode =
              useClubLocationStore.getState().areaCode ||
              profile?.area?.code ||
              undefined;
            const params = { ...(areaCode ? { areaCode } : {}), size: 10 };
            return queryClient.prefetchQuery({
              queryKey: queryKeys.club.recommended(params),
              queryFn: () => getRecommendedClubs(params),
            });
          }),
      );

      await Promise.allSettled(tasks);

      await Promise.allSettled(
        [...clubDetailIds].slice(0, MAX_PREFETCH_CLUB_DETAILS).map((clubId) =>
          queryClient.prefetchQuery({
            queryKey: queryKeys.club.detail(clubId),
            queryFn: () => getClubDetail(clubId),
          }),
        ),
      );

      // 캐시에 쌓인 응답 전체에서 이미지 URL을 긁어 디스크에 미리 내려받는다
      const urls = new Set<string>();
      for (const query of queryClient.getQueryCache().getAll()) {
        collectImageUrls(query.state.data, urls);
      }
      if (urls.size > 0) {
        void Image.prefetch([...urls].slice(0, MAX_PREFETCH_IMAGES));
      }
    };

    void run();
  }, [ready, queryClient]);
}
