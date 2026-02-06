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
  const { getScores, getPersonalities, getInterests } = useScoreStore();

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    getScores().slice(0, MAX_SELECT),
  );

  const handleNext = () => {
    const personalities = selectedKeywords.filter((k) => getPersonalities().includes(k));
    const keywords = selectedKeywords.filter((k) => getInterests().includes(k));

    updateUser({ keywords, personalities });
    onNext();
  };

  const isValid = selectedKeywords.length > 0;

  return (
<div className="flex-1 flex flex-col px-2">
  <div className="mt-5 mb-5">
    <h1 className="text-[26px] font-bold text-black leading-tight">
      이 내용이 {user?.nickname}님을
      <br />
      잘 표현하나요?
    </h1>
    <p className="text-gray-500 text-[15px] mt-2">
      필요한 키워드를 선택하거나 직접 추가할 수도 있어요.<br/>
      최대 {MAX_SELECT}개까지 고를 수 있어요.
    </p>
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
    <p className="text-center text-gray-500 text-[14px] mb-5">키워드는 프로필에서 언제든 수정할 수 있어요!</p>
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
