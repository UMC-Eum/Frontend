// mockFetch.ts
import { MOCK_RESULTS } from "./mockResults";

export const fetchAllMatchResults = async () => {
  // 서버 지연 흉내 (0.5초)
  await new Promise((res) => setTimeout(res, 500));

  // 페이지 계산 없이 전체 데이터를 그대로 반환합니다.
  return MOCK_RESULTS;
};
