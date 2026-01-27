interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlockAction: () => void; // 👈 추가: 신고/차단 눌렀을 때 (경고창 O)
  onJustExit: () => void;    // 👈 추가: 그냥 나가기 눌렀을 때 (경고창 X)
}

export function ReportModal({ isOpen, onClose, onBlockAction, onJustExit }: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      {/* 모달 */}
      <div className="flex flex-col justify-center items-center w-full">
        <div className="relative w-full max-w-[90%] bg-white rounded-[14px] z-10 flex flex-col">
          <div className="flex flex-col">
            {/* 👇 신고: 차단과 동일하게 경고창을 띄우기 위해 onBlockAction 연결 */}
            <button 
              onClick={onBlockAction}
              className="py-4 text-[18px] font-medium text-gray-900 border-b border-gray-100"
            >
              신고
            </button>
            
            {/* 👇 차단: 경고창을 띄워야 하므로 onBlockAction 연결 */}
            <button 
              onClick={onBlockAction}
              className="py-4 text-[18px] font-medium text-gray-900 border-b border-gray-100">
              차단
            </button>

            {/* 👇 나가기: 경고 없이 바로 나가야 하므로 onJustExit 연결 */}
            <button 
              onClick={onJustExit}
              className="py-4 text-[18px] font-medium text-[#EF0707]"
            >
              나가기
            </button>
          </div>
        </div>
        <div className="relative w-full max-w-[90%] mt-3 mb-14 bg-white rounded-[14px] flex flex-col justify-center items-center">
          <div className="">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-white text-[18px] font-medium text-gray-900"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}