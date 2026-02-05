import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
import { useMemo, useState } from "react";
import MiniCard from "../components/card/presets/MiniCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getReceivedHearts, getSentHearts } from "../api/socials/socialsApi";
import * as DTO from "../types/api/socials/socialsDTO";

type CardUser = {
  id: number;
  name: string;
  age: number;
  imageUrl: string;
  location: string;
  distanceKm: number;
  heartId?: number;
};

type Tab = "sent" | "received";

type SentItem = DTO.IHeartsentResponse["items"][number];
type ReceivedItem = DTO.IHeartreceivedResponse["items"][number];

const PAGE_SIZE = 20;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop";

export default function Like() {
  const [tab, setTab] = useState<Tab>("sent");

  // 보낸 하트 목록
  const sentQuery = useInfiniteQuery({
    queryKey: ["hearts", "sent"],
    queryFn: ({ pageParam }) =>
      getSentHearts({
        cursor: (pageParam as string | null) ?? null,
        size: PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // 받은 하트 목록
  const receivedQuery = useInfiniteQuery({
    queryKey: ["hearts", "received"],
    queryFn: ({ pageParam }) =>
      getReceivedHearts({
        cursor: (pageParam as string | null) ?? null,
        size: PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const userMap = useMemo(() => new Map<number, CardUser>(), []);

  const sentItems: SentItem[] = useMemo(() => {
    const pages = sentQuery.data?.pages ?? [];
    return pages.flatMap((p) => p.items);
  }, [sentQuery.data]);

  const receivedItems: ReceivedItem[] = useMemo(() => {
    const pages = receivedQuery.data?.pages ?? [];
    return pages.flatMap((p) => p.items);
  }, [receivedQuery.data]);

  const sentCards: CardUser[] = useMemo(() => {
    return sentItems.map((h) => {
      const userId = h.targetUserId;
      const found = userMap.get(userId);

      return {
        id: userId,
        name: found?.name ?? `유저 ${userId}`,
        age: found?.age ?? 0,
        imageUrl: found?.imageUrl ?? FALLBACK_IMAGE,
        location: found?.location ?? "",
        distanceKm: found?.distanceKm ?? 0,
        heartId: h.heartId,
      };
    });
  }, [sentItems, userMap]);

  const receivedCards: CardUser[] = useMemo(() => {
    return receivedItems.map((h) => {
      const userId = h.fromUserId;
      const found = userMap.get(userId);

      return {
        id: userId,
        name: found?.name ?? `유저 ${userId}`,
        age: found?.age ?? 0,
        imageUrl: found?.imageUrl ?? FALLBACK_IMAGE,
        location: found?.location ?? "",
        distanceKm: found?.distanceKm ?? 0,
        heartId: undefined,
      };
    });
  }, [receivedItems, userMap]);

  const isLoading =
    tab === "sent" ? sentQuery.isLoading : receivedQuery.isLoading;
  const currentCards = tab === "sent" ? sentCards : receivedCards;

  return (
    <div className="h-screen flex flex-col">
      <BackButton title="마음" />

      {/* 탭 */}
      <div className="shrink-0 border-b border-[#DEE3E5] px-[20px] h-[45px] flex">
        <button
          type="button"
          onClick={() => setTab("sent")}
          className="relative flex-1 flex items-center justify-center text-[18px] font-medium"
        >
          내가 누른
          {tab === "sent" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-[120px] bg-[#FC3367] rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("received")}
          className="relative flex-1 flex items-center justify-center text-[18px] font-medium"
        >
          나를 마음한
          {tab === "received" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-[120px] bg-[#FC3367] rounded-full" />
          )}
        </button>
      </div>

      <main className="flex-1 overflow-y-auto pt-[26px] px-[20px] pb-[120px] no-scrollbar">
        {isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : currentCards.length === 0 ? (
          <p className="text-sm text-gray-500">목록이 비어 있어요.</p>
        ) : (
          <div className="grid grid-cols-2 gap-[20px]">
            {currentCards.map((item) => (
              <div key={item.id} className="h-[243px] mx-[5px] my-[10px]">
                <MiniCard
                  profileUrl={`/home/profile/${item.id}`}
                  targetUserId={item.id}
                  imageUrl={item.imageUrl}
                  name={item.name}
                  age={item.age}
                  area={item.location}
                  distance={`${item.distanceKm}km`}
                  initialIsLiked={tab === "sent"}
                  initialHeartId={
                    tab === "sent" ? (item.heartId ?? null) : null
                  }
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <div className="shrink-0">
        <Navbar />
      </div>
    </div>
  );
}
