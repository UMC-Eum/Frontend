export type HeartTab = "received" | "sent";

export type HeartProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  image: string;
  isLiked: boolean;
};

export const RECEIVED_HEART_COUNT = 8;

export const RECEIVED_HEARTS: HeartProfile[] = [
  {
    id: "received-1",
    name: "등산등산",
    age: 67,
    location: "서울시 광진구",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=85&w=600&auto=format&fit=crop",
    isLiked: false,
  },
  {
    id: "received-2",
    name: "김철수",
    age: 52,
    location: "서울시 마포구",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=85&w=600&auto=format&fit=crop",
    isLiked: true,
  },
  {
    id: "received-3",
    name: "이영희",
    age: 69,
    location: "서울시 종로구",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=85&w=600&auto=format&fit=crop",
    isLiked: false,
  },
  {
    id: "received-4",
    name: "박민수",
    age: 71,
    location: "서울시 강남구",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=85&w=600&auto=format&fit=crop",
    isLiked: false,
  },
  {
    id: "received-5",
    name: "최수진",
    age: 50,
    location: "광주광역시 남구",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=85&w=600&auto=format&fit=crop",
    isLiked: true,
  },
  {
    id: "received-6",
    name: "정하늘",
    age: 58,
    location: "인천광역시 연수구",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=85&w=600&auto=format&fit=crop",
    isLiked: false,
  },
];

export const SENT_HEARTS: HeartProfile[] = [
  {
    id: "sent-1",
    name: "등산등산",
    age: 67,
    location: "서울시 광진구",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=85&w=600&auto=format&fit=crop",
    isLiked: true,
  },
  {
    id: "sent-2",
    name: "김철수",
    age: 52,
    location: "서울시 마포구",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=85&w=600&auto=format&fit=crop",
    isLiked: true,
  },
  {
    id: "sent-3",
    name: "최수진",
    age: 50,
    location: "광주광역시 남구",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=85&w=600&auto=format&fit=crop",
    isLiked: true,
  },
  {
    id: "sent-4",
    name: "정하늘",
    age: 58,
    location: "인천광역시 연수구",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=85&w=600&auto=format&fit=crop",
    isLiked: true,
  },
  {
    id: "sent-5",
    name: "박민수",
    age: 71,
    location: "서울시 강남구",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=85&w=600&auto=format&fit=crop",
    isLiked: true,
  },
];
