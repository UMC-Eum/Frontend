import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import Navbar from "../components/standard/Navbar";
import { useEffect, useMemo, useState } from "react";
import MiniCard from "../components/card/presets/MiniCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getReceivedHearts, getSentHearts } from "../api/socials/socialsApi";

type CardUser = {
  id: number;
  heartId: number;
  name: string;
  age: number;
  imageUrl: string;
  location: string;
  introText?: string;
  keywords?: string[];
  rawProfile?: any;
};

type Tab = "sent" | "received";
const PAGE_SIZE = 20;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop";


const calculateAge = (birthDateString: string): number => {
  if (!birthDateString) return 25;
  const birthYear = new Date(birthDateString).getFullYear();
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear + 1;
};

export default function Like() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("sent");

  const sentQuery = useInfiniteQuery({
    queryKey: ["hearts", "sent"],
    enabled: tab === "sent",
    queryFn: ({ pageParam }) =>
      getSentHearts({
        cursor: (pageParam as string | null) ?? null,
        size: PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const receivedQuery = useInfiniteQuery({
    queryKey: ["hearts", "received"],
    enabled: tab === "received",
    queryFn: ({ pageParam }) =>
      getReceivedHearts({
        cursor: (pageParam as string | null) ?? null,
        size: PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  useEffect(() => {
    if (tab === "sent") sentQuery.refetch();
    else receivedQuery.refetch();
  }, [tab]);

  const mapUserToCard = (
    u: any,
    heartId: number,
    targetUserId: number,
  ): CardUser => {
    const interestTags = (u.interests || [])
      .map((i: any) => i.interest?.body)
      .filter(Boolean);
    const personalityTags = (u.personalities || [])
      .map((p: any) => p.personality?.body)
      .filter(Boolean);

    return {
      id: targetUserId,
      heartId: heartId,
      name: u.nickname,
      age: calculateAge(u.birthdate),
      imageUrl: u.profileImageUrl || FALLBACK_IMAGE,
      location: u.address?.fullName || "지역 미설정",
      introText: u.introText || "",
      keywords: [...interestTags, ...personalityTags],
      rawProfile: u,
    };
  };

  const sentCards = useMemo(() => {
    const pages = sentQuery.data?.pages ?? [];
    return pages
      .flatMap((p) => p.items)
      .map((h) => mapUserToCard(h.targetUser, h.heartId, h.targetUserId));
  }, [sentQuery.data]);

  const receivedCards = useMemo(() => {
    const pages = receivedQuery.data?.pages ?? [];
    return pages
      .flatMap((p) => p.items)
      .map((h) => mapUserToCard(h.fromUser, h.heartId, h.fromUserId));
  }, [receivedQuery.data]);

  const currentCards = tab === "sent" ? sentCards : receivedCards;
  const isLoading =
    tab === "sent" ? sentQuery.isLoading : receivedQuery.isLoading;

  return (
    <div className="h-screen flex flex-col bg-white">
      <BackButton title="마음" />
      <div className="shrink-0 border-b border-[#DEE3E5] px-[20px] h-[48px] flex">
        <button
          onClick={() => setTab("sent")}
          className="relative flex-1 flex items-center justify-center text-[18px] font-medium"
        >
          내가 누른{" "}
          {tab === "sent" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-[120px] bg-[#FC3367] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setTab("received")}
          className="relative flex-1 flex items-center justify-center text-[18px] font-medium"
        >
          나를 마음한{" "}
          {tab === "received" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-[120px] bg-[#FC3367] rounded-full" />
          )}
        </button>
      </div>

      <main className="flex-1 overflow-y-auto pt-[26px] px-[20px] pb-[120px] no-scrollbar">
        {isLoading ? (
          <p className="text-sm text-gray-400 text-center mt-10">로딩 중...</p>
        ) : (
          <div className="grid grid-cols-2 gap-[20px]">
            {currentCards.map((item) => (
              <div
                key={`${item.id}-${item.heartId}`}
                className="h-[243px] mx-[5px] my-[10px] cursor-pointer"
                onClick={() => {
                  navigate(`/home/profile/${item.id}`, {
                    state: {
                      profile: {
                        ...item.rawProfile,
                        userId: item.id,
                        nickname: item.name,
                        age: item.age,
                        profileImageUrl: item.imageUrl,
                        areaName: item.location,
                        introText: item.introText,
                        keywords: item.keywords,
                        isLiked: tab === "sent",
                        heartId: item.heartId,
                      },
                    },
                  });
                }}
              >
                <MiniCard
                  profileUrl={`/home/profile/${item.id}`}
                  targetUserId={item.id}
                  imageUrl={item.imageUrl}
                  nickname={item.name}
                  age={item.age}
                  area={item.location}
                  initialIsLiked={tab === "sent"}
                  initialHeartId={tab === "sent" ? item.heartId : null}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <Navbar />
    </div>
  );
}
