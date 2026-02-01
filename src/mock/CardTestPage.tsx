
// ----------------------------------------------------------------------
// ⚠️ [중요] 컴포넌트 경로를 실제 프로젝트 위치에 맞게 수정해주세요!
// ----------------------------------------------------------------------
import IdleCard from "../components/card/presets/IdleCard";
import MiniCard from "../components/card/presets/MiniCard";
import RecommendCard from "../components/card/presets/RecommendCard1"; // 파일명이 RecommendCard1.tsx 라면
import RecommendCard2 from "../components/card/presets/RecommendCard2";
import SmallButtonIdleCard from "../components/card/presets/SmallButtonIdleCard";

export default function CardTestPage() {
  // 테스트용 더미 데이터 (각 카드마다 ID를 다르게 줘서 API 테스트 용이하게 함)
  const DUMMY_BASE = {
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
    nickname: "김테스트",
    age: 26,
    area: "서울 강남구",
    distance: "1.2km",
    description: "API 연동 테스트 중입니다. 좋아요 눌러보세요!",
    keywords: ["운동", "맛집", "코딩"],
    profileUrl: "/profile/test",
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-2xl font-bold text-center mb-10 text-gray-800">
        카드 컴포넌트 & API 연동 테스트
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        {/* 1. IdleCard (메인 스와이프용) */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-blue-600">1. IdleCard (ID: 1)</h2>
          <div className="w-[340px] h-[500px] relative shadow-2xl rounded-[20px]">
            <IdleCard
              {...DUMMY_BASE}
              targetUserId={1} // 🔥 API 호출 시 사용될 ID
              initialIsLiked={false}
              initialHeartId={null}
            />
          </div>
        </div>

        {/* 2. MiniCard (가로 스크롤용) */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-blue-600">2. MiniCard (ID: 2)</h2>
          {/* MiniCard는 자체 사이즈(w-[173px])가 있으므로 컨테이너 크기 제한 불필요 */}
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <MiniCard
              {...DUMMY_BASE}
              targetUserId={2}
              imageUrl="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80"
              initialIsLiked={true} // 이미 좋아요 누른 상태 테스트
              initialHeartId={999}  // 취소 테스트용 가짜 ID
            />
          </div>
        </div>

        {/* 3. RecommendCard (추천 카드 1) */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-blue-600">3. RecommendCard (ID: 3)</h2>
          <div className="w-[340px] h-[500px] relative shadow-2xl rounded-[20px]">
            <RecommendCard
              {...DUMMY_BASE}
              targetUserId={3}
              imageUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80"
            />
          </div>
        </div>

        {/* 4. RecommendCard2 (추천 카드 2 - 좋아요 버튼 큼) */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-blue-600">4. RecommendCard2 (ID: 4)</h2>
          <div className="w-[340px] h-[500px] relative shadow-2xl rounded-[20px]">
            <RecommendCard2
              {...DUMMY_BASE}
              targetUserId={4}
              imageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
              initialIsLiked={false}
            />
          </div>
        </div>

        {/* 5. SmallButtonIdleCard (작은 버튼 버전) */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-blue-600">5. SmallButtonIdleCard (ID: 5)</h2>
          <div className="w-[340px] h-[500px] relative shadow-2xl rounded-[20px]">
            <SmallButtonIdleCard
              {...DUMMY_BASE}
              targetUserId={5}
              imageUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"
              initialIsLiked={false}
            />
          </div>
        </div>

      </div>
    </div>
  );
}