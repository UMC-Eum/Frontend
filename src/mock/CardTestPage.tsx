import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRecommendations } from "../api/onboarding/onboardingApi";
import { IItemRecommendation } from "../types/api/onboarding/onboardingDTO";
import IdleCard from "../components/card/presets/IdleCard";
import MiniCard from "../components/card/presets/MiniCard";
import RecommendCard from "../components/card/presets/RecommendCard1";
import RecommendCard2 from "../components/card/presets/RecommendCard2";
import SmallButtonIdleCard from "../components/card/presets/SmallButtonIdleCard";
const MOCK_ITEMS: IItemRecommendation[] = Array.from({ length: 10 }).map(
  (_, i) => {
    const isLiked = i % 2 === 0;
    return {
      userId: i + 1,
      nickname: `더미유저${i + 1}`,
      age: 20 + i,
      areaName: "서울 강남구",
      keywords: ["운동", "맛집", "코딩"],
      introText: `안녕하세요! ${i + 1}번 유저입니다. 거리는 이제 안 나옵니다.`,
      introAudioUrl: "",
      profileImageUrl: `https://picsum.photos/400/600?random=${i + 1}`,
      matchScore: 85 + i,
      matchReasons: [],

      isLiked: isLiked,
      matchId: isLiked ? 9999 + i : null,
    } as unknown as IItemRecommendation;
  },
);

export default function RecommendTestPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<IItemRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await getRecommendations({});

        let data: IItemRecommendation[] = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (response?.items) {
          data = response.items;
        } else if (response?.success?.data?.items) {
          data = response.success.data.items;
        }

        if (!data || data.length === 0) {
          setItems(MOCK_ITEMS);
        } else {
          setItems(data);
        }
      } catch (error) {
        console.error("API 에러 -> 더미 데이터 사용:", error);
        setItems(MOCK_ITEMS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        데이터 로딩 중...
      </div>
    );

  const getItem = (idx: number) => items[idx % items.length];

  return (
    <div className="min-h-screen bg-gray-100 p-8 pb-40">
      <h1 className="text-3xl font-bold mb-10 text-center text-gray-800">
        카드 컴포넌트 통합 테스트
        <span className="block text-sm font-normal text-gray-500 mt-2">
          (거리 삭제됨 / 하트 ID 미구현 대응)
        </span>
      </h1>

      <div className="max-w-[1000px] mx-auto space-y-16">
        <section>
          <h2 className="text-xl font-bold mb-4 border-b pb-2 px-2 text-blue-600">
            1. IdleCard
          </h2>
          <div className="flex justify-center">
            <div className="w-[335px] h-[500px] relative shadow-2xl rounded-[20px] overflow-hidden">
              <IdleCard
                targetUserId={getItem(0).userId}
                initialIsLiked={getItem(0).isLiked}
                initialHeartId={null}
                profileUrl={`/profile/${getItem(0).userId}`}
                imageUrl={getItem(0).profileImageUrl}
                nickname={getItem(0).nickname}
                age={getItem(0).age}
                area={getItem(0).areaName}
                description={getItem(0).introText}
                keywords={getItem(0).keywords}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 border-b pb-2 px-2 text-blue-600">
            2. MiniCard
          </h2>
          <div className="flex gap-4 overflow-x-auto p-4 bg-white rounded-xl shadow-inner">
            {[1, 2, 3].map((offset) => {
              const item = getItem(offset);
              return (
                <div
                  key={`mini-${item.userId}`}
                  className="shrink-0 shadow-lg rounded-[20px] overflow-hidden"
                >
                  <MiniCard
                    targetUserId={item.userId}
                    initialIsLiked={item.isLiked}
                    initialHeartId={null}
                    profileUrl={`/profile/${item.userId}`}
                    imageUrl={item.profileImageUrl}
                    nickname={item.nickname}
                    age={item.age}
                    area={item.areaName}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 border-b pb-2 px-2 text-blue-600">
            3. RecommendCard
          </h2>
          <div className="flex justify-center">
            <div className="w-[335px] h-[500px] relative shadow-2xl rounded-[20px] overflow-hidden">
              <RecommendCard
                targetUserId={getItem(4).userId}
                profileUrl={`/profile/${getItem(4).userId}`}
                imageUrl={getItem(4).profileImageUrl}
                nickname={getItem(4).nickname}
                age={getItem(4).age}
                area={getItem(4).areaName}
                description={getItem(4).introText}
                keywords={getItem(4).keywords}
                onGoProfile={() => navigate(`/profile/${getItem(4).userId}`)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 border-b pb-2 px-2 text-blue-600">
            4. RecommendCard2
          </h2>
          <div className="flex justify-center">
            <div className="w-[335px] h-[500px] relative shadow-2xl rounded-[20px] overflow-hidden">
              <RecommendCard2
                targetUserId={getItem(5).userId}
                initialIsLiked={getItem(5).isLiked}
                initialHeartId={null}
                profileUrl={`/profile/${getItem(5).userId}`}
                imageUrl={getItem(5).profileImageUrl}
                nickname={getItem(5).nickname}
                age={getItem(5).age}
                area={getItem(5).areaName}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 border-b pb-2 px-2 text-blue-600">
            5. SmallButtonIdleCard
          </h2>
          <div className="flex justify-center">
            <div className="w-[335px] h-[500px] relative shadow-2xl rounded-[20px] overflow-hidden">
              <SmallButtonIdleCard
                targetUserId={getItem(6).userId}
                initialIsLiked={getItem(6).isLiked}
                initialHeartId={null}
                profileUrl={`/profile/${getItem(6).userId}`}
                imageUrl={getItem(6).profileImageUrl}
                nickname={getItem(6).nickname}
                age={getItem(6).age}
                area={getItem(6).areaName}
                description={getItem(6).introText}
                keywords={getItem(6).keywords}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
