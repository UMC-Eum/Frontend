function RecommendCardSkeleton() {
  return (
    <div
      className="
        relative w-full max-w-sm aspect-[3/4]
        rounded-2xl overflow-hidden bg-gray-200 animate-pulse
      "
    >
      {/* 정보 영역 레이아웃 유지 */}
      <div className="absolute bottom-0 w-full px-[5%] pb-4">
        {/* 이름 & 나이 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-32 bg-gray-300 rounded-md" />
          <div className="h-6 w-6 bg-gray-300 rounded-full" />
        </div>

        {/* 위치 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-gray-300 rounded-sm" />
          <div className="h-4 w-20 bg-gray-300 rounded-md" />
        </div>

        {/* 설명 */}
        <div className="h-4 w-3/4 bg-gray-300 rounded-md mb-4" />

        {/* 키워드 */}
        <div className="flex gap-2 mb-6">
          <div className="h-7 w-16 bg-gray-300 rounded-lg" />
          <div className="h-7 w-20 bg-gray-300 rounded-lg" />
          <div className="h-7 w-14 bg-gray-300 rounded-lg" />
        </div>

        {/* 버튼 영역 */}
        <div className=" h-12 bg-gray-300 rounded-xl" />
      </div>
    </div>
  );
}

function SmallButtonIdleCardSkeleton() {
  return (
    <div
      className="
        relative w-full max-w-sm aspect-[3/4]
        rounded-2xl overflow-hidden bg-gray-200 animate-pulse
      "
    >
      {/* 텍스트 정보 영역 */}
      <div className="absolute left-4 right-4 bottom-28">
        {/* 이름 & 나이 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-24 bg-gray-300 rounded-md" />
          <div className="h-5 w-5 bg-gray-300 rounded-full" />
        </div>

        {/* 위치 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 bg-gray-300 rounded-sm" />
          <div className="h-4 w-20 bg-gray-300 rounded-md" />
        </div>

        {/* 한줄 소개 */}
        <div className="h-4 w-3/4 bg-gray-300 rounded-md mb-3" />

        {/* 키워드 영역 */}
        <div className="flex gap-2">
          <div className="h-6 w-14 bg-gray-300 rounded-lg" />
          <div className="h-6 w-16 bg-gray-300 rounded-lg" />
          <div className="h-6 w-12 bg-gray-300 rounded-lg" />
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-[52px]">
        {/* X 버튼 보조 (CloseAction) */}
        <div className="h-10 w-10 bg-gray-300 rounded-full" />
        {/* 채팅 버튼 보조 (ChatAction) */}
        <div className="h-14 w-14 bg-gray-300 rounded-full" />
        {/* 좋아요 버튼 보조 (LikeAction) */}
        <div className="h-10 w-10 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}

function RecommendCard2Skeleton() {
  return (
    <div
      className="
        relative w-full max-w-sm aspect-[3/4]
        overflow-hidden bg-gray-200 animate-pulse
      "
    >
      {/* 정보 영역 */}
      <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-2">
        {/* 왼쪽: 유저 정보 */}
        <div className="flex flex-col gap-1">
          {/* 이름 & 나이 */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-24 bg-gray-300 rounded-md" />
            <div className="h-5 w-5 bg-gray-300 rounded-full" />
          </div>

          {/* 위치 */}
          <div className="flex items-center gap-2 mt-1">
            <div className="h-4 w-4 bg-gray-300 rounded-sm" />
            <div className="h-4 w-20 bg-gray-300 rounded-md" />
          </div>
        </div>

        {/* 오른쪽: 좋아요 버튼 */}
        <div className="h-10 w-10 bg-gray-300 rounded-full shrink-0" />
      </div>
    </div>
  )
}

function MiniCardSkeleton() {
  return (
    <div className="w-[173px] aspect-[2/3] rounded-2xl overflow-hidden bg-gray-200 animate-pulse relative shadow-sm shrink-0">
      {/* 하트 모양 좋아요 버튼 (우상단) */}
      <div className="absolute top-[12px] right-[10px] z-10">
        <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M0 6.69375C0 3.01382 2.83687 0 6.48123 0C8.3326 0 9.98466 0.783201 11.1562 2.03865C12.3278 0.783201 13.9798 0 15.8312 0C19.4755 0 22.3124 3.01382 22.3124 6.69375C22.3124 8.43617 21.6818 9.90329 20.6966 11.2652C19.7296 12.6018 18.3845 13.8849 16.9069 15.257L16.9024 15.2612L12.9291 18.9033C12.7455 19.0717 12.5692 19.2333 12.4091 19.3585C12.2332 19.4959 12.0189 19.6371 11.7466 19.7204C11.3618 19.8381 10.9506 19.8381 10.5658 19.7204C10.2935 19.6371 10.0792 19.4959 9.90335 19.3585C9.74318 19.2333 9.56699 19.0717 9.38334 18.9033L5.41007 15.2612L5.40555 15.257C3.92795 13.8849 2.5828 12.6018 1.61584 11.2652C0.630658 9.90329 0 8.43617 0 6.69375Z" 
            fill="#D1D5DB"
          />
        </svg>
      </div>
      
      {/* 이름 + 위치 (좌하단) */}
      <div className="absolute left-4 bottom-3 flex flex-col gap-1.5">
        <div className="h-[18px] w-24 bg-gray-300 rounded-md" />
        <div className="h-[14px] w-16 bg-gray-300 rounded-md" />
      </div>
    </div>
  );
}

function IdleCardSkeleton() {
  return (
    <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden bg-gray-200 animate-pulse relative shadow-lg">
      <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3">
        {/* 유저 정보 */}
        <div className="h-7 w-32 bg-gray-300 rounded-md" />
        
        {/* 위치 */}
        <div className="h-4 w-24 bg-gray-300 rounded-md" />
        
        {/* 한줄 소개 */}
        <div className="h-4 w-3/4 bg-gray-300 rounded-md" />
        
        {/* 키워드 */}
        <div className="flex gap-2">
          <div className="h-6 w-14 bg-gray-300 rounded-lg" />
          <div className="h-6 w-16 bg-gray-300 rounded-lg" />
        </div>

        {/* 액션 버튼 2개 */}
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-gray-300 rounded-xl" />
          <div className="flex-1 h-12 bg-gray-300 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export { 
  RecommendCardSkeleton, 
  SmallButtonIdleCardSkeleton, 
  RecommendCard2Skeleton, 
  MiniCardSkeleton, 
  IdleCardSkeleton 
};
