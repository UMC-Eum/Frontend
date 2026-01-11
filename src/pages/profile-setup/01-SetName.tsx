import { useState } from "react";
import { ProfileData } from "./ProfileSetupMain";

interface SetNameProps {
  onNext: (data: Partial<ProfileData>) => void;
}

export default function SetName({ onNext }: SetNameProps) {
  const [name, setName] = useState("");

  const isValid = name.trim().length > 0;

  const handleNext = () => {
    onNext({ name: name.trim() });
  };

  return (
    <div className="flex-1 flex flex-col px-2">
      <div className="mt-5 mb-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          성함이 어떻게 되세요?
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          실명도, 닉네임도 모두 괜찮아요.
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력해주세요"
          className="w-full px-4 py-4 text-[18px] border-2 border-gray-200 rounded-2xl outline-none focus:border-[#FC3367] placeholder:text-gray-400"
          autoFocus
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
