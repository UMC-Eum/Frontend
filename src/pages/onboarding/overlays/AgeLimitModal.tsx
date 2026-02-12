interface Props {
  onClose: () => void;
}

export default function AgeLimitModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[65%] max-w-md rounded-2xl overflow-hidden text-center">
        <div className="px-2 py-4">
          <h2 className="text-[17px] font-semibold text-black">
            가입대상이 아닙니다.
          </h2>

          <p className="text-[13px] text-black leading-relaxed">
            이음은 만 50세 이상부터 이용 가능합니다.
          </p>
        </div>

        <div className="h-px bg-gray-200" />

        <button
          onClick={onClose}
          className="w-full h-10 text-[#fc3367] text-[17px]"
        >
          확인
        </button>
      </div>
    </div>
  );
}
