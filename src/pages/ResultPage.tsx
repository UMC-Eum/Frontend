import { useEffect } from "react"; // useEffect 추가
import Navbar from "../components/standard/Navbar";
import BackButton from "../components/BackButton";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../api/onboarding/onboardingApi";
import IdleCard from "../components/card/presets/IdleCard";
import { useQuery } from "@tanstack/react-query";

const ResultPage = () => {
  const navigate = useNavigate();
  const nickname = useUserStore((state) => state.user?.nickname);
  const idealPersonalities = useUserStore(
    (state) => state.user?.idealPersonalities,
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["matchResults", "recommendation"],
    queryFn: () => getRecommendations({ size: 20 }),
    retry: 0,
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data?.items) {
      console.log("📡 백엔드 추천 데이터 로드 성공:", data.items);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      console.error("❌ 추천 데이터 로드 실패 (503 등):", error);
    }
  }, [isError, error]);

  if (isLoading) return <div className="p-5 text-center">로딩 중...</div>;

  if (isError)
    return (
      <div className="p-5 text-center">
        <p className="text-red-500">추천 목록을 가져오는 데 실패했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-md"
        >
          다시 시도
        </button>
      </div>
    );

  return (
    <div>
      <BackButton onClick={() => navigate("/")} />
      <div className="px-[20px] pb-[40px]">
        {/* 상단 헤더 섹션 */}
        <h1 className="mt-[28px] text-[24px] font-[700] leading-[140%] text-[#202020]">
          말씀해주신 내용을 바탕으로
          <br />
          이런 분들을 추천해드릴게요
        </h1>

        {/* 이상형 키워드 섹션 */}
        <div className="mt-[40px]">
          <h3 className="text-[18px] font-[500] text-[#707070]">
            {nickname || "guest"}님의 이상형은...
          </h3>
          <div className="mt-[12px] flex flex-wrap items-start gap-[10px]">
            {idealPersonalities && idealPersonalities.length > 0 ? (
              idealPersonalities.map((personality, index) => (
                <span
                  key={index}
                  className="inline-block h-[38px] bg-[#FFECF1] border border-[#FC3367] text-[#FC3367] px-[16px] py-[4px] rounded-[7px] text-[16px]"
                >
                  {personality}
                </span>
              ))
            ) : (
              <span className="text-gray-400">이상형 키워드가 없습니다.</span>
            )}
          </div>
        </div>

        {/* 추천 리스트 섹션 */}
        <div className="mt-[24px] space-y-[20px] pb-[80px]">
          {data?.items && data.items.length > 0 ? (
            data.items.map((user, userIndex) => (
              <IdleCard
                key={user.userId || userIndex}
                targetUserId={user.userId}
                initialIsLiked={user.isLiked || false}
                initialHeartId={null}
                profileUrl={`/home/profile/${user.userId}`}
                imageUrl={
                  user.profileImageUrl || "https://via.placeholder.com/400"
                }
                nickname={user.nickname}
                age={user.age}
                area={user.areaName || "지역 정보 없음"}
                description={user.introText || "자기소개가 없습니다."}
                keywords={user.keywords || []}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-10">
              추천된 사용자가 없습니다.
            </p>
          )}
        </div>

        {/* 하단 네비게이션 */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
          <Navbar />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
