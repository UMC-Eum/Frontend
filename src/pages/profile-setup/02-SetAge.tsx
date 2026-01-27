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
  const [activeIndex, setActiveIndex] = useState(0);

  // 1부터 100까지
  const ageList = Array.from({ length: 100 }, (_, i) => i + 1);

  const ITEM_HEIGHT = 60;
  const CONTAINER_HEIGHT = 420;
  const SPACER_HEIGHT = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScroll = e.currentTarget.scrollTop;

    const newIndex = Math.round(currentScroll / ITEM_HEIGHT);
    const safeIndex = Math.max(0, Math.min(ageList.length - 1, newIndex));

    if (safeIndex !== activeIndex) {
      setActiveIndex(safeIndex); // 여기서 렌더링 시점 결정
      onChange(safeIndex + 1);
    }
  };

  function computeBlockStyle(index: number) {

    const distance = Math.abs(index - activeIndex);

    if (distance === 0) return "text-[#FC3367] text-6xl font-bold";
    if (distance === 1) return "text-[#FC3367] text-4xl font-bold";
    if (distance === 2) return "text-gray-400 text-3xl";
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
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
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
