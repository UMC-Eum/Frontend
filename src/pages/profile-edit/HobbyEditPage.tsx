import { useState } from "react";
import BackButton from "../../components/BackButton";
import KeywordChips from "../../components/keyword/KeywordChips";
import { useUserStore } from "../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { useScoreStore } from "../../stores/useScoreStore";

export default function HobbyEditPage() {
  const MAX_SELECT = 5;
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();
  const { getInterests } = useScoreStore();

  //선택된 키워드
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(user?.keywords || []);

  const handleSave = () => {
    updateUser({ keywords: selectedKeywords });
    navigate("/my/edit/");
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
          allKeywords={getInterests()}
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
