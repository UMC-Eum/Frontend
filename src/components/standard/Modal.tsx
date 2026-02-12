interface ConfirmModalProps {
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  title,
  content,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <div
      className="
            p-6
            w-[322px] min-h-[173px]
            bg-white
            rounded-[14px]
            flex flex-col gap-[22px]
            "
    >
      <div
        className="overflow-hidden 
                flex-1
                flex flex-col gap-[12px]"
      >
        <p className="text-[20px] font-semibold">{title}</p>
        <p className="text-[14px] font-medium text-[#636970]">{content}</p>
      </div>
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="
                    w-[131px] h-[50px]
                    rounded-[7px]
                    bg-[#E9ECED]
                    text-[18px] font-semibold text-[#636970]
                "
        >
          아니요
        </button>
        <button
          onClick={onConfirm}
          className="
                    w-[131px] h-[50px]
                    rounded-[7px]
                    bg-[#FC3367]
                    text-[18px] font-semibold text-white
                "
        >
          예
        </button>
      </div>
    </div>
  );
};

export { ConfirmModal };
