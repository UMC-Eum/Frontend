// mockFetch.ts
import { MOCK_RESULTS } from "./mockResults";

const PAGE_SIZE = 10;

export const fetchMatchResults = async ({
  pageParam = 0,
}: {
  pageParam?: number;
}) => {
  // 서버 지연 흉내
  await new Promise((res) => setTimeout(res, 500));

  const start = pageParam * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const items = MOCK_RESULTS.slice(start, end);

  return {
    items,
    nextPage: items.length === PAGE_SIZE ? pageParam + 1 : undefined,
  };
};
