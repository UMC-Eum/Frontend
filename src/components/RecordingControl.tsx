import { motion } from "framer-motion";
import MicButton from "./MicButton";
import { MicStatus } from "../hooks/useMicRecording";

interface RecordingControlProps {
  status: MicStatus;
  seconds: number;
  isShort: boolean;
  isResultPage: boolean;
  onMicClick: () => void;
  formatTime: (sec: number) => string;
}

const RecordingControl = ({
  status,
  seconds,
  isShort,
  isResultPage,
  onMicClick,
  formatTime,
}: RecordingControlProps) => {
  return (
    <div className="absolute left-1/2 bottom-[40px] -translate-x-1/2 flex flex-col items-center gap-[12px]">
      {/* 1. 짧음 알림 메시지 */}
      {isShort && (
        <div className="flex w-[232px] h-[36px] bg-pink-100 items-center justify-center rounded-[7px]">
          <p className="text-[14px] font-[500] text-[#FF88A6]">
            너무 짧아요! 10초 이상 말해주세요!
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
          className="outline-none select-none touch-manipulation"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <MicButton status={status} />
        </button>
      </div>
    </div>
  );
};

export default RecordingControl;
