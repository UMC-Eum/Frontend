import { useState } from "react";
import ToastNotification from "../components/common/ToastNotification";

export default function ToastTestPage() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  return (
    <div className="p-10 flex flex-col gap-5 items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold">토스트 UI 실험실 🧪</h1>

      {/* 테스트 버튼들 */}
      <div className="flex gap-2">
        <button 
          onClick={() => setToastMsg("차단이 해제되었어요.")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          1. 차단 해제 메시지
        </button>

        <button 
          onClick={() => setToastMsg("홍길동님을 차단했어요.")}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          2. 차단 완료 메시지
        </button>
        
        <button 
          onClick={() => setToastMsg(null)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          3. 끄기
        </button>
      </div>

      {/* 🔥 [핵심] duration을 엄청 길게 줘서 안 사라지게 만들기 */}
      <ToastNotification 
        message={toastMsg}
        isVisible={!!toastMsg}
        onClose={() => setToastMsg(null)}
        duration={99999999} // 👈 이렇게 하면 새로고침 전까진 절대 안 사라짐!
      />
    </div>
  );
}