import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "../components/BackButton";
import MicButton from "../components/MicButton";

type MicStatus = "inactive" | "recording" | "loading";

const MatchingPage = () => {
  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [showTooShortNotice, setShowTooShortNotice] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // URL을 확인하여 현재 결과 페이지인지 체크
  const isResultPage = location.pathname.includes("result");

  // 녹음 타이머 로직
  useEffect(() => {
    if (status !== "recording") return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // 3초 뒤 결과 페이지로 이동 (API 호출 시뮬레이션)
  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => {
        navigate("/matching/result");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  // 새로고침 시 URL이 result면 status를 loading 상태로 동기화 (UI 유지용)
  useEffect(() => {
    if (isResultPage) {
      setStatus("loading");
    }
  }, [isResultPage]);

  const handleMicClick = () => {
    if (status === "recording") {
      if (seconds < 10) {
        setShowTooShortNotice(true);
        return;
      }
      setStatus("loading");
      setSeconds(0);
      setShowTooShortNotice(false);
      return;
    }

    if (status === "inactive") {
      setStatus("recording");
      setSeconds(0);
      setShowTooShortNotice(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="relative h-screen mx-[20px] overflow-hidden">
      {/* --- 배경: 매칭 중 페이지 UI --- */}
      <div className="mt-[5px]">
        <BackButton />
      </div>
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
              onClick={() => setStatus("inactive")}
              className="bg-pink-200 px-2 py-1 rounded-md text-sm mt-2"
            >
              재녹음
            </button>
          </>
        )}
        {(status === "loading" || isResultPage) && (
          <h1 className="text-[28px] font-[700] leading-[140%] text-[#202020]">
            ~~님의
            <br />
            이상형을 찾는 중이에요 ...
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

      {/* 하단 버튼 영역 */}
      <div className="absolute left-1/2 bottom-[40px] -translate-x-1/2 flex flex-col items-center gap-[12px]">
        {showTooShortNotice && (
          <div className="flex w-[232px] h-[36px] bg-pink-100 items-center justify-center rounded-[7px]">
            <p className="text-[14px] font-[500] text-[#FF88A6]">
              너무 짧아요! 10초 이상 말해주세요!
            </p>
          </div>
        )}

        {status === "recording" && (
          <div className="text-[18px] font-[500] text-[#FC3367] tabular-nums">
            {formatTime(seconds)}
          </div>
        )}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="
    absolute
    w-[120px] h-[120px]
    rounded-full
    blur-xl
    bg-[radial-gradient(circle,_rgba(252,51,103,0.7)_0%,_rgba(252,51,103,0.3)_45%,_transparent_60%)]
  "
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <button
            onClick={handleMicClick}
            disabled={status === "loading" || isResultPage}
          >
            <MicButton status={status} />
          </button>
        </div>
      </div>

      {/* --- 슬라이드 레이어: 결과 페이지 --- */}
      <AnimatePresence mode="wait">
        {isResultPage && (
          <motion.div
            key="matching-result-layer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-white"
          >
            {/* 이 Outlet 자리에 App.tsx에서 설정한 result 컴포넌트가 렌더링됨 */}
            <Outlet />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchingPage;
