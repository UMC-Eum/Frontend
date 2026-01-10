import { useEffect, useState } from "react";
import { ProfileData } from "./ProfileSetupMain";

import { useMutation } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

import { MicStatus } from "../../hooks/useMicRecording";
import RecordingControl from "../../components/RecordingControl";
import { mockAnalyzeVoice } from "../../mock/mockApi";

interface SetGenderProps {
  onNext: (data: Partial<ProfileData>) => void;
  name: string;
}

export default function SpeechKeyword({ onNext, name }: SetGenderProps) {
  const location = useLocation();
  const isResultPage = location.pathname.includes("result");

  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  const { mutate: simulateAnalysis } = useMutation({
    mutationFn: mockAnalyzeVoice,
    onSuccess: () => {
      onNext({
        record: "가짜녹음파일.webm",
        keywords: [],
      });
    },
  });

  useEffect(() => {
    if (status !== "recording") return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleMicClick = () => {
    if (status === "inactive") {
      setStatus("recording");
      setSeconds(0);
      setIsShort(false);
      return;
    }

    if (status === "recording") {
      const tooShort = seconds < 10;

      if (tooShort) {
        setIsShort(true);
        setTimeout(() => setIsShort(false), 2000);
      } else {
        setIsShort(false);
        setStatus("loading");

        setTimeout(() => {
          simulateAnalysis();
        }, 1500);
      }
    }
  };

  useEffect(() => {
    if (isResultPage) {
      setStatus("loading");
    }
  }, [isResultPage]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const RenderRecordingControl = (
    <RecordingControl
      status={status}
      seconds={seconds}
      isShort={isShort}
      isResultPage={isResultPage}
      onMicClick={handleMicClick}
      formatTime={formatTime}
    />
  );

  return (
    <main className="flex-1 flex flex-col px-2 relative h-full">
      {status === "inactive" && (
        <WhenInactive name={name} RecordingControl={RenderRecordingControl} />
      )}
      {status === "recording" && (
        <WhenRecording name={name} RecordingControl={RenderRecordingControl} />
      )}
      {status === "loading" && (
        <Whenloading name={name} RecordingControl={RenderRecordingControl} />
      )}
    </main>
  );
}

type WhenInactiveProps = {
  name: string;
  RecordingControl: React.ReactNode;
};

function WhenInactive({ name, RecordingControl }: WhenInactiveProps) {
  const [isTop, setIsTop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTop(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 애니메이션 스타일 */}
      <style>{`
        .guide-container {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: absolute;
          width: 100%;
        }
        /* 중앙에 있을 때 */
        .position-center {
          top: 45%;
          transform: translateY(-50%);
        }
        /* 상단으로 올라갔을 때 */
        .position-top {
          top: 20px;
          transform: translateY(0);
        }
      `}</style>

      <div
        className={`mt-5 mb-5 guide-container ${
          isTop ? "position-top" : "position-center"
        }`}
      >
        <h1 className="text-[26px] font-bold text-black leading-tight">
          반갑습니다! {name}님. <br />
          {name}님의 이야기를 들려주세요.
        </h1>
        <p
          className={`text-gray-500 text-[15px] mt-2 transition-opacity duration-500 ${
            isTop ? "opacity-100" : "opacity-0"
          }`}
        >
          좋아하는 취미나 관심사, 일상에 대해 편하게 말해주세요.
        </p>
      </div>

      <div
        className={`transition-opacity duration-500 ${
          isTop ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute left-0 right-0 bottom-0 h-[210px] flex flex-col items-center pb-[12px]">
          <div className="pt-2 flex flex-col items-center">
            <div className="flex w-[232px] h-[36px] bg-pink-100 items-center justify-center rounded-[7px]">
              <p className="text-[14px] font-[500] text-[#FF88A6]">
                버튼을 누른 뒤 말해주세요!
              </p>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-pink-100"></div>
          </div>

          {RecordingControl}
        </div>
      </div>
    </>
  );
}

type WhenRecordingProps = {
  name: string;
  RecordingControl: React.ReactNode;
};

function WhenRecording({ name, RecordingControl }: WhenRecordingProps) {
  return (
    <>
      <div className="mt-5 mb-5 guide-container">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          {name}님의 이야기를 듣고있어요..
        </h1>
        <p className="text-gray-500 text-[15px] mt-2 transition-opacity duration-500">
          최대 60초 까지 녹음 가능해요!
        </p>
      </div>

      <div className="absolute left-0 right-0 bottom-0 h-[210px] flex flex-col items-center pb-[12px]">
        <div className="flex flex-col items-center">
          <div className="flex w-[300px] h-[36px] bg-pink-100 items-center justify-center rounded-[7px]">
            <p className="text-[14px] font-[500] text-[#FF88A6]">
              녹음을 멈추고 싶으면 버튼을 한번 더 눌러주세요!
            </p>
          </div>
        </div>

        {RecordingControl}
      </div>
    </>
  );
}

type WhenloadingProps = {
  name: string;
  RecordingControl: React.ReactNode;
};

function Whenloading({ name, RecordingControl }: WhenloadingProps) {
  return (
    <>
      <div className="mt-5 mb-5 guide-container">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          AI가 {name}님의 이야기를 <br />
          정리하고있어요!
        </h1>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative w-full h-[140px]">{RecordingControl}</div>
      </div>
    </>
  );
}
