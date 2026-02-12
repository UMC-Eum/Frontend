import { useState } from "react";
import BackButton from "../BackButton";

interface ReportScreenProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  onReport: (reason: string, description: string) => Promise<void>;
}

const REPORT_CATEGORIES = [
  { code: "INAPPROPRIATE", label: "불쾌하거나 부적절한 발언" },
  { code: "SEXUAL", label: "성희롱 / 성적 표현" },
  { code: "FRAUD", label: "사기 / 금전 요구" },
  { code: "ABUSIVE", label: "욕설 / 비하 / 혐오" },
  { code: "SPAM", label: "스팸 / 광고" },
  { code: "OTHER", label: "기타" },
];

export default function ReportScreen({
  isOpen,
  onClose,
  targetName,
  onReport,
}: ReportScreenProps) {
  const [step, setStep] = useState<"FORM" | "SUCCESS">("FORM");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  const handleClose = () => {
    setStep("FORM");
    setSelectedCode(null);
    setCustomReason("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedCode) return;

    try {
      await onReport(selectedCode, customReason);
      setStep("SUCCESS");
    } catch (error) {
      console.error(error);
      alert("신고 처리에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in-right">
      {step === "FORM" && (
        <>
          <header className="h-[50px] flex justify-start items-center">
            <div>
              <BackButton />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-2 ">
            <h2 className="text-[24px] font-semibold text-[#111] leading-tight mb-8">
              {targetName}님을 신고하려는
              <br />
              이유를 선택해주세요.
            </h2>

            <div className="flex flex-col gap-0">
              {REPORT_CATEGORIES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => setSelectedCode(item.code)}
                  className={`py-4 text-left text-[18px] border-t border-gray-300 transition-colors
                    ${selectedCode === item.code ? "text-[#FC3367] font-semibold" : "text-gray-500"}
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <textarea
                className="w-full h-[120px] bg-[#F7F8F9] rounded-[12px] p-4 text-[14px] outline-1 outline-gray-300 resize-none placeholder:text-[#ADB5BD]"
                placeholder="신고 내용을 입력해주세요."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={300}
              />
              <div className="text-right text-[12px] text-[#ADB5BD] mt-1">
                {customReason.length}/300
              </div>
            </div>
          </div>

          <div className="p-4 pb-8 mb-5">
            <button
              disabled={!selectedCode}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-[14px] font-bold text-[16px] text-white transition-colors
                ${selectedCode ? "bg-[#FC3367] text-white" : "bg-[#DEE3E5] text-[#A6AFB6]"} 
              `}
            >
              신고하기
            </button>
          </div>
        </>
      )}

      {step === "SUCCESS" && (
        <>
          <header className="h-[50px] flex items-center px-4">
            <button onClick={handleClose} className="-ml-2 p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 19L8 12L15 5"
                  stroke="#111"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-8 text-center">
            <div className="w-[80px] h-[80px] rounded-full bg-[#FC3367] flex items-center justify-center mb-6 shadow-lg animate-bounce-short">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h2 className="text-[24px] font-semibold text-[#111] mb-3">
              신고 되었어요.
            </h2>
            <p className="text-[18px] text-[#636970] leading-relaxed break-keep">
              더 나은 이음을 위해 신고해주셔서 감사해요
              <br />
              신고된 내용은 검토하여 조치할 예정이에요.
            </p>
          </div>

          <div className="p-4 pb-8 mb-5">
            <button
              onClick={handleClose}
              className="w-full py-4 rounded-[14px] bg-[#FC3367] font-bold text-[18px] text-white"
            >
              닫기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
