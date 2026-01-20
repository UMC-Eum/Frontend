import { useEffect, useMemo, useState } from "react";
import BackButton from "../../components/BackButton";
import KeywordChips from "../../components/keyword/KeywordChips";
import { useUserStore } from "../../stores/useUserStore";
import { Keyword, KEYWORDS } from "../../components/keyword/keyword.model";

export default function HobbyEditPage() {
  const MAX_SELECT = 5;
  const { user, updateUser } = useUserStore();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredKeywords = useMemo(() => {
    return KEYWORDS.filter((k) => k.id >= 280 && k.id <= 300);
  }, []);

  const selectedKeywords = useMemo(() => {
    if (!user?.keywords) return [];

    return user?.keywords
      .map((item) => {
        // 문제 터지면 keyword 타입 리팩토링을 재고
        const matchedKeyword = KEYWORDS.find(
          (k) => k.label === item && k.category === "hobby",
        );

        return matchedKeyword;
      })
      .filter((k): k is Keyword => k !== undefined);
  }, [user?.keywords]);

  useEffect(() => {
    if (user?.keywords) {
      const initialIds = selectedKeywords
        .filter((k) => user.keywords.includes(k.label))
        .map((k) => k.id);
      setSelectedIds(initialIds);
    }
  }, [selectedKeywords, user?.keywords]);

  const handleSave = () => {
    const selectedLabels = selectedIds
      .map((id) => KEYWORDS.find((k) => k.id === id)?.label)
      .filter((label): label is string => !!label);

    updateUser({ keywords: selectedLabels });
  };

  return (
    <>
      <BackButton
        title="나의 관심사"
        textClassName="text-[24px] font-semibold"
      />
      <h2>나의 관심사를 선택해주세요!</h2>
      <p>최대 5개까지 고를 수 있어요.</p>
      <div className="pb-4 flex flex-wrap gap-3">
        <KeywordChips
          keywords={filteredKeywords}
          selectedIds={selectedIds}
          maxSelect={MAX_SELECT}
          onChange={(ids) => setSelectedIds(ids)}
        />
      </div>
      <div className="flex items-center justify-center">
      <button className="m-5 p-3 w-full flex items-center justify-center rounded-xl bg-[#FF3D77] text-white" onClick={handleSave}>저장하기</button>
      </div>
    </>
  );
}
