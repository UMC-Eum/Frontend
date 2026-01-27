import Navbar from "../components/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import pinkrectangle from "../assets/pink_rectangle.svg";
import { useUserStore } from "../stores/useUserStore";
import { useQuery } from "@tanstack/react-query";
import { fetchAllMatchResults, MockUser } from "../mock/mockFetch";
import RecommendCard from "../components/card/presets/RecommendCard1";
import SmallButtonIdleCard from "../components/card/presets/SmallButtonIdleCard";

export default function HomePage() {
  const { data } = useQuery<MockUser[]>({
    queryKey: ["matchResults"],
    queryFn: fetchAllMatchResults,
  });

  const user = useUserStore((state) => state.user);
  const userNickname = user?.nickname ?? "회원";
  const navigate = useNavigate();

  const isProfileRegistered = false;

  const goProfile = (u: MockUser) => {
    navigate(`/home/profile/${u.id}`, { state: { profile: u } });
  };

  const activePeople = data ?? [];

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-[420px] h-screen bg-[#F8FAFB] flex flex-col overflow-hidden flex-1 relative">
        {/* 콘텐츠 영역: 여기가 h-full의 기준이 됩니다 */}
        <main className="overflow-y-auto px-[20px] pb-[62px]">
          <header className="flex h-[45px] items-center text-[24px] mb-[10px] font-bold">
            환영합니다 {userNickname}님!
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
                      {userNickname}님이 말한 이상형으로 찾아봤어요!
                    </p>
                  </div>
                  <div className="rounded-2xl">
                    <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] no-scrollbar">
                      {data &&
                        data.map((user) => (
                          <div
                            key={user.id}
                            className="snap-center shrink-0 w-full pr-[12px] last:pr-0"
                            onClick={() => goProfile(user)}
                          >
                            <SmallButtonIdleCard
                              imageUrl={user.imageUrl}
                              name={user.name}
                              age={user.age}
                              distance={user.distance}
                              area={user.area}
                              description={user.description}
                              keywords={user.keywords}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
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
                      onClick={() => navigate("/matching")}
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

                  <div className="rounded-2xl">
                    <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] no-scrollbar">
                      {data &&
                        data.map((user) => (
                          <div
                            key={user.id}
                            className="snap-center shrink-0 w-full pr-[12px] last:pr-0"
                            onClick={() => goProfile(user)}
                          >
                            <RecommendCard
                              imageUrl={user.imageUrl}
                              name={user.name}
                              age={user.age}
                              distance={user.distance}
                              area={user.area}
                              description={user.description}
                              keywords={user.keywords}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
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
