import type { ClubCategory } from "@/types/api/club/clubDTO";

// 생성 폼 라벨 → 서버 enum
// ponytail: 취미·음식·기타는 대응 enum이 없어 OTHERS로 수렴 — 백엔드 enum 추가 시 분리
export const CLUB_CREATE_CATEGORIES: { label: string; value: ClubCategory }[] = [
  { label: "운동 / 스포츠", value: "SPORTS" },
  { label: "취미 / 여가", value: "OTHERS" },
  { label: "문화 / 예술", value: "CULTURE" },
  { label: "봉사활동", value: "VOLUNTEER" },
  { label: "음식 / 맛집", value: "OTHERS" },
  { label: "독서 / 공부", value: "LANGUAGE" },
  { label: "기타", value: "OTHERS" },
];

// 서버 enum → 표시 라벨 (표시 시 `?? category` 폴백 권장)
export const CLUB_CATEGORY_LABELS: Record<string, string> = {
  SPORTS: "운동 / 스포츠",
  LANGUAGE: "독서 / 공부",
  VOLUNTEER: "봉사활동",
  OUTDOOR: "아웃도어",
  CULTURE: "문화 / 예술",
  OTHERS: "기타",
};
