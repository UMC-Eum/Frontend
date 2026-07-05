import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function useStableQueryClient() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 5 * 60_000,
            gcTime: 30 * 60_000,
          },
        },
      }),
  );

  return queryClient;
}
