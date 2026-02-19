import { useEffect, useMemo, useRef, useState } from "react";
import { useUserStore } from "../../stores/useUserStore";
import KeywordChips from "../../components/keyword/KeywordChips";
import { useScoreStore } from "../../stores/useScoreStore";
import { FullButton } from "../../components/standard/CTA";

const MAX_SELECT = 5;

interface SetKeywordsProps {
  onNext: (data: { personalities: string[]; keywords: string[] }) => void;
}

export default function SetKeywords({ onNext }: SetKeywordsProps) {
  const { user, updateUser } = useUserStore();

  const personalities = useScoreStore((s) => s.keywords.personalities);
  const interests = useScoreStore((s) => s.keywords.interests);

  const allKeywords = useMemo(
    () =>
      [...personalities, ...interests]
        .sort((a, b) => b.score - a.score)
        .map((k) => k.text),
    [personalities, interests],
  );

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const isInitialized = useRef(false);
  useEffect(() => {
    if (isInitialized.current || allKeywords.length === 0) return;
    setSelectedKeywords(allKeywords.slice(0, MAX_SELECT));
    isInitialized.current = true;
  }, [allKeywords]);

  const handleNext = () => {
    const personalitySet = new Set(personalities.map((p) => p.text));

    const selectedPers: string[] = [];
    const selectedInts: string[] = [];

    selectedKeywords.forEach((k) => {
      if (personalitySet.has(k)) {
        selectedPers.push(k);
      } else {
        selectedInts.push(k);
      }
    });

    console.log(selectedPers);
    console.log(selectedInts);

    updateUser({ keywords: selectedInts, personalities: selectedPers });
    onNext({ personalities: selectedPers, keywords: selectedInts });
  };

  const isValid = selectedKeywords.length > 0;

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="mt-[28px]">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          이 내용이 {user?.nickname}님을
          <br />잘 표현하나요?
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          필요한 키워드를 선택하거나 직접 추가할 수도 있어요.
          <br />
          최대 {MAX_SELECT}개까지 고를 수 있어요.
        </p>

        <div className="flex flex-wrap gap-[9px] mt-[40px]">
          <KeywordChips
            allKeywords={allKeywords}
            selectedKeywords={selectedKeywords}
            maxSelect={MAX_SELECT}
            onChange={(ids) => setSelectedKeywords(ids)}
          />
        </div>
      </div>

      <div className="flex-1" />

      <p className="text-center text-gray-500 text-[14px] mb-[18px]">
        키워드는 프로필에서 언제든 수정할 수 있어요!
      </p>
      <FullButton onClick={handleNext} disabled={!isValid}>
        다음
      </FullButton>
    </div>
  );
}
