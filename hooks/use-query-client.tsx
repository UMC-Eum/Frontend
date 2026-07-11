import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function useStableQueryClient() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            // 한 번 받은 데이터는 1시간 동안 그대로 보여준다(인스타그램식 초기 로딩).
            // 강제 최신화는 pull-to-refresh(refetch)·탭 전환(invalidateQueries)·뮤테이션이
            // staleTime과 무관하게 동작하므로 기존 새로고침 로직은 그대로 유지된다.
            staleTime: 60 * 60_000,
            gcTime: 90 * 60_000,
          },
        },
      }),
  );

  return queryClient;
}
