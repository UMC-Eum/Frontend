interface ReportModalProps {
  isOpen: boolean;
  isBlocked: boolean; 
  onClose: () => void;
  onReport: () => void; 
  onBlock: () => void;  
  onLeave: () => void;  
}

export function ReportModal({ isOpen, isBlocked, onClose, onReport, onBlock, onLeave }: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="flex flex-col justify-center items-center w-full z-10 animate-slide-up">
        <div className="relative w-full max-w-[90%] bg-white rounded-[14px] flex flex-col overflow-hidden">
          <div className="flex flex-col">
            
            {/* 1. 신고 버튼 */}
            <button 
              onClick={() => {
                onReport(); // 1. 신고 화면 열기 요청
                onClose();  // 2. 이 메뉴 모달 닫기 (onLeave 아님!)
              }}
              className="py-4 text-[18px] font-medium text-gray-900 border-b border-gray-100 active:bg-gray-50"
            >
              신고
            </button>
            
            {/* 2. 차단/해제 버튼 */}
            <button 
              onClick={() => {
                onBlock(); // 1. 차단 확인 모달 열기 요청
                onClose(); // 2. 이 메뉴 모달 닫기 (onLeave 아님!)
              }}
              className="py-4 text-[18px] font-medium text-gray-900 border-b border-gray-100 active:bg-gray-50"
            >
              {isBlocked ? "차단 해제" : "차단"}
            </button>

            {/* 3. 나가기 버튼 (여기만 onLeave 사용) */}
            <button 
              onClick={() => {
                onLeave(); // 1. 나가기 확인 모달 열기 요청 (진짜 나가기)
                onClose(); // 2. 이 메뉴 모달 닫기
              }}
              className="py-4 text-[18px] font-medium text-[#EF0707] active:bg-gray-50"
            >
              나가기
            </button>
          </div>
        </div>

        {/* 취소 버튼 */}
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