import { useState, useMemo, useEffect } from "react";
// 경로에 맞게 import
import { useUserStore } from "../../stores/useUserStore";
import { KEYWORDS } from "../../components/keyword/keyword.model";
import KeywordChips from "../../components/keyword/KeywordChips";

const MAX_SELECT = 5;

interface SetKeywordsProps {
  // 부모에게 데이터를 넘기지 않고 스토어에 저장 후 이동만 한다면 인자 제거 가능
  // 기존 호환성을 위해 유지하되, 선택적으로 변경
  onNext: () => void;
}

export default function SetKeywords({ onNext }: SetKeywordsProps) {
  // ✅ 1. 스토어에서 유저 정보와 업데이트 함수 가져오기
  const { user, updateUser } = useUserStore();

  // 닉네임 가져오기 (없으면 기본값)
  const name = user?.nickname || "회원";

  // ✅ 2. 키워드 필터링 (AI가 추천해준 키워드라고 가정)
  // 실제로는 user.keywords에 들어있는 텍스트와 매칭되는 ID를 찾아야 할 수도 있습니다.
  const filteredKeywords = useMemo(() => {
    return KEYWORDS.filter((k) => k.id >= 280 && k.id <= 300);
  }, []);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (user?.keywords) {
      // filteredKeywords 중에서 user.keywords(string[])에 포함된 것들의 ID 추출
      const initialIds = filteredKeywords
        .filter((k) => user.keywords.includes(k.label))
        .map((k) => k.id);
      setSelectedIds(initialIds);
    }
  }, []);

  const handleNext = () => {
    // 1. 선택된 ID를 기반으로 실제 키워드 객체 찾기
    const selectedKeywords = filteredKeywords.filter((k) =>
      selectedIds.includes(k.id)
    );

    // 2. 스토어에는 '문자열 배열'로 저장 (IUserProfile 타입에 맞춤)
    // KEYWORDS 모델이 { id: number, label: string } 형태라고 가정
    const keywordStrings = selectedKeywords.map((k) => k.label);

    // 3. 스토어 업데이트
    updateUser({ keywords: keywordStrings });

    // 4. 다음 단계 이동
    onNext();
  };

  const isValid = selectedIds.length > 0;

  return (
    <div className="flex flex-col h-full px-2">
      <div className="mt-12 mb-10">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          이 내용이 {name}님을
          <br />잘 표현하나요?
        </h1>
        <div className="text-gray-400 text-[15px] mt-2 decoration-gray-300 underline-offset-4">
          <p>필요한 키워드를 선택하거나 직접 추가할 수도 있어요.</p>
          <p>최대 {MAX_SELECT}개까지 고를 수 있어요.</p>
        </div>
      </div>

      <div className="pb-4 flex flex-wrap gap-3">
        <KeywordChips
          keywords={filteredKeywords}
          selectedIds={selectedIds}
          maxSelect={MAX_SELECT}
          onChange={(ids) => setSelectedIds(ids)}
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
