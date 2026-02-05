import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import IdleCard from "../components/card/presets/IdleCard";
import { useUserStore } from "../stores/useUserStore";
import { getRecommendations } from "../api/onboarding/onboardingApi";

const ResultPage = () => {
  const nickname = useUserStore((state) => state.user?.nickname);
  const idealPersonalities = useUserStore(
    (state) => state.user?.idealPersonalities,
  );
  const { data, isLoading, isError } = useQuery({
    queryKey: ["matchResults"],
    queryFn: () => getRecommendations({ size: 20 }),
  });
  console.log("📡 백엔드 응답 데이터:", data?.items);

  if (isLoading) return <div className="p-5">로딩 중...</div>;
  if (isError) return <div className="p-5">에러가 발생했습니다.</div>;

  return (
    <div>
      <BackButton />
      <div className="px-[20px] pb-[40px]">
        <h1 className="mt-[28px] text-[24px] font-[700] leading-[140%] text-[#202020]">
          말씀해주신 내용을 바탕으로
          <br />
          이런 분들을 추천해드릴게요
        </h1>

        <div className="mt-[40px]">
          <h3 className="text-[18px] font-[500] text-[#707070]">
            {nickname || "guest"}님의 이상형은...
          </h3>

          <div className="mt-[12px] flex flex-wrap items-start gap-[10px]">
            {idealPersonalities && idealPersonalities.length > 0 ? (
              idealPersonalities.map((personality, index) => (
                <span
                  key={index}
                  className="inline-block h-[38px] bg-[#FFECF1] border border-[#FC3367] text-pink-700 px-[16px] py-[4px] rounded-[7px] text-[16px]"
                >
                  {personality}
                </span>
              ))
            ) : (
              <span className="text-gray-400">이상형 키워드가 없습니다. </span>
            )}
          </div>
        </div>

        <div className="mt-[24px] space-y-[20px]">
          {data &&
          data.items &&
          Array.isArray(data.items) &&
          data.items.length > 0 ? (
            data.items.map((user, userIndex) => (
              <IdleCard
                key={user.userId || userIndex}
                targetUserId={user.userId}
                initialIsLiked={false}
                initialHeartId={null}
                profileUrl={`/home/profile/${user.userId}`}
                imageUrl={
                  user.profileImageUrl || "https://via.placeholder.com/400"
                }
                name={user.nickname}
                age={user.age}
                distance={
                  user.matchScore
                    ? `${user.matchScore}% 매칭`
                    : "매칭 정보 없음"
                }
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

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
          <Navbar />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
