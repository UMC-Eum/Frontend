import { useEffect, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

import { useMicRecording } from "../hooks/useMicRecording";
import { processVoiceAnalysis } from "../service/voiceService";
import { useUserStore } from "../stores/useUserStore";

import RecordingControl from "../components/RecordingControl";
import BackButton from "../components/BackButton";
import { putIdealPersonalities } from "../api/users/usersApi";

const MatchingPage = () => {
  const user = useUserStore((state) => state.user);
  const updateStore = useUserStore((state) => state.updateUser);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isResultPage = location.pathname.includes("result");

  const { mutate: analyze } = useMutation({
    mutationFn: (file: File) =>
      processVoiceAnalysis({ file, analysisType: "ideal-type" }),

    onSuccess: async (data) => {
      const newIdealPersonalities =
        data?.keywordCandidates?.personalities.map((k: any) => k.text) || [];

      if (newIdealPersonalities.length > 0) {
        try {
          await putIdealPersonalities({
            personalityKeywords: newIdealPersonalities,
          } as any);

          updateStore({ idealPersonalities: newIdealPersonalities });

          navigate("/matching/result", { state: { result: data } });
        } catch (error) {
          console.error("서버 오류 발생 (로그 확인 필요):", error);
          alert(
            "결과 저장 중 서버 오류가 발생했지만, 분석 결과 페이지로 이동합니다.",
          );
          navigate("/matching/result", { state: { result: data } });
        }
      } else {
        navigate("/matching/result", { state: { result: data } });
      }
    },
    onError: (error) => {
      console.error("분석 실패:", error);
      alert("분석에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const { status, setStatus, seconds, isShort, handleMicClick } =
    useMicRecording((file) => {
      if (file) {
        analyze(file);
      }
    });

  useEffect(() => {
    if (isResultPage) {
      setStatus("loading");
    }
  }, [isResultPage, setStatus]);

  return (
    <div className="relative h-full overflow-hidden">
      <BackButton
        onClick={() => {
          navigate("/home");
        }}
      />
      <div className="h-[10px]" />

      <div className="h-[78px] px-[20px]">
        {status === "inactive" && !isResultPage && (
          <h1 className="text-[28px] font-[700] leading-[140%] text-[#202020]">
            {user?.nickname || "guest"}님의
            <br />
            이상형을 이야기해주세요!
          </h1>
        )}
        {status === "recording" && (
          <h1 className="text-[28px] font-[700] leading-[140%] text-[#202020]">
            듣고 있어요 ...
          </h1>
        )}
        {(status === "loading" || isResultPage) && (
          <h1 className="text-[28px] font-[700] leading-[140%] text-[#202020]">
            {user?.nickname}님의
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

      {status === "loading" || isResultPage ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex flex-col items-center bottom-[-16px]">
            <RecordingControl
              status={status}
              seconds={seconds}
              isShort={isShort}
              isResultPage={isResultPage}
              onMicClick={handleMicClick}
            />
          </div>
        </div>
      ) : (
        <div className="absolute bottom-[74px] left-1/2 -translate-x-1/2 flex flex-col items-center">
          <RecordingControl
            status={status}
            seconds={seconds}
            isShort={isShort}
            isResultPage={isResultPage}
            onMicClick={handleMicClick}
          />
        </div>
      )}

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
