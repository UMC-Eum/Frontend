import { useEffect, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query"; // ✅ React Query 추가

import { useMicRecording } from "../hooks/useMicRecording";
import RecordingControl from "../components/RecordingControl";
import { mockAnalyzeVoice } from "../mock/mockApi";

const MatchingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isResultPage = location.pathname.includes("result");

  // 1️⃣ [가짜 API 연동]
  // 녹음 파일은 받지만 가짜니까 안 쓰고, 그냥 2초 딜레이 주는 함수 실행
  const { mutate: simulateAnalysis } = useMutation({
    mutationFn: mockAnalyzeVoice,
    onSuccess: (data) => {
      console.log("🎉 분석 완료! 결과 데이터:", data);

      // 결과 페이지로 이동하면서 데이터(state)도 같이 넘겨줌
      navigate("/matching/result", { state: { result: data } });
    },
  });

  // 2️⃣ [훅 연결]
  // 녹음이 끝나면(File이 생성되면) -> 가짜 분석 시작(simulateAnalysis)
  const { status, setStatus, seconds, isShort, handleMicClick, resetStatus } =
    useMicRecording((file: File) => {
      console.log("🎤 녹음된 파일 생성됨:", file); // 실제 파일 확인용 로그
      simulateAnalysis(); // API 호출 시작!
    });

  // ... (이 아래 UI 코드는 기존과 완벽히 동일합니다) ...

  useEffect(() => {
    if (isResultPage) {
      setStatus("loading");
    }
  }, [isResultPage, setStatus]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="relative h-full px-[20px] overflow-hidden">
      <div className="h-[20px]" />
      <div className="h-[102px]">
        {status === "inactive" && !isResultPage && (
          <h1 className="text-[28px] font-[700] leading-[140%] text-[#202020]">
            ~~님의
            <br />
            이상형을 이야기해주세요!
          </h1>
        )}
        {status === "recording" && (
          <>
            <h1 className="text-[28px] font-[700] leading-[140%] text-[#202020]">
              듣고 있어요 ...
            </h1>
            <button
              onClick={resetStatus}
              className="bg-pink-200 px-2 py-1 rounded-md text-sm mt-2"
            >
              재녹음
            </button>
          </>
        )}
        {/* 로딩 상태 텍스트 표시 */}
        {(status === "loading" || isResultPage) && (
          <h1 className="text-[28px] font-[700] leading-[140%] text-[#202020]">
            ~~님의 목소리를
            <br />
            분석하고 있어요 ...
          </h1>
        )}
      </div>

      {status !== "loading" && !isResultPage && (
        <section className="text-gray-500 space-y-[12px] mt-8">
          <p>이렇게 말해도 좋아요!</p>
          <p>비슷한 나이대의 조용한 사람이 좋아요.</p>
          <p>술은 많이 안 마셨으면 좋겠어요.</p>
          <p>대화는 자주 하는 편이면 좋겠어요.</p>
        </section>
      )}

      <RecordingControl
        status={status}
        seconds={seconds}
        isShort={isShort}
        isResultPage={isResultPage}
        onMicClick={handleMicClick}
        formatTime={formatTime}
      />

      <AnimatePresence mode="wait">
        {isResultPage && (
          <motion.div
            key="matching-result-layer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            ref={scrollRef}
            className="absolute inset-0 z-50 bg-white overflow-y-auto overflow-x-hidden"
          >
            <Outlet context={{ scrollRef }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchingPage;
