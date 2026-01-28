import { useState } from "react";
import { IAgreementItem, AgreementType } from "../../../types/api/agreements/agreementsDTO";

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

  // ✅ 필수 여부 판단 헬퍼 (IAgreementItem에 required 필드가 없으므로 type으로 판단)
  const isRequired = (type?: AgreementType) => type === "POLICY" || type === "PERSONAL_INFORMATION";

  // ✅ 필수 약관 중 하나라도 체크되지 않았는지 확인
  const isMissingRequired = agreements.some(
    (t) => t.type && isRequired(t.type) && !checked[t.type]
  );

  const handleConfirm = () => {
    if (isMissingRequired) {
      setError("필수 약관에 모두 동의해주세요.");
      return;
    }
    setError("");
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-[20px] p-6 pb-10">
        <div className="text-2xl font-semibold mb-6">
          서비스 이용을 위해
          <br /> 
          약관 동의가 필요합니다.
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {agreements.map((term) => {
            // type이 없는 경우 렌더링하지 않거나 기본값 처리
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
                  onClick={() => onOpenTerm(term.type!)}
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
          onClick={handleConfirm}
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