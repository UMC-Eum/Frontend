export interface MockUser {
  id: number;
  name: string;
  age: number;
  imageUrl: string;
  distance: string;
  area: string
  description: string;
  keywords: string[];
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
      keywords: ["자기계발", "경험중시", "결과중심"],
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
      keywords: ["자기계발", "경험중시", "결과중심"],
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
      keywords: ["자기계발", "경험중시", "결과중심"],
    },
  ];
};
