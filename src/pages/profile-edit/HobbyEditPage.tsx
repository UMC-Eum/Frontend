import { useEffect, useMemo, useRef, useState } from "react";
import BackButton from "../../components/BackButton";
import KeywordChips from "../../components/keyword/KeywordChips";
import { useUserStore } from "../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { useScoreStore } from "../../stores/useScoreStore";
import { updateMyProfile } from "../../api/users/usersApi";

export default function HobbyEditPage() {
  const MAX_SELECT = 5;
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();

  const interests = useScoreStore((s) => s.keywords.interests);

  const allKeywords = useMemo(
    () => (interests || []).map((p) => p.text),
    [interests],
  );

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    if (!user?.keywords) return;

    setSelectedKeywords([...user.keywords]);
    initialized.current = true;
  }, [user]);

  const isChanged = useMemo(() => {
    const original = user?.keywords || [];
    if (selectedKeywords.length !== original.length) return true;
    return !selectedKeywords.every((kw) => original.includes(kw));
  }, [selectedKeywords, user?.keywords]);

  const handleSave = async () => {
    if (!isChanged || !user) return;

    setIsLoading(true);
    try {
      await updateMyProfile({
        keywords: selectedKeywords,
      });
      updateUser({ keywords: [...selectedKeywords] });
      navigate("/my/edit/");
    } catch (error) {
      console.error("Failed to update hobbies:", error);
      alert("관심사 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <BackButton
        title="나의 관심사"
        textClassName="text-[24px] font-semibold"
      />
      <div className="p-5 flex flex-col gap-[10px] flex-1">
        <h2 className="text-[22px] font-semibold leading-[1.4] tracking-normal text-gray-900 align-middle">
          나의 관심사를 선택해주세요!
        </h2>
        <p className="text-[14px] font-medium leading-[1.4] tracking-normal text-gray-500">
          최대 5개까지 고를 수 있어요.
        </p>
        <div className="pt-5 flex flex-wrap gap-3">
          <KeywordChips
            allKeywords={allKeywords}
            selectedKeywords={selectedKeywords}
            maxSelect={MAX_SELECT}
            onChange={(ids) => setSelectedKeywords(ids)}
          />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <button
          className={`m-5 py-4 w-[calc(100%-40px)] flex items-center justify-center rounded-xl text-[18px] font-semibold leading-[1.2] tracking-normal transition-all ${
            isChanged && !isLoading
              ? "bg-[#FF3D77] text-white"
              : "bg-[#DEE3E5] text-[#A6AFB6] cursor-not-allowed"
          }`}
          onClick={handleSave}
          disabled={!isChanged || isLoading}
        >
          {isLoading ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
