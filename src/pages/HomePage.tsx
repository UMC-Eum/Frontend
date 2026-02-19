import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getRecommendations } from "../api/onboarding/onboardingApi";
import { getNotificationHearts } from "../api/notifications/notificationsApi";
import RecommendCard from "../components/card/presets/RecommendCard1";
import saypinkbox from "../assets/saypinkbox.svg";
import bell from "../assets/Bell.svg";
import norecommend from "../assets/norecommend.svg";
import Navbar from "../components/standard/Navbar";
import TutorialMain from "../components/tutorial/TutorialMain";
import { useMemo } from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop";

export default function HomePage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const userNickname = user?.nickname ?? "회원";

  // 1. 추천 목록 데이터 조회
  const { data: recommendData } = useQuery({
    queryKey: ["home", "recommendation"],
    queryFn: () => getRecommendations({ size: 20 }),
    retry: false,
    refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
  });

  // 2. 알림 데이터 조회 (NotificationsPage와 동일한 queryKey 사용)
  const { data: notificationData } = useInfiniteQuery({
    queryKey: ["notifications", "HEART"],
    queryFn: ({ pageParam }) =>
      getNotificationHearts({ cursor: pageParam, size: 20 }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 10,
    staleTime: 1000 * 60,
  });

  // 3. 안 읽은 알림이 하나라도 있는지 확인
  const hasUnread = useMemo(() => {
    return (
      notificationData?.pages.some((page) =>
        page.items.some((item) => !item.isRead),
      ) ?? false
    );
  }, [notificationData]);

  const isProfileRegistered =
    user?.idealPersonalities && user.idealPersonalities.length > 0;

  const recommendationList = recommendData?.items ?? [];

  const goProfile = (u: any) => {
    navigate(`/home/profile/${u.userId}`, { state: { profile: u } });
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = FALLBACK_IMAGE;
  };

  return (
    <div className="w-full h-[100dvh] bg-[#F8FAFB] flex flex-col overflow-hidden relative">
      <TutorialMain />

      <main className="flex-1 flex flex-col overflow-hidden px-[20px] pt-[10px]">
        <header className="shrink-0 flex h-[45px] items-center justify-between mb-[10px] font-bold">
          <div className="text-[24px]">
            환영합니다 <span className="text-[#F22459]">{userNickname}</span>님!
          </div>

          {/* 알림 아이콘 + N 뱃지 */}
          <button
            className="w-[24px] h-[24px] flex items-center justify-center relative"
            onClick={() => navigate("/notifications")}
          >
            <img
              src={bell}
              className="w-full h-full cursor-pointer"
              alt="알림"
            />
            {hasUnread && (
              <div className="absolute -top-1 -right-1 w-[15px] h-[15px] bg-[#F22459] rounded-full border border-white flex items-center justify-center">
                <span
                  className="text-white text-[9px] font-bold"
                  style={{ lineHeight: 1 }}
                >
                  N
                </span>
              </div>
            )}
          </button>
        </header>

        {!isProfileRegistered && (
          <div className="shrink-0 mb-[16px]">
            <img
              src={saypinkbox}
              onClick={() => navigate("/matching")}
              className="w-full cursor-pointer"
              alt="이상형 등록 배너"
            />
          </div>
        )}

        <section className="flex-1 flex flex-col min-h-0 mb-[16px]">
          <div className="shrink-0 flex flex-col mb-[10px]">
            <h2 className="text-[#202020] text-[20px] font-semibold">
              {isProfileRegistered
                ? "오늘의 이상형 추천"
                : "오늘의 추천 프로필"}
            </h2>
            {isProfileRegistered && (
              <p className="text-[#636970] text-[14px] font-medium">
                {userNickname}님이 말한 이상형으로 찾아봤어요!
              </p>
            )}
          </div>

          <div className="flex-1 min-h-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full items-center gap-[12px]">
            {recommendationList.length > 0 ? (
              recommendationList.map((user) => (
                <div
                  key={user.userId}
                  className="snap-center shrink-0 w-full h-full flex items-center justify-center"
                >
                  <div className="w-[85vw] max-w-[340px] h-full max-h-[480px]">
                    <RecommendCard
                      className="w-full h-full shadow-md"
                      profileUrl={`/home/profile/${user.userId}`}
                      targetUserId={user.userId}
                      imageUrl={user.profileImageUrl || FALLBACK_IMAGE}
                      nickname={user.nickname}
                      age={user.age}
                      area={user.areaName || "지역 미설정"}
                      description={user.introText || "자기소개가 없습니다."}
                      keywords={user.keywords || []}
                      onGoProfile={() => goProfile(user)}
                      initialHeartId={user.likedHeartId}
                      initialIsLiked={user.isLiked}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="snap-center shrink-0 w-full h-full flex items-center justify-center">
                <div className="w-[85vw] max-w-[340px] h-full max-h-[480px] rounded-2xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
                  <img
                    src={norecommend}
                    alt="추천 없음"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="shrink-0 flex flex-col pb-[80px]">
          <div className="flex flex-col mb-[6px]">
            <h3 className="text-[#202020] text-[18px] font-semibold">
              현재 활동중인 사람들이에요!
            </h3>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-[12px]">
            {recommendationList.map((p) => (
              <div
                key={p.userId}
                className="flex flex-col gap-[8px] cursor-pointer shrink-0"
                onClick={() => goProfile(p)}
              >
                <div className="w-[64px] h-[64px] rounded-full overflow-hidden border border-gray-100 bg-gray-100">
                  <img
                    className="w-full h-full object-cover"
                    src={p.profileImageUrl || FALLBACK_IMAGE}
                    alt={p.nickname}
                    onError={handleImageError}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-[12px] font-semibold text-[#212529]">
                    {p.nickname}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Navbar />
    </div>
  );
}
