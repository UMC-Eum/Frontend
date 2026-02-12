import { RecordButton } from "./standard/Record";
import { MicStatus } from "../hooks/useMicRecording";
import { GuideTooltip, GuideBar } from "./standard/SystemMessage";

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
  className = "" 
}: RecordingControlProps) => {

  return (
    <div className={`z-50 flex flex-col items-center ${className}`}>
      
      {/* 1. 가이드 메시지 영역 (마이너스 마진으로 타이머 공간 상쇄) */}
      <div className={`flex items-center justify-center transition-all duration-200 ${
        (isShort && status !== "loading") || status === "recording" ? "mb-[24px]" : "mb-[-15px]"
      }`}>
        {isShort && status !== "loading" ? (
          <GuideBar content={isChat ? "음성 메세지를 보냈습니다." : "너무 짧아요! 10초 이상 말해주세요!"} />
        ) : status === "recording" ? (
          <GuideBar content="녹음을 멈추고 싶으면 버튼을 한번 더 눌러주세요!" />
        ) : status === "inactive" ? (
          <GuideTooltip content="버튼을 누른 뒤 말해주세요!" />
        ) : null}
      </div>

      {/* 2. 표준 레코드 버튼 (타이머 포함) */}
      <RecordButton 
        status={status} 
        seconds={seconds} 
        onClick={onMicClick}
        disabled={status === "loading" || isResultPage}
      />
    </div>
  );
};

export default RecordingControl;