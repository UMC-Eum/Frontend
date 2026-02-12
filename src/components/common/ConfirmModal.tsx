interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean; // 빨간 버튼(위험한 작업) 여부
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "예",
  cancelText = "아니요",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
      {/* 배경 (클릭 시 닫힘 방지하려면 onClick 제거) */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      
      {/* 모달 박스 */}
      <div className="relative bg-white rounded-[16px] p-6 w-full max-w-[300px] flex flex-col items-center text-center shadow-lg animate-fade-in-up">
        
        {/* 제목 */}
        <h3 className="text-[18px] font-bold text-[#111] mb-2">
          {title}
        </h3>
        
        {/* 설명 */}
        <p className="text-[14px] text-[#666] leading-relaxed mb-6 break-keep">
          {description}
        </p>

        {/* 버튼 영역 */}
        <div className="flex gap-3 w-full">
          {/* 취소 버튼 */}
          <button
            onClick={onCancel}
            className="flex-1 h-[48px] rounded-[12px] bg-[#F2F4F6] text-[#666] font-semibold text-[15px]"
          >
            {cancelText}
          </button>

          {/* 확인 버튼  */}
          <button
            onClick={onConfirm}
            className={`flex-1 h-[48px] rounded-[12px] font-semibold text-[15px] text-white bg-[#FC3367]`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}