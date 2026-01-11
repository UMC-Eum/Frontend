import { useRef, useState } from "react";
import { ProfileData } from "./ProfileSetupMain";

interface SetAgeProps {
  onNext: (data: Partial<ProfileData>) => void;
}

export default function SetAge({ onNext }: SetAgeProps) {
  const [age, setAge] = useState(0);

  const handleNext = () => {
    onNext({ age: age });
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
  onChange: (index: number) => void;
};

// UX 문제
// 스크롤보다 스타일 바뀌는 속도가 느림
// DOM 요소 자체를 갱신하면 되긴 하는데 scroll-smooth가 안 먹음
// 여기서 더 만졌다가 기한 내 완성을 못할 거 같아서 일단 둘 예정
// 나중에 시연 때 설명 예정.
const WheelPicker = ({ onChange }: WheelPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const ageList = Array.from({ length: 100 }, (_, i) => i + 1);

  const ITEM_HEIGHT = 60;
  const CONTAINER_HEIGHT = 420;
  const SPACER_HEIGHT = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

  const clamp = (i: number) => Math.max(0, Math.min(ageList.length - 1, i));

  const handleScroll = () => {
    if (!containerRef.current) return;
    scrollTopRef.current = containerRef.current.scrollTop;
    const rawIndex = Math.round(scrollTopRef.current / ITEM_HEIGHT);
    const index = clamp(rawIndex);

    onChange(index+1);
  };

  function computeBlockStyle(index: number) {
    const scrollTop = scrollTopRef.current;
    const centerIndex = scrollTop / ITEM_HEIGHT;
    const distance = Math.abs(index - centerIndex);

    if (distance < 0.5) {
      return "text-[#FC3367] text-5xl font-bold";
    }
    if (distance < 1.5) {
      return "text-[#FC3367] text-4xl font-bold";
    }
    if (distance < 2.5) {
      return "text-gray-400 text-3xl";
    }
    return "text-gray-400 text-2xl";
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: CONTAINER_HEIGHT }}
    >
      {/* no-scrollbar css 추가 */}
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
