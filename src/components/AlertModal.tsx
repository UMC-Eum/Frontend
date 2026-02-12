import { useState } from "react";

export default function AlertModal({ onClose }: { onClose: () => void }) {
  const [pressed, setPressed] = useState(false);

  const handleConfirm = () => {
    setPressed(true);

    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-[256px] overflow-hidden rounded-[14px] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
        <div className="px-4 pt-4 pb-3 text-center">
          <h2 className="text-[17px] font-semibold">가입대상이 아닙니다.</h2>
          <p className="text-[13px]">이음은 만 50세 이상부터 이용가능합니다.</p>
        </div>
        <div className="h-[0.5px] w-full bg-[rgba(60,60,67,0.36)]" />
        <button
          onClick={handleConfirm}
          className={`h-[44px] w-full text-[17px] text-[#FC3367] transition-colors duration-150 ${
            pressed ? "bg-[#FFE2E9]" : "bg-white"
          }`}
        >
          확인
        </button>
      </div>
    </div>
  );
}
