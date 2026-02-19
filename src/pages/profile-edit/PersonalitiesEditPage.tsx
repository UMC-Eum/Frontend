import { useEffect, useMemo, useRef, useState } from "react";
import BackButton from "../../components/BackButton";
import KeywordChips from "../../components/keyword/KeywordChips";
import { useUserStore } from "../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { useScoreStore } from "../../stores/useScoreStore";
import { updateMyProfile } from "../../api/users/usersApi";
import { FullButton } from "../../components/standard/CTA";

export default function PersonalitiesEditPage() {
  const MAX_SELECT = 5;
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();

  const personalities = useScoreStore((s) => s.keywords.personalities);

  const allKeywords = useMemo(
    () => (personalities || []).map((p) => p.text),
    [personalities],
  );

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    if (!user?.personalities) return;

    setSelectedKeywords([...user.personalities]);
    initialized.current = true;
  }, [user]);

  const isChanged = useMemo(() => {
    const original = user?.personalities || [];
    if (selectedKeywords.length !== original.length) return true;
    return !selectedKeywords.every((kw) => original.includes(kw));
  }, [selectedKeywords, user?.personalities]);

  const handleSave = async () => {
    if (!isChanged || !user) return;

    setIsLoading(true);
    try {
      await updateMyProfile({
        personalities: selectedKeywords,
      });
      updateUser({ personalities: [...selectedKeywords] });
      navigate("/my/edit/");
    } catch (error) {
      console.error("Failed to update personalities:", error);
      alert("성격 키워드 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <BackButton
        title="나는 이런 사람이에요."
        textClassName="text-[24px] font-semibold"
      />
      <div className="p-5 flex flex-col gap-[10px] flex-1">
        <h2 className="text-[22px] font-semibold leading-[1.4] tracking-normal text-gray-900 align-middle">
          나를 나타내는 키워드들을 골라주세요.{" "}
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
        <FullButton
          onClick={handleSave}
          disabled={!isChanged || isLoading}
          className="m-5"
        >
          {isLoading ? "저장 중..." : "저장하기"}
        </FullButton>
      </div>
    </div>
  );
}
