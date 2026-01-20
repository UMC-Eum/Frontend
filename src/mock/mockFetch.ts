// 1. 실제 Keyword 타입을 가져옵니다 (경로가 맞는지 확인해주세요)
import { Keyword } from "../components/keyword/keyword.model";
import { KEYWORDS } from "../components/keyword/keyword.model";
export interface MockUser {
  id: number;
  name: string;
  age: number;
  imageUrl: string;
  distance: string;
  area: string
  description: string;
  keywords: Keyword[];
}

export const fetchAllMatchResults = async (): Promise<MockUser[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: 1,
      name: "김민지",
      age: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
      area: "분당 인근",
      distance: "3km",
      description: "주말에는 카페 탐방을 즐겨요! 조용한 분위기를 선호합니다.",
      keywords: [KEYWORDS[101], KEYWORDS[102], KEYWORDS[103]],
    },
    {
      id: 2,
      name: "박준형",
      age: 29,
      imageUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=800&fit=crop",
      area: "의정부 인근",
      distance: "5km",
      description: "활동적인 데이트를 좋아해요. 같이 러닝하실 분?",
      keywords: [KEYWORDS[301], KEYWORDS[302], KEYWORDS[303]],
    },
    {
      id: 3,
      name: "이서연",
      age: 24,
      imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=800&fit=crop",
      area: "수원 인근",
      distance: "1.2km",
      description: "영화 보는 걸 좋아해요. 넷플릭스 같이 봐요!",
      keywords: [KEYWORDS[201], KEYWORDS[202], KEYWORDS[203]],
    },
  ];
};
