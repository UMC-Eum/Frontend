import { create } from "zustand";

import type { ClubAuthority } from "@/types/api/club/clubDTO";

export type MockMyClub = {
  id: string;
  title: string;
  intro: string;
  category: string;
  area: string;
  image: string;
  authority: ClubAuthority;
  status?: string;
};

type MockClubState = {
  myClubs: MockMyClub[];
  addHostedClub: (club: Omit<MockMyClub, "id" | "authority" | "status">) => MockMyClub;
};

const FALLBACK_CLUB_IMAGE =
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=85&w=1200&auto=format&fit=crop";

const INITIAL_MY_CLUBS: MockMyClub[] = [
  {
    id: "club-1",
    title: "우리집 강아지 산책 동호회",
    intro: "퇴근 후 동네 산책길을 함께 걷는 모임이에요.",
    category: "취미 / 여가",
    area: "서울시 서대문구",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80&auto=format&fit=crop",
    authority: "HOST",
    status: "운영중",
  },
  {
    id: "club-2",
    title: "압백 등반 동호회",
    intro: "주말마다 가볍게 등산하고 산책하는 동호회입니다.",
    category: "운동 / 스포츠",
    area: "서울시 동작구",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80&auto=format&fit=crop",
    authority: "GENERAL",
  },
];

export const useMockClubStore = create<MockClubState>((set) => ({
  myClubs: INITIAL_MY_CLUBS,
  addHostedClub: (club) => {
    const nextClub: MockMyClub = {
      ...club,
      id: `mock-club-${Date.now()}`,
      image: club.image || FALLBACK_CLUB_IMAGE,
      authority: "HOST",
      status: "운영중",
    };

    set((state) => ({
      myClubs: [nextClub, ...state.myClubs],
    }));

    return nextClub;
  },
}));
