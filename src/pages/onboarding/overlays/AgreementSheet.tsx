import { useState, useEffect } from "react";
import {
  IAgreementItem,
  AgreementType,
} from "../../../types/api/agreements/agreementsDTO";

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

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isRequired = (type?: AgreementType) =>
    type === "POLICY" || type === "PERSONAL_INFORMATION";
  const isMissingRequired = agreements.some(
    (t) => t.type && isRequired(t.type) && !checked[t.type],
  );

  const handleCloseAnimation = (callback: () => void) => {
    setIsVisible(false);
    setTimeout(() => {
      callback();
    }, 300);
  };

  const handleConfirmClick = () => {
    if (isMissingRequired) {
      setError("필수 약관에 모두 동의해주세요.");
      return;
    }
    setError("");

    handleCloseAnimation(onConfirm);
  };

  const handleOpenTermClick = (type: AgreementType) => {
    handleCloseAnimation(() => onOpenTerm(type));
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-end
        transition-colors duration-300
        ${isVisible ? "bg-black/50" : "bg-black/0"} 
      `}
    >
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
              <div
                key={term.agreementId}
                className="flex justify-between items-center"
              >
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
            src={
              Object.values(checked).every(Boolean)
                ? allcheckbutton
                : unallcheckbutton
            }
            className="w-6 h-6"
            alt="all check"
          />
          <span>모든 이용약관에 동의합니다.</span>
        </div>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <button
          onClick={handleConfirmClick}
          className={`
            text-[18px] w-full h-14 rounded-2xl font-bold transition-colors
            ${
              !isMissingRequired
                ? "bg-[#fc3367] text-white"
                : "bg-gray-200 text-gray-400"
            }
          `}
        >
          확인
        </button>
      </div>
    </div>
  );
}
