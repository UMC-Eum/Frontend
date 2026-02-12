import React, { forwardRef } from 'react';
import InactiveMic from '../InactiveMic';
import RecordingMic from '../RecordingMic';
import LoadingMic from '../LoadingMic';
import { motion } from 'framer-motion';
//버튼 그대로 상속
interface RecordButtonProps extends React.ComponentPropsWithoutRef<'button'> {
    status: 'inactive' | 'recording' | 'loading';
    seconds: number;
}

/******************************
 * RecordButton
 * 
 * 구현 의도
 * - 해당 컴포넌트는 시간 표시까지 공간을 점유
 * - 메시지 표시는 컴포넌트를 표시하는 쪽에서 처리(상황마다 메시지 필요 여부가 다를 수 있어서)
 * *****************************/

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
        // 시간 표시+버튼 감싸는 div (className은 여기 적용)
        <div className={`
            flex items-center 
            flex-col gap-[17px] 
            ${className}`}>
            {/* 시간 표시 */}
            <span className={`
                text-[18px] font-[500] text-[#FC3367] tabular-nums
                
                ${/*공간만 차지하기 위해 투명도 사용*/
                    status === "recording" ? "opacity-100" : "opacity-0"}`}>
                {formatTime(seconds)}
            </span>
            {/* 버튼 */}
            <button
                ref={ref}
                className={`
                    relative
                    w-[80px] h-[80px]
                    flex items-center justify-center
                    rounded-full`}
                {...props}
            >
                {/* 핑크색 빛나는 원 (애니메이션) */}
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
                {/* 마이크 아이콘 */}
                <div className="relative z-10">
                    {status === "inactive" && <InactiveMic />}
                    {status === "recording" && <RecordingMic />}
                    {status === "loading" && <LoadingMic />}
                </div>
            </button>
        </div>
    );
  }
);

export { RecordButton };