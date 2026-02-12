import Navbar from "../components/standard/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "../api/onboarding/onboardingApi";
import RecommendCard from "../components/card/presets/RecommendCard1";
// SmallButtonIdleCard는 레이아웃 깨짐 현상이 있어 제거하고 RecommendCard로 통일했습니다.
import saypinkbox from "../assets/saypinkbox.svg";
import bell from "../assets/Bell.svg";

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ["home", "recommendation"],
    queryFn: () => getRecommendations({ size: 20 }),
  });

  const user = useUserStore((state) => state.user);
  const userNickname = user?.nickname ?? "회원";
  const navigate = useNavigate();

  // 이상형 키워드가 있으면 등록된 것으로 간주
  const isProfileRegistered =
    user?.idealPersonalities && user.idealPersonalities.length > 0;

  const recommendationList = data?.items ?? [];

  const goProfile = (u: any) => {
    navigate(`/home/profile/${u.userId}`, { state: { profile: u } });
  };

  // ✅ 이미지 로드 실패 시 대체 이미지 보여주기 (엑박 방지)
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
    e.currentTarget.onerror = null; // 무한 루프 방지
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-[420px] h-screen bg-[#F8FAFB] flex flex-col overflow-hidden flex-1 relative">
        {/* 콘텐츠 영역 */}
        <main className="overflow-y-auto px-[20px] pb-[120px] no-scrollbar">
          <header className="flex h-[45px] items-center justify-between mb-[10px] font-bold">
            <div className="text-[24px]">
              환영합니다&nbsp;{""}
              <span className="text-[#F22459]">{userNickname}</span>
              님!
            </div>
            <button className="w-[24px] h-[24px] flex items-center justify-center">
              <img
                src={bell}
                onClick={() => navigate("/notifications")}
                className="w-full h-full cursor-pointer"
                alt="알림"
              />
            </button>
          </header>

          <div className="flex flex-col gap-[20px]">
            {isProfileRegistered ? (
              // ✅ CASE 1: 이상형 등록됨 (배너 없음 + 큰 카드 사용)
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
                      {recommendationList.map((user) => (
                        <div
                          key={user.userId}
                          className="snap-center shrink-0 w-full pr-[12px] last:pr-0"
                        >
                          {/* 🛠️ 수정: 깨지는 카드 대신 잘 나오는 RecommendCard 사용 */}
                          <RecommendCard
                            profileUrl={`/home/profile/${user.userId}`}
                            targetUserId={user.userId}
                            imageUrl={
                              user.profileImageUrl ||
                              "https://via.placeholder.com/400"
                            }
                            nickname={user.nickname}
                            age={user.age}
                            area={user.areaName || "지역 미설정"}
                            description={
                              user.introText || "자기소개가 없습니다."
                            }
                            keywords={user.keywords || []}
                            onGoProfile={() => goProfile(user)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              // ✅ CASE 2: 이상형 등록 안 됨 (배너 있음)
              <div className="flex flex-col gap-[20px]">
                <div className="relative">
                  <img
                    src={saypinkbox}
                    onClick={() => navigate("/matching")}
                    className="w-full cursor-pointer transition-transform active:scale-95"
                    alt="이상형 등록하러 가기"
                  />
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
                      {recommendationList.map((user) => (
                        <div
                          key={user.userId}
                          className="snap-center shrink-0 w-full pr-[12px] last:pr-0"
                        >
                          <RecommendCard
                            profileUrl={`/home/profile/${user.userId}`}
                            targetUserId={user.userId}
                            imageUrl={
                              user.profileImageUrl ||
                              "https://via.placeholder.com/400"
                            }
                            nickname={user.nickname}
                            age={user.age}
                            area={user.areaName || "지역 미설정"}
                            description={
                              user.introText || "자기소개가 없습니다."
                            }
                            keywords={user.keywords || []}
                            onGoProfile={() => goProfile(user)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* 하단 공통 섹션: 활동 중인 사람 */}
            <section className="flex flex-col gap-[10px]">
              <div className="flex flex-col mb-[6px]">
                <h3 className="text-[#202020] text-[20px] font-semibold">
                  현재 활동중인 사람들이에요!
                </h3>
                <p className="text-[#636970] text-[14px] font-medium">
                  편하게 소통해봐요!
                </p>
              </div>
              <div className="flex overflow-x-auto -mr-[20px] pr-[20px] pb-4 no-scrollbar">
                <div className="flex w-max gap-[9px]">
                  {recommendationList.map((p) => (
                    <div
                      key={p.userId}
                      className="flex flex-col gap-[8px] cursor-pointer"
                      onClick={() => goProfile(p)}
                    >
                      <div className="w-[84px] h-[84px] shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                        <img
                          className="w-full h-full object-cover"
                          src={
                            p.profileImageUrl ||
                            "https://via.placeholder.com/150"
                          }
                          alt={p.nickname}
                          onError={handleImageError} // 🔥 이미지 엑박 방지
                        />
                      </div>
                      <div className="flex gap-[2px] items-center">
                        <p className="text-[14px] font-semibold text-[#212529]">
                          {p.nickname}
                        </p>
                        <p className="text-[14px] font-semibold text-[#E5E5E5]">
                          ·
                        </p>
                        <p className="text-[14px] font-medium text-[#636970]">
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
