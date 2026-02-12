import React, { forwardRef } from "react";
import InactiveMic from "../InactiveMic";
import RecordingMic from "../RecordingMic";
import LoadingMic from "../LoadingMic";
import { motion } from "framer-motion";
interface RecordButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  status: "inactive" | "recording" | "loading";
  seconds: number;
}

const RecordButton = forwardRef<HTMLButtonElement, RecordButtonProps>(
  ({ className, status, seconds, ...props }, ref) => {
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
      const s = (sec % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };
    return (
      <div
        className={`
            flex items-center 
            flex-col gap-[17px] 
            ${className}`}
      >
        <span
          className={`
                text-[18px] font-[500] text-[#FC3367] tabular-nums
                
                ${status === "recording" ? "opacity-100" : "opacity-0"}`}
        >
          {formatTime(seconds)}
        </span>
        <button
          ref={ref}
          className={`
                    relative
                    w-[80px] h-[80px]
                    flex items-center justify-center
                    rounded-full`}
          {...props}
        >
          <motion.div
            className="
                        pointer-events-none 
                        absolute inset-0 m-auto
                        w-full h-full
                        rounded-full"
            style={{
              borderRadius: "50%",
              boxShadow: "0 0 30px 10px rgba(252, 51, 103, 0.5)",
              background: "transparent",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 1, 0], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10">
            {status === "inactive" && <InactiveMic />}
            {status === "recording" && <RecordingMic />}
            {status === "loading" && <LoadingMic />}
          </div>
        </button>
      </div>
    );
  },
);

export { RecordButton };
