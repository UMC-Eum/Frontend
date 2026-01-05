// 1. 실제 Keyword 타입을 가져옵니다 (경로가 맞는지 확인해주세요)
import { Keyword } from "../components/keyword/keyword.model";

export interface MockUser {
  id: number;
  name: string;
  age: number;
  imageUrl: string;
  distance: string;
  description: string;
  // 2. 여기서 MockKeyword 대신 실제 Keyword[] 타입을 씁니다.
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
      distance: "3km",
      description: "주말에는 카페 탐방을 즐겨요! 조용한 분위기를 선호합니다.",
      // 3. 핵심 해결책: "이 배열은 Keyword[] 타입이 맞다"고 강제로 지정합니다.
      keywords: [
        { id: 101, label: "카페투어", category: "HOBBY" },
        { id: 102, label: "독서", category: "HOBBY" },
        { id: 103, label: "고양이", category: "ANIMAL" },
      ] as unknown as Keyword[],
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
        { id: 201, label: "러닝", category: "EXERCISE" },
        { id: 202, label: "맛집탐방", category: "HOBBY" },
        { id: 203, label: "유머", category: "PERSONALITY" },
      ] as unknown as Keyword[],
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
        { id: 301, label: "영화", category: "HOBBY" },
        { id: 302, label: "집순이", category: "PERSONALITY" },
        { id: 303, label: "게임", category: "HOBBY" },
      ] as unknown as Keyword[],
    },
  ];
};
