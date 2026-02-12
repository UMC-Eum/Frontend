interface ReportModalProps {
  isOpen: boolean;
  isBlocked: boolean;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
  onLeave: () => void;
}

export function ReportModal({
  isOpen,
  isBlocked,
  onClose,
  onReport,
  onBlock,
  onLeave,
}: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="flex flex-col justify-center items-center w-full z-10 animate-slide-up">
        <div className="relative w-full max-w-[90%] bg-white rounded-[14px] flex flex-col overflow-hidden">
          <div className="flex flex-col">
            <button
              onClick={() => {
                onReport();
                onClose();
              }}
              className="py-4 text-[18px] font-medium text-gray-900 border-b border-gray-100 active:bg-gray-50"
            >
              신고
            </button>

            <button
              onClick={() => {
                onBlock();
                onClose();
              }}
              className="py-4 text-[18px] font-medium text-gray-900 border-b border-gray-100 active:bg-gray-50"
            >
              {isBlocked ? "차단 해제" : "차단"}
            </button>

            <button
              onClick={() => {
                onLeave();
                onClose();
              }}
              className="py-4 text-[18px] font-medium text-[#EF0707] active:bg-gray-50"
            >
              나가기
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-[90%] mt-3 mb-8 bg-white rounded-[14px] flex flex-col justify-center items-center overflow-hidden">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-[18px] font-medium text-gray-900 active:bg-gray-50"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
