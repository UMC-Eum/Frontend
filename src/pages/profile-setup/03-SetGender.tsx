import { useState } from "react";
import maleBtnInactive from "../../assets/male_btn_inactive.png";
import femaleBtnInactive from "../../assets/female_btn_inactive.png";
import maleBtnActive from "../../assets/male_btn_active.png";
import femaleBtnActive from "../../assets/female_btn_active.png";
import { useUserStore } from "../../stores/useUserStore";

interface SetGenderProps {
  onNext: () => void;
}

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

      <div className="mt-30 flex flex-col items-center gap-10">
        <img
          src={gender === "M" ? maleBtnActive : maleBtnInactive}
          className="cursor-pointer"
          onClick={() => setGender("M")}
          alt="Male"
        />

        <img
          src={gender === "F" ? femaleBtnActive : femaleBtnInactive}
          className="cursor-pointer"
          onClick={() => setGender("F")}
          alt="Female"
        />
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
