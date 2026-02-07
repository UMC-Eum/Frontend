import { motion } from "framer-motion";
import MicButton from "./MicButton";
import { MicStatus } from "../hooks/useMicRecording";

interface RecordingControlProps {
  status: MicStatus;
  seconds: number;
  isShort: boolean;
  isResultPage?: boolean;
  onMicClick: () => void;
  className?: string;
  isChat?: boolean; 
}

const RecordingControl = ({
  status,
  seconds,
  isShort,
  isChat = false,
  isResultPage = false,
  onMicClick,
  // 👇 부모에서 className을 주면 이 기본값(bottom-[40px])은 무시됩니다.
  className = "bottom-[40px] absolute flex flex-col items-center"
}: RecordingControlProps) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    // left-1/2 같은 공통 위치 속성은 남겨두고, className을 뒤에 붙입니다.
    <div className={`left-1/2 -translate-x-1/2 gap-[12px] z-50 ${className}`}>
      
      {/* 1. 짧음 알림 메시지 */}
      {isShort && (
        <div className="flex w-[232px] h-[36px] bg-pink-100 items-center justify-center rounded-[7px]">
          <p className="text-[14px] font-[500] text-[#FF88A6]">
            {isChat ? "음성 메세지를 보냈습니다." : "너무 짧아요! 10초 이상 말해주세요!"}
          </p>
        </div>
      )}

      {/* 2. 녹음 타이머 */}
      {status === "recording" && (
        <div className="text-[18px] font-[500] text-[#FC3367] tabular-nums">
          {formatTime(seconds)}
        </div>
      )}

      <div
        className="relative flex items-center justify-center"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <motion.div
          className="pointer-events-none absolute w-[80px] h-[80px] rounded-full"
          style={{
            borderRadius: "50%",
            boxShadow: "0 0 30px 10px rgba(252, 51, 103, 0.5)",
            background: "transparent",
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: [0, 1, 0], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        <button
          onClick={onMicClick}
          disabled={status === "loading" || isResultPage}
          className="w-[90px] h-[90px] flex items-center justify-center rounded-full"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <MicButton status={status} />
        </button>
      </div>
    </div>
  );
};

export default RecordingControl;