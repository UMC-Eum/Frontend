interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
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
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      <div className="relative bg-white rounded-[16px] p-6 w-full max-w-[300px] flex flex-col items-center text-center shadow-lg animate-fade-in-up">
        <h3 className="text-[18px] font-bold text-[#111] mb-2">{title}</h3>

        <p className="text-[14px] text-[#666] leading-relaxed mb-6 break-keep">
          {description}
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 h-[48px] rounded-[12px] bg-[#F2F4F6] text-[#666] font-semibold text-[15px]"
          >
            {cancelText}
          </button>

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
