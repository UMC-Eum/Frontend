import { Keyword, KEYWORDS } from "../components/keyword/keyword.model";

// 1. 사용할 데이터 타입 정의
export interface MockUser {
  id: number;
  name: string;
  age: number;
  imageUrl: string;
  distance: string;
  description: string;
  keywords: Keyword[]; // 실제 Keyword 타입 사용
}

const findKeyword = (label: string): Keyword => {
  const found = KEYWORDS.find((k) => k.label === label);
  if (!found) {
    console.warn(`[MockData] '${label}' 키워드를 찾을 수 없습니다.`);
    return KEYWORDS[0];
  }
  return found;
};

export const fetchAllMatchResults = async (): Promise<MockUser[]> => {
  // 실제 API 통신처럼 0.5초 딜레이
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: 1,
      name: "김민지",
      age: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
      distance: "3km",
      description: "주말에는 카페 탐방을 즐겨요! 조용한 분위기를 선호합니다.",
      keywords: [
        findKeyword("카페생활"),
        findKeyword("독서"),
        findKeyword("반려동물"),
      ],
    },
    {
      id: 2,
      name: "박준형",
      age: 29,
      imageUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=800&fit=crop",
      distance: "5km",
      description: "활동적인 데이트를 좋아해요. 같이 러닝하실 분?",
      keywords: [
        findKeyword("러닝"),
        findKeyword("드라이브"),
        findKeyword("유머사용"),
      ],
    },
    {
      id: 3,
      name: "이서연",
      age: 24,
      imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=800&fit=crop",
      distance: "1.2km",
      description: "영화 보는 걸 좋아해요. 넷플릭스 같이 봐요!",
      keywords: [
        findKeyword("영화감상"),
        findKeyword("집순이"),
        findKeyword("게임"),
      ],
    },
  ];
};
