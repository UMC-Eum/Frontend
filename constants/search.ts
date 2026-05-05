import { Club } from "@/types/search";

export const CLUBS: Club[] = [
  {
    id: "club-1",
    title: "새벽 등산 동호회",
    district: "서울시 서대문구",
    host: "루씨",
    description:
      "해 뜨기 전에 산에 올라 일출 보고 내려옵니다. 평일 새벽이라 부담 없이 운동 삼아 함께해요.",
    members: 6,
    date: "6/15",
    score: 98,
    createdAt: 5,
  },
  {
    id: "club-2",
    title: "5060 등산할 분",
    district: "서울시 서대문구",
    host: "민준",
    description: "부담 없이 같이 운동하실 분 구해요!",
    members: 6,
    date: "6/15",
    score: 86,
    createdAt: 4,
  },
  {
    id: "club-3",
    title: "동작구 등산러",
    district: "서울시 동작구",
    host: "예진",
    description: "근처 산들 등산합니다!",
    members: 6,
    date: "6/15",
    score: 73,
    createdAt: 3,
  },
  {
    id: "club-4",
    title: "한강 자전거 라이딩",
    district: "서울시 마포구",
    host: "민준",
    description: "주말 오전 한강 라이딩 모임입니다.",
    members: 8,
    date: "8/20",
    score: 72,
    createdAt: 2,
  },
  {
    id: "club-5",
    title: "도심 속 요가 모임",
    district: "서울시 중구",
    host: "예진",
    description: "퇴근 후 가볍게 스트레칭해요.",
    members: 12,
    date: "12/18",
    score: 65,
    createdAt: 1,
  },
];

export const RECENT_SEARCHES = ["뜨개질", "골프 모임", "등산 동호회"];
export const SUGGESTIONS = ["등산 동호회", "동작구 등산 모임", "등산 스팟"];
export const RECOMMENDED_CLUBS = CLUBS.filter((club) =>
  club.title.includes("등산"),
);
