import { useState, useEffect } from "react";
import { IAgreementItem, AgreementType } from "../../../types/api/agreements/agreementsDTO";

// 이미지 import (기존과 동일)
import unallcheckbutton from "../../../assets/term_unallcheckbutton.svg";
import uncheckbutton from "../../../assets/term_uncheckbutton.svg";
import allcheckbutton from "../../../assets/term_allcheckbutton.svg";
import checkbutton from "../../../assets/term_checkbutton.svg";
import detailbutton from "../../../assets/term_detailbutton.svg";

const TERM_TITLES: Record<AgreementType, string> = {
  POLICY: "서비스 이용약관 (필수)",
  PERSONAL_INFORMATION: "개인정보 수집 및 이용 동의 (필수)",
  MARKETING: "마케팅 정보 수신 동의 (선택)",
};

interface Props {
  agreements: IAgreementItem[];
  checked: Record<AgreementType, boolean>;
  onToggle: (type: AgreementType) => void;
  onToggleAll: () => void;
  onConfirm: () => void;
  onOpenTerm: (type: AgreementType) => void;
}

export default function AgreementSheet({
  agreements,
  checked,
  onToggle,
  onToggleAll,
  onConfirm,
  onOpenTerm,
}: Props) {
  const [error, setError] = useState("");
  
  // 🔥 1. 애니메이션 제어용 상태 (처음엔 안 보임)
  const [isVisible, setIsVisible] = useState(false);

  // 🔥 2. 컴포넌트가 켜지면(Mount) -> 스르륵 올라오게 설정
  useEffect(() => {
    // 아주 잠깐(50ms) 뒤에 true로 바꿔야 브라우저가 변경 사항을 감지하고 애니메이션을 실행함
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isRequired = (type?: AgreementType) => type === "POLICY" || type === "PERSONAL_INFORMATION";
  const isMissingRequired = agreements.some(
    (t) => t.type && isRequired(t.type) && !checked[t.type]
  );

  // 🔥 3. 닫힐 때(확인 버튼 등) -> 내려가는 애니메이션 후 진짜 닫기
  const handleCloseAnimation = (callback: () => void) => {
    setIsVisible(false); // 내려가라! (상태 변경 -> CSS translate-y-full 적용)
    setTimeout(() => {
      callback(); // 0.3초(애니메이션 시간) 뒤에 진짜 기능 실행 (부모에게 알림)
    }, 300); // duration-300과 시간 맞춤
  };

  const handleConfirmClick = () => {
    if (isMissingRequired) {
      setError("필수 약관에 모두 동의해주세요.");
      return;
    }
    setError("");
    
    // 애니메이션 실행 후 onConfirm 호출
    handleCloseAnimation(onConfirm);
  };

  const handleOpenTermClick = (type: AgreementType) => {
    // 상세 약관 볼 때도 부드럽게 내려가고 싶으면 이렇게 감싸줍니다.
    // (그냥 바로 뜨게 하고 싶으면 이 함수 대신 onOpenTerm 바로 호출)
    handleCloseAnimation(() => onOpenTerm(type));
  }

  return (
    // 배경 (Dimmed Layer): 투명도 애니메이션
    <div 
      className={`
        fixed inset-0 z-50 flex items-end
        transition-colors duration-300
        ${isVisible ? "bg-black/50" : "bg-black/0"} 
      `}
    >
      {/* 바텀 시트 (Bottom Sheet): 위아래 슬라이드 애니메이션 */}
      <div 
        className={`
          bg-white w-full rounded-t-[20px] p-6 pb-10
          transform transition-transform duration-300 ease-out
          ${isVisible ? "translate-y-0" : "translate-y-full"} 
        `}
      >
        <div className="text-2xl font-semibold mb-6">
          서비스 이용을 위해
          <br /> 
          약관 동의가 필요합니다.
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {agreements.map((term) => {
            if (!term.type) return null;
            return (
              <div key={term.agreementId} className="flex justify-between items-center">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => onToggle(term.type!)}
                >
                  <img 
                    src={checked[term.type] ? checkbutton : uncheckbutton} 
                    className="w-5 h-5" 
                    alt="checkbox"
                  />
                  <span className="text-[16px] text-gray-800">
                    {TERM_TITLES[term.type]}
                  </span>
                </div>

                <img
                  src={detailbutton}
                  className="w-6 h-6 cursor-pointer"
                  alt="detail"
                  // 상세 보기 클릭 시 애니메이션 적용
                  onClick={() => handleOpenTermClick(term.type!)} 
                />
              </div>
            );
          })}
        </div>

        <div
          onClick={onToggleAll}
          className="flex items-center gap-2 text-[18px] font-bold mb-6 cursor-pointer pt-4"
        >
          <img 
            src={Object.values(checked).every(Boolean) ? allcheckbutton : unallcheckbutton} 
            className="w-6 h-6" 
            alt="all check"
          />
          <span>모든 이용약관에 동의합니다.</span>
        </div>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <button
          onClick={handleConfirmClick} // 여기서 애니메이션 핸들러 연결
          className={`
            text-[18px] w-full h-14 rounded-2xl font-bold transition-colors
            ${!isMissingRequired
              ? "bg-[#fc3367] text-white" 
              : "bg-gray-200 text-gray-400"}
          `}
        >
          확인
        </button>
      </div>
    </div>
  );
}