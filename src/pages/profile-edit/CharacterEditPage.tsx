import { useMemo, useState } from "react";
import BackButton from "../../components/BackButton";
import KeywordChips from "../../components/keyword/KeywordChips";
import { useUserStore } from "../../stores/useUserStore";
import { KEYWORDS } from "../../components/keyword/keyword.model";
import { useNavigate } from "react-router-dom";

export default function CharacterEditPage() {
  const MAX_SELECT = 5;
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();

  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    if (!user?.keywords) return [];

    // 현재 유저의 키워드 라벨들과 일치하는 ID들을 찾아 초기값으로 설정
    return KEYWORDS.filter(
      (k) =>
        ["character", "value", "lifestyle", "expression"].includes(
          k.category,
        ) && user.keywords.includes(k.label),
    ).map((k) => k.id);
  });

  const filteredKeywords = useMemo(() => {
    return KEYWORDS.filter((k) => k.id >= 180 && k.id <= 200);
  }, []);

  const handleSave = () => {
    const selectedLabels = selectedIds
      .map((id) => KEYWORDS.find((k) => k.id === id)?.label)
      .filter((label): label is string => !!label);

    const hobbyKeywords = (user?.keywords || []).filter((label) => {
      const k = KEYWORDS.find((item) => item.label === label);
      return k?.category === "hobby";
    });

    updateUser({ keywords: [...hobbyKeywords, ...selectedLabels] });
    navigate("/my/edit/");
  };

  return (
    <>
      <BackButton
        title="나는 이런 사람이에요."
        textClassName="text-[24px] font-semibold"
      />
      <h2>나를 나타내는 키워드들을 골라주세요. </h2>
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
        <button
          className="m-5 p-3 w-full flex items-center justify-center rounded-xl bg-[#FF3D77] text-white"
          onClick={handleSave}
        >
          저장하기
        </button>
      </div>
    </>
  );
}
