import { useEffect, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useMicRecording } from "../hooks/useMicRecording";
import { processVoiceAnalysis } from "../service/voiceService";
import RecordingControl from "../components/RecordingControl";
import { useUserStore } from "../stores/useUserStore";
import BackButton from "../components/BackButton";
const MatchingPage = () => {
  const nickname = useUserStore((state) => state.user?.nickname);
  const updateIdealKeywords = useUserStore(
    (state) => state.updateIdealKeywords,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isResultPage = location.pathname.includes("result");

  // 1. API 요청 설정 (Mutation)
  // 녹음 파일이 생기면 이 함수(analyze)를 실행해서 서버로 보냅니다.
  const { mutate: analyze } = useMutation({
    mutationFn: (file: File) => processVoiceAnalysis({ file }), // 임시 userId
    onSuccess: (data) => {
      console.log("분석 성공!", data);
      const keywords = data?.keywordCandidates?.map((k) => k.text) || [];

      // 2. 콘솔에 예쁘게 출력
      if (keywords.length > 0) {
        console.log("✨ 추출된 이상형 키워드들:", keywords.join(", "));
        // 테이블 형태로 보고 싶다면 아래 주석을 해제하세요
        // console.table(data.keywordsCandidates);
      } else {
        console.log("ℹ️ 추출된 키워드가 없습니다.");
      }

      // Zustand 업데이트 및 페이지 이동
      updateIdealKeywords(keywords);
      navigate("/matching/result", { state: { result: data } });
    },
    onError: (error) => {
      console.error(error);
      alert("분석에 실패했습니다. 다시 시도해주세요.");
    },
  });

  // 2. 마이크 훅 설정 (하나로 통합!)
  // 녹음이 끝나고 파일이 생성되면 -> analyze(file) 실행
  const { status, setStatus, seconds, isShort, handleMicClick, resetStatus } =
    useMicRecording((file) => {
      if (file) {
        analyze(file); // 👈 여기서 Mutation 실행!
      }
    });

  // 3. 결과 페이지 진입 시 상태 처리
  useEffect(() => {
    if (isResultPage) {
      setStatus("loading");
    }
  }, [isResultPage, setStatus]);

  return (
    <div className="relative h-full overflow-hidden">
      <BackButton />
      <div className="h-[10px]" />

      {/* 상단 텍스트 영역 */}
      <div className="h-[78px] px-[20px]">
        {status === "inactive" && !isResultPage && (
          <h1 className="text-[28px] font-[700] leading-[140%] text-[#202020]">
            {nickname || "guest"}님의
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
            {nickname}님의
            <br />
            이상형을 찾는 중이에요 ...
          </h1>
        )}
      </div>

      {status !== "loading" && !isResultPage && (
        <section className="text-gray-500 space-y-[12px] mt-8 px-[20px]">
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
