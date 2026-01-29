import { useState } from "react";
import { useUserStore } from "../../stores/useUserStore";
import KeywordChips from "../../components/keyword/KeywordChips";
import { useScoreStore } from "../../stores/useScoreStore";

const MAX_SELECT = 5;

interface SetKeywordsProps {
  onNext: () => void;
}

export default function SetKeywords({ onNext }: SetKeywordsProps) {
  const { user, updateUser } = useUserStore();
  const { getScores } = useScoreStore();

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    getScores().slice(0, MAX_SELECT),
  );

  const handleNext = () => {
    updateUser({ keywords: selectedKeywords });
    onNext();
  };

  const isValid = selectedKeywords.length > 0;

  return (
    <div className="flex flex-col h-full px-2">
      <div className="mt-12 mb-10">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          이 내용이 {user?.nickname}님을
          <br />잘 표현하나요?
        </h1>
        <div className="text-gray-400 text-[15px] mt-2 decoration-gray-300 underline-offset-4">
          <p>필요한 키워드를 선택하거나 직접 추가할 수도 있어요.</p>
          <p>최대 {MAX_SELECT}개까지 고를 수 있어요.</p>
        </div>
      </div>

      <div className="pb-4 flex flex-wrap gap-3">
        <KeywordChips
          allKeywords={getScores()}
          selectedKeywords={selectedKeywords}
          maxSelect={MAX_SELECT}
          onChange={(ids) => setSelectedKeywords(ids)}
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
