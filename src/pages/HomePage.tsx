import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import pinkrectangle from "../assets/pink_rectangle.svg";

type ActivePerson = {
  id: number;
  name: string;
  age: number;
  distanceKm: number;
  imageUrl: string;
};

export default function HomePage() {
  const isProfileRegistered = false;

  const activePeople: ActivePerson[] = [
    {
      id: 1,
      name: "김영철",
      age: 50,
      distanceKm: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 2,
      name: "김치천국",
      age: 73,
      distanceKm: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 3,
      name: "소통해요",
      age: 68,
      distanceKm: 6,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 4,
      name: "퇴근1",
      age: 54,
      distanceKm: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 5,
      name: "홍길동",
      age: 61,
      distanceKm: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 6,
      name: "김영철",
      age: 50,
      distanceKm: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 7,
      name: "김치천국",
      age: 73,
      distanceKm: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 8,
      name: "소통해요",
      age: 68,
      distanceKm: 6,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 9,
      name: "퇴근1",
      age: 54,
      distanceKm: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
    {
      id: 10,
      name: "홍길동",
      age: 61,
      distanceKm: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop",
    },
  ];
  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-[420px] h-screen bg-gray-100 flex flex-col overflow-hidden flex-1 relative">
        {/* 콘텐츠 영역: 여기가 h-full의 기준이 됩니다 */}
        <main className="overflow-y-auto px-[20px] pb-[62px]">
          <header className="flex h-[45px] items-center text-[24px] mb-[10px] font-bold">
            환영합니다 루씨님!
          </header>
          <div className="flex flex-col gap-[20px]">
            {isProfileRegistered ? (
              <div className="flex flex-col">
                <section className="flex flex-col gap-[10px]">
                  <div className="flex flex-col mb-[6px]">
                    <h2 className="text-[#202020] text-[20px] font-semibold">
                      오늘의 이상형 추천
                    </h2>
                    <p className="text-[#636970] text-[14px] font-medium">
                      루씨님이 말한 이상형으로 찾아봤어요!
                    </p>
                  </div>
                  <div className="bg-gray-400 h-[543px] rounded-2xl"></div>
                </section>
              </div>
            ) : (
              <div className="flex flex-col gap-[20px]">
                <div className="relative">
                  <img src={pinkrectangle} className="w-full" />
                  <div className="absolute inset-0 flex items-center justify-between px-[20px]">
                    <div>
                      <p className="text-[16px] font-medium">
                        지금 바로 이상형 등록하고
                      </p>
                      <p className="text-[16px] font-medium">
                        내 취향에 맞는 프로필을 보러가요!
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-white text-[13px] text-[#FC3367] font-semibold h-[26px] w-[79px]"
                    >
                      바로가기
                    </button>
                  </div>
                </div>
                <section className="flex flex-col gap-[10px]">
                  <div className="flex flex-col mb-[6px]">
                    <h2 className="text-[#202020] text-[20px] font-semibold">
                      오늘의 추천 프로필
                    </h2>
                    <p className="text-[#636970] text-[14px] font-medium">
                      나와 가까운 동네 사람들로 추천해 드려요
                    </p>
                  </div>
                  <div className="bg-gray-400 h-[453px] rounded-2xl"></div>
                </section>
              </div>
            )}

            <section className="flex flex-col gap-[10px]">
              <div className="flex flex-col mb-[6px]">
                <h3 className="text-[#202020] text-[20px] font-semibold">
                  현재 활동중인 사람들이에요!
                </h3>
                <p className="text-[#636970] text-[14px] font-medium">
                  편하게 소통해봐요!
                </p>
              </div>
              <div className="flex overflow-x-auto -mr-[20px] pr-[20px]">
                <div className="flex w-max gap-[9px]">
                  {activePeople.map((p) => (
                    <div key={p.id} className="flex flex-col gap-[8px]">
                      <div className="w-[84px] h-[84px] shrink-0">
                        <img
                          className="w-full h-full rounded-xl object-cover"
                          src={p.imageUrl}
                        />
                      </div>
                      <div className="flex gap-[2px]">
                        <p className="text-[14px] font-semibold">{p.name}</p>
                        <p className="text-[14px] font-semibold">·</p>
                        <p className="text-[14px] font-semibold text-[#636970]">
                          {p.age}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
        <Outlet />
        <Navbar />
      </div>
    </div>
  );
}
