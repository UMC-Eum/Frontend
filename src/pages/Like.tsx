import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
import { useMemo, useState } from "react";
import MiniCard from "../components/card/presets/MiniCard";

type LikeCard = {
  id: number;
  name: string;
  age: number;
  location: string;
  distanceKm: number;
  imageUrl: string;
};

const TABS = [
  { key: "pressed", label: "내가 마음한" },
  { key: "got", label: "나를 마음한" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Like() {
  const [activeTab, setActiveTab] = useState<TabKey>("pressed");

  const pressedList: LikeCard[] = [
    {
      id: 1,
      name: "김영철",
      age: 50,
      location: "죽전동",
      distanceKm: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 2,
      name: "김치천국",
      age: 73,
      location: "죽전동",
      distanceKm: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 3,
      name: "소통해요",
      age: 68,
      location: "죽전동",
      distanceKm: 6,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 4,
      name: "퇴근1",
      age: 54,
      location: "죽전동",
      distanceKm: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 5,
      name: "홍길동",
      age: 61,
      location: "죽전동",
      distanceKm: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 6,
      name: "김영철",
      age: 50,
      location: "죽전동",
      distanceKm: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
  ];

  const gotList: LikeCard[] = [
    {
      id: 7,
      name: "김치천국",
      age: 73,
      location: "죽전동",
      distanceKm: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 8,
      name: "소통해요",
      age: 68,
      location: "죽전동",
      distanceKm: 6,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 9,
      name: "퇴근1",
      age: 54,
      location: "죽전동",
      distanceKm: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 10,
      name: "홍길동",
      age: 61,
      location: "죽전동",
      distanceKm: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
  ];

  const list = useMemo(
    () => (activeTab === "pressed" ? pressedList : gotList),
    [activeTab],
  );

  return (
    <div className="h-screen flex flex-col">
      <BackButton title="마음" />
      <div className=" flex border-b border-[#DEE3E5] px-[20px]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex w-full h-[45px] justify-center items-center"
            >
              <div className="inline-flex flex-col items-center">
                <span
                  className={`text-[18px] font-semibold ${
                    isActive ? "text-black" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>

                {isActive && (
                  <span className="absolute bottom-0 h-[3px] w-[120px] bg-[#FC3367] rounded-full" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      <main className="flex-1 overflow-y-auto pt-[26px] px-[20px] pb-[120px] no-scrollbar">
        <div className="grid grid-cols-2 gap-[20px]">
          {list.map((item) => (
            <div key={item.id} className="h-[243px]">
              <MiniCard
                key={item.id}
                imageUrl={item.imageUrl}
                name={item.name}
                age={item.age}
                area={item.location}
                distance={`${item.distanceKm}km`}
              />
            </div>
          ))}
        </div>
      </main>
      <div className="shrink-0">
        <Navbar />
      </div>
    </div>
  );
}
