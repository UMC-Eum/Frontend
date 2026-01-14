import { useRef, useState } from "react"; // useEffect 추가
import { useUserStore } from "../../stores/useUserStore";

interface SetAgeProps {
  onNext: () => void;
}

export default function SetAge({ onNext }: SetAgeProps) {
  const [age, setAge] = useState(1);

  const { updateUser } = useUserStore();

  const handleNext = () => {
    if (age <= 0) return;
    updateUser({ age });
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col px-2">
      <div className="mt-5 mb-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          나이가 어떻게 되세요?
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          만나이로 알려주세요! 추후에 변경이 불가능해요.
        </p>
      </div>

      <div className="mt-10">
        <WheelPicker onChange={setAge} />
      </div>

      <div className="mt-auto pb-10">
        <button
          onClick={handleNext}
          className={
            "w-full py-5 rounded-[20px] text-[18px] font-semibold transition-all bg-[#FC3367] text-white active:bg-pink-300"
          }
        >
          다음
        </button>
      </div>
    </div>
  );
}

type WheelPickerProps = {
  onChange: (age: number) => void;
};

const WheelPicker = ({ onChange }: WheelPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);

  // 1부터 100까지
  const ageList = Array.from({ length: 100 }, (_, i) => i + 1);

  const ITEM_HEIGHT = 60;
  const CONTAINER_HEIGHT = 420;
  const SPACER_HEIGHT = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

  // ✅ 초기 렌더링 시 상위 컴포넌트(SetAge)의 상태와 동기화
  // (스크롤을 안 건드려도 1이 선택된 것으로 간주하기 위해 필요할 수 있음)
  // 하지만 상위에서 useState(1)을 했다면 생략 가능합니다.

  const handleScroll = () => {
    if (!containerRef.current) return;
    scrollTopRef.current = containerRef.current.scrollTop;

    // 정확한 인덱스 계산
    const rawIndex = Math.round(scrollTopRef.current / ITEM_HEIGHT);
    const index = Math.max(0, Math.min(ageList.length - 1, rawIndex));

    // index는 0부터 시작하므로, 나이는 index + 1
    onChange(index + 1);
  };

  // ... (스타일 계산 로직은 그대로 유지) ...
  function computeBlockStyle(index: number) {
    // ⚠️ 성능 이슈 주석:
    // 스크롤 할 때마다 리렌더링이 발생하여 스타일을 계산하므로
    // 모바일 웹에서는 약간의 버벅임(Jank)이 있을 수 있습니다.
    // 하지만 "기한 내 완성"이 목표라면 이대로 두셔도 기능상 문제는 없습니다.
    const scrollTop = scrollTopRef.current;
    const centerIndex = scrollTop / ITEM_HEIGHT;
    const distance = Math.abs(index - centerIndex);

    if (distance < 0.5) return "text-[#FC3367] text-5xl font-bold";
    if (distance < 1.5) return "text-[#FC3367] text-4xl font-bold";
    if (distance < 2.5) return "text-gray-400 text-3xl";
    return "text-gray-400 text-2xl";
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: CONTAINER_HEIGHT }}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory no-scrollbar"
      >
        <div style={{ height: SPACER_HEIGHT }} />
        {ageList.map((num, i) => (
          <div
            key={num}
            style={{ height: ITEM_HEIGHT }}
            className={`
                flex items-center justify-center
                snap-center
                transition-all
                ${computeBlockStyle(i)}
              `}
          >
            {num}
          </div>
        ))}
        <div style={{ height: SPACER_HEIGHT }} />
      </div>

      <div className="pointer-events-none absolute inset-0 flex justify-center">
        {/* 중앙선 디자인 유지 */}
        <div
          className="absolute w-[120px] h-px bg-[#FC3367]"
          style={{ top: (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2 }}
        />
        <div
          className="absolute w-[120px] h-px bg-[#FC3367]"
          style={{ top: (CONTAINER_HEIGHT + ITEM_HEIGHT) / 2 }}
        />
      </div>
    </div>
  );
};
