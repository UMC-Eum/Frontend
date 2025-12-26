import BackButton from "../components/BackButton";
import MicButton from "../components/MicButton";
import { useEffect, useState } from "react";
type MicStatus = "inactive" | "recording" | "loading";
const MatchingPage = () => {
  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [showTooShortNotice, setShowTooShortNotice] = useState(false);

  useEffect(() => {
    if (status !== "recording") return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const handleMicClick = () => {
    // 🎙 녹음 중일 때
    if (status === "recording") {
      // ❗ 10초 미만 → 안내만
      if (seconds < 10) {
        setShowTooShortNotice(true);
        return;
      }

      // ✅ 10초 이상 → 로딩으로 전환
      setStatus("loading");
      setSeconds(0);
      setShowTooShortNotice(false);
      return;
    }

    // ▶️ 비활성 → 녹음 시작
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
    <div className="relative h-screen mx-[20px]">
      <div className="mt-[5px]">
        <BackButton />
      </div>
      <div className="h-[102px]">
        {status === "inactive" && (
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
              className="bg-pink-200"
            >
              재녹음
            </button>
          </>
        )}

        {status === "loading" && (
          <h1 className="text-[28px] font-[700] leading-[140%] text-[#202020]">
            ~~님의
            <br />
            이상형을 찾는 중이에요 ...
          </h1>
        )}
      </div>

      {status !== "loading" && (
        <section className="text-gray-500 space-y-[12px]">
          <p>이렇게 말해도 좋아요!</p>
          <p>비슷한 나이대의 조용한 사람이 좋아요.</p>
          <p>술은 많이 안 마셨으면 좋겠어요.</p>
          <p>대화는 자주 하는 편이면 좋겠어요.</p>
        </section>
      )}
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

        <button onClick={handleMicClick} disabled={status === "loading"}>
          <MicButton status={status} />
        </button>
      </div>
    </div>
  );
};

export default MatchingPage;
