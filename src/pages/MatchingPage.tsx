import { useEffect, useRef, useState } from "react"; // ✅ useState 추가
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

import { useMicRecording } from "../hooks/useMicRecording";
import RecordingControl from "../components/RecordingControl";
import { mockAnalyzeVoice } from "../mock/mockApi";

const MatchingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isResultPage = location.pathname.includes("result");

  // ✅ [테스트용] 녹음 파일 URL 상태 추가
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  // 1️⃣ [가짜 API 연동]
  const { mutate: simulateAnalysis } = useMutation({
    mutationFn: mockAnalyzeVoice,
    onSuccess: (data) => {
      console.log("🎉 분석 완료! 결과 데이터:", data);
      navigate("/matching/result", { state: { result: data } });
    },
  });

  // 2️⃣ [훅 연결]
  const { status, setStatus, seconds, isShort, handleMicClick, resetStatus } =
    useMicRecording((file: File) => {
      console.log("🎤 녹음된 파일 생성됨:", file);

      // ✅ [테스트 로직] 브라우저 가상 URL 생성
      const url = URL.createObjectURL(file);
      setRecordedUrl(url); // 화면에 표시하기 위해 상태 저장
      console.log("🎧 녹음 파일 들어보기 링크:", url);

      simulateAnalysis();
    });

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
      {/* ✅ [테스트 UI] 녹음된 파일이 있으면 플레이어 표시 (개발 중에만 사용하세요) */}
      {recordedUrl && (
        <div className="absolute top-0 left-0 z-50 w-full bg-yellow-100 p-2 text-xs border-b border-yellow-300">
          <p className="font-bold mb-1">📢 녹음 테스트 (배포 전 삭제)</p>
          <audio controls src={recordedUrl} className="w-full h-8 mb-1" />
          <a
            href={recordedUrl}
            download="test_record.webm"
            className="underline text-blue-600"
          >
            파일 다운로드하기
          </a>
        </div>
      )}

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
