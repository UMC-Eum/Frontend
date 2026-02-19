import { useState } from "react";
import { useUserStore } from "../../stores/useUserStore";
import { FemaleButton, MaleButton } from "../../components/standard/GenderButton";
import { FullButton } from "../../components/standard/CTA";

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
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <h1 className="text-[26px] font-bold text-black leading-tight">
          성별을 선택해주세요.
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          추후에 변경이 불가능해요.
        </p>

        <div className="mt-24 flex flex-col items-center gap-12">
          <MaleButton active={gender === "M"} onClick={() => setGender("M")} />
          <FemaleButton active={gender === "F"} onClick={() => setGender("F")} />
        </div>
      </div>


      <FullButton onClick={handleNext} disabled={!isValid}>
        다음
      </FullButton>
    </div>
  );
}

