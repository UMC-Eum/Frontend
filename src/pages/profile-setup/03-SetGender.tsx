import { useState } from "react";
import { useUserStore } from "../../stores/useUserStore";

interface SetGenderProps {
  onNext: () => void;
}
const MaleIcon = ({ active }: { active: boolean }) => (
  <svg
    width="150"
    height="150"
    viewBox="0 0 150 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-all duration-300"
  >
    <circle
      cx="75"
      cy="75"
      r="72.5"
      fill={active ? "#FFF0F3" : "white"}
      stroke={active ? "#FC3367" : "#EAEEF2"}
      strokeWidth="3"
    />
    <circle
      cx="70"
      cy="64"
      r="16"
      stroke={active ? "#FC3367" : "#A6AFB6"}
      strokeWidth="5"
    />
    <path
      d="M82 52L92 42M92 42H82M92 42V52"
      stroke={active ? "#FC3367" : "#A6AFB6"}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="75"
      y="112"
      textAnchor="middle"
      fill={active ? "#FC3367" : "#A6AFB6"}
      className="text-[16px] font-semibold"
    >
      남성
    </text>
  </svg>
);

const FemaleIcon = ({ active }: { active: boolean }) => (
  <svg
    width="150"
    height="150"
    viewBox="0 0 150 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-all duration-300"
  >
    <circle
      cx="75"
      cy="75"
      r="72.5"
      fill={active ? "#FFF0F3" : "white"}
      stroke={active ? "#FC3367" : "#EAEEF2"}
      strokeWidth="3"
    />
    <circle
      cx="75"
      cy="53"
      r="16"
      stroke={active ? "#FC3367" : "#A6AFB6"}
      strokeWidth="5"
    />
    <path
      d="M75 69V87M69 81H82"
      stroke={active ? "#FC3367" : "#A6AFB6"}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="75"
      y="112"
      textAnchor="middle"
      fill={active ? "#FC3367" : "#A6AFB6"}
      className="text-[16px] font-semibold"
    >
      여성
    </text>
  </svg>
);

export default function SetGender({ onNext }: SetGenderProps) {
  const [gender, setGender] = useState<"M" | "F" | null>(null);

  const { updateUser } = useUserStore();
  const isValid = gender !== null;

  const handleNext = () => {
    if (!gender) return;
    updateUser({ gender });
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col px-2">
      <div className="mt-5 mb-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          성별을 선택해주세요.
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          추후에 변경이 불가능해요.
        </p>
      </div>

      <div className="mt-20 flex flex-col items-center gap-10">
        <div className="cursor-pointer" onClick={() => setGender("M")}>
          <MaleIcon active={gender === "M"} />
        </div>

        <div className="cursor-pointer" onClick={() => setGender("F")}>
          <FemaleIcon active={gender === "F"} />
        </div>
      </div>

      <div className="mt-auto pb-10">
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`w-full py-5 rounded-[20px] text-[18px] font-semibold transition-all ${
            isValid
              ? "bg-[#FC3367] text-white active:bg-pink-300"
              : "bg-[#DEE3E5] text-[#A6AFB6] cursor-not-allowed"
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}

