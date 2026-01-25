interface ReportModalProps {
  isOpen: boolean;
  isBlocked: boolean; // 👈 [추가] 현재 차단 상태
  onClose: () => void;
  onReport: () => void; // 👈 [추가] 신고하기 버튼 핸들러
  onBlock: () => void;  // 👈 [추가] 차단/해제 버튼 핸들러
  onLeave: () => void;  // 👈 [추가] 나가기 버튼 핸들러
}

export function ReportModal({ isOpen, isBlocked, onClose, onReport, onBlock, onLeave }: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="flex flex-col justify-center items-center w-full z-10">
        <div className="relative w-full max-w-[90%] bg-white rounded-[14px] flex flex-col overflow-hidden">
          <div className="flex flex-col">
            
            {/* 1. 신고 버튼 */}
            <button 
              onClick={async(e) => {
                e.stopPropagation(); // 부모에게 클릭 이벤트 전달 중단
                try {
                    // 2. onReport()이 끝날 때까지 여기서 기다립니다.
                    await onReport(); 
                  } catch (error) {
                    console.error(error); // 혹시 에러나면 로그 찍기
                  } finally {
                    // 3. API가 성공하든 실패하든, 작업이 끝나면 그때 나갑니다.
                    onLeave(); 
                  }
                }
              }
              className="py-4 text-[18px] font-medium text-gray-900 border-b border-gray-100 active:bg-gray-50"
            >
              신고
            </button>
            
            {/* 2. 차단/해제 버튼 (상태에 따라 텍스트 변경) */}
            <button 
              onClick={async(e) => {
                e.stopPropagation(); // 부모에게 클릭 이벤트 전달 중단
                try {
      // 2. onBlock()이 끝날 때까지 여기서 기다립니다.
                  await onBlock(); 
                } catch (error) {
                  console.error(error); // 혹시 에러나면 로그 찍기
                } finally {
                  // 3. API가 성공하든 실패하든, 작업이 끝나면 그때 나갑니다.
                  onLeave(); 
                }
              }
              }
              className="py-4 text-[18px] font-medium text-gray-900 border-b border-gray-100 active:bg-gray-50">
              {isBlocked ? "차단 해제" : "차단"}
            </button>

            {/* 3. 나가기 버튼 */}
            <button 
              onClick={() => {
                onLeave();
                // onClose는 onLeave 내부 로직에 맡기거나 여기서 호출
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