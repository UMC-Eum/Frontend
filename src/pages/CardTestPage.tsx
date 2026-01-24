

// =================================================================
// 🚨 [주의] 파일 경로가 꼬였을 수 있으니 본인 폴더 위치를 꼭 확인하세요!
// =================================================================

// 1. 미니 카드 (우상단 하트)
import MiniCard from "../components/card/presets/MiniCard";

// 2. 추천 카드 (네비게이션용 - 프로필 보러가기)
import RecommendCard from "../components/card/presets/RecommendCard1";

// 3. 추천 카드 2 (기본형 - 좋아요 기능)
import RecommendCard2 from "../components/card/presets/RecommendCard2";

// 4. 스몰 버튼 아이들 카드 (아이콘 3개: 닫기, 채팅, 좋아요)
// (아까 'SmallButtonIdleCard'라고 정의하신 컴포넌트)
import SmallButtonIdleCard from "../components/card/presets/SmallButtonIdleCard"; 

// 5. 아이들 카드 (큰 버튼 2개: 마음에 들어요, 대화해보기)
// (CardActions를 사용하는 컴포넌트)
import IdleCard from "../components/card/presets/IdleCard"; 


import { Keyword } from "../components/keyword/keyword.model";

export default function CardTestPage() {
  
  // 더미 키워드
  const dummyKeywords: Keyword[] = [
    { id: 1, label: "차분함", category: "character" },
  { id: 2, label: "활발함", category: "character" },
  { id: 3, label: "신중함", category: "character" },
  { id: 4, label: "즉흥성", category: "character" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col gap-16 overflow-y-auto pb-40">
      
      <div className="space-y-2 border-b border-gray-700 pb-4">
        <h1 className="text-white text-3xl font-bold">💳 카드 컴포넌트 5종 통합 테스트</h1>
        <p className="text-gray-400">
          누락 없이 5개 전부 테스트합니다. (API 연동 포함)
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 1. MiniCard */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-emerald-400 text-xl font-bold mb-4">
          1. MiniCard (미니 카드)
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          <MiniCard
            targetUserId={101}
            imageUrl="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300&auto=format&fit=crop"
            name="미니"
            age={22}
            area="서울"
            distance="1km"
            initialIsLiked={false}
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 2. RecommendCard */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-blue-400 text-xl font-bold mb-4">
          2. RecommendCard (프로필 이동형)
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-4">
          <div className="w-[320px] h-[480px] shrink-0 relative">
            <RecommendCard
              targetUserId={201} 
              imageUrl="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop"
              name="네비게이션"
              age={26}
              area="용산"
              distance="3km"
              description="프로필 보러가기 버튼 테스트"
              keywords={dummyKeywords}
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 3. RecommendCard2 */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-purple-400 text-xl font-bold mb-4">
          3. RecommendCard2 (심플 좋아요형)
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-4">
          <div className="w-[300px] h-[450px] relative rounded-[20px] overflow-hidden border border-gray-700">
            <RecommendCard2
              targetUserId={301}
              imageUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop"
              name="심플카드"
              age={28}
              area="강남"
              distance="5km"
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 4. SmallButtonIdleCard (아이콘 3개) */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-pink-400 text-xl font-bold mb-4">
          4. SmallButtonIdleCard (아이콘 3개형)
        </h2>
        <p className="text-gray-400 text-sm mb-2">기능: 닫기 / 채팅(이동) / 좋아요(색상변경)</p>
        <div className="flex gap-6 overflow-x-auto pb-4">
          <div className="w-[320px] h-[520px] shrink-0 relative rounded-[20px] overflow-hidden shadow-xl border border-gray-700">
            <SmallButtonIdleCard
              targetUserId={401}
              imageUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop"
              name="스몰버튼"
              age={24}
              area="마포"
              distance="500m"
              description="아이콘 버튼 3개가 있는 카드입니다."
              keywords={dummyKeywords}
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 5. IdleCard (큰 버튼 2개) */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-yellow-400 text-xl font-bold mb-4">
          5. IdleCard (큰 버튼 2개형)
        </h2>
        <p className="text-gray-400 text-sm mb-2">기능: 마음에 들어요(색상변경) / 대화해보기(이동)</p>
        <div className="flex gap-6 overflow-x-auto pb-4">
          <div className="w-[320px] h-[520px] shrink-0 relative rounded-[20px] overflow-hidden shadow-xl border border-gray-700">
            <IdleCard
              targetUserId={501}
              imageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"
              name="아이들"
              age={25}
              area="성수"
              distance="2km"
              description="큰 버튼(CardActions)을 사용하는 카드입니다."
              keywords={dummyKeywords}
            />
          </div>
        </div>
      </section>

    </div>
  );
}