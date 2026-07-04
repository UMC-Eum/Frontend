import type { ClubCategory } from "@/types/api/club/clubDTO";

// 생성 폼 라벨 → 서버 enum
export const CLUB_CREATE_CATEGORIES: { label: string; value: ClubCategory }[] = [
  { label: "운동 / 스포츠", value: "SPORTS" },
  { label: "취미 / 여가", value: "HOBBY" },
  { label: "문화/예술", value: "CULTURE_ART" },
  { label: "봉사활동", value: "VOLUNTEER" },
  { label: "음식 / 맛집", value: "FOOD" },
  { label: "독서 / 공부", value: "STUDY" },
  { label: "기타", value: "OTHERS" },
];

// 서버 enum → 표시 라벨 (표시 시 `?? category` 폴백 권장)
export const CLUB_CATEGORY_LABELS: Record<string, string> = {
  SPORTS: "운동 / 스포츠",
  HOBBY: "취미 / 여가",
  CULTURE_ART: "문화/예술",
  VOLUNTEER: "봉사활동",
  FOOD: "음식 / 맛집",
  STUDY: "독서 / 공부",
  OTHERS: "기타",
};
