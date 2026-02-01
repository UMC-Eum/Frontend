import { useState } from "react";
import BackButton from "../../components/BackButton";
import KeywordChips from "../../components/keyword/KeywordChips";
import { useUserStore } from "../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { useScoreStore } from "../../stores/useScoreStore";


export default function PersonalitiesEditPage() {
  const MAX_SELECT = 5;
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();
  const { getPersonalities } = useScoreStore();

  //선택된 키워드
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(user?.personalities || []);

  const handleSave = () => {
    updateUser({ personalities: selectedKeywords });
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
          allKeywords={getPersonalities()}
          selectedKeywords={selectedKeywords}
          maxSelect={MAX_SELECT}
          onChange={(ids) => setSelectedKeywords(ids)}
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
