import { useRef, useState } from "react"; // useEffect 추가
import { useUserStore } from "../../stores/useUserStore";
import { FullButton } from "../../components/standard/CTA";

interface SetAgeProps {
  onNext: () => void;
}

export default function SetAge({ onNext }: SetAgeProps) {
  const [age, setAge] = useState(50);

  const { updateUser } = useUserStore();

  const handleNext = () => {
    if (age <= 0) return;
    updateUser({ age });
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <h1 className="text-[26px] font-bold text-black leading-tight">
          나이가 어떻게 되세요?
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          만나이로 알려주세요! 추후에 변경이 불가능해요.
        </p>

        {/* 피그마와 디자인이 달라져서 마진을 임의로 줬어요 */}
        <div className="mt-10">
          <WheelPicker onChange={setAge} />
        </div>  
      </div>

      <FullButton
        onClick={handleNext}
      >
        다음
      </FullButton>
    </div>
  );
}

type WheelPickerProps = {
  onChange: (age: number) => void;
};

const WheelPicker = ({ onChange }: WheelPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 50부터 100까지
  const ageList = Array.from({ length: 51 }, (_, i) => i + 50);

  const ITEM_HEIGHT = 60;
  const CONTAINER_HEIGHT = 420;
  const SPACER_HEIGHT = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScroll = e.currentTarget.scrollTop;

    const newIndex = Math.round(currentScroll / ITEM_HEIGHT);
    const safeIndex = Math.max(0, Math.min(ageList.length - 1, newIndex));

    if (safeIndex !== activeIndex) {
      setActiveIndex(safeIndex); // 여기서 렌더링 시점 결정
      onChange(ageList[safeIndex]);
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
