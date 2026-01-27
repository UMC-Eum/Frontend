import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

// 경로에 맞게 import 확인해주세요
import { MicStatus } from "../../hooks/useMicRecording";
import RecordingControl from "../../components/RecordingControl";
import { mockAnalyzeVoice } from "../../mock/mockApi";
import { useUserStore } from "../../stores/useUserStore";

// ✅ 인터페이스 이름 수정
interface SpeechKeywordProps {
  // 부모에게 데이터를 넘길 수도 있고, 스토어에 저장 후 그냥 넘어갈 수도 있습니다.
  // 여기서는 기존 코드를 존중하여 데이터를 넘기도록 유지했습니다.
  onNext: (rec: { record: string; keywords: string[] }) => void;
}

export default function SpeechKeyword({ onNext }: SpeechKeywordProps) {
  const location = useLocation();
  const isResultPage = location.pathname.includes("result");

  // ✅ 스토어에서 유저 정보와 업데이트 함수 가져오기
  const { user, updateUser } = useUserStore();

  // ✅ 닉네임 가져오기 (없으면 기본값 '회원')
  const name = user?.nickname || "회원";

  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  const { mutate: simulateAnalysis } = useMutation({
    mutationFn: mockAnalyzeVoice,
    onSuccess: () => {
      const mockResult = {
        record: "가짜녹음파일.webm",
        keywords: ["열정적인", "성실한", "등산"], // Mock 데이터 예시
      };

      updateUser({
        introAudioUrl: mockResult.record,
        keywords: mockResult.keywords,
      });

      // ✅ 2. 다음 단계로 이동 (부모 컴포넌트 처리)
      onNext(mockResult);
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
      const tooShort = seconds < 3; // 10초는 테스트하기 너무 기니까 3초 정도로 조정 추천

      if (tooShort) {
        setIsShort(true);
        setTimeout(() => setIsShort(false), 2000);
      } else {
        setIsShort(false);
        setStatus("loading");

        // 분석 시뮬레이션 시작
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

  const RenderRecordingControl = (
    <RecordingControl
      status={status}
      seconds={seconds}
      isShort={isShort}
      isResultPage={isResultPage}
      onMicClick={handleMicClick}
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
    // 4초 뒤에 텍스트가 위로 올라가는 애니메이션
    const timer = setTimeout(() => {
      setIsTop(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        .guide-container {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: absolute;
          width: 100%;
          left: 0; /* absolute일 때 위치 잡기 위해 추가 */
          padding-left: 0.5rem; /* px-2에 맞춤 */
          padding-right: 0.5rem;
        }
        .position-center {
          top: 45%;
          transform: translateY(-50%);
        }
        .position-top {
          top: 20px;
          transform: translateY(0);
        }
      `}</style>

      <div
        className={`guide-container ${
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
        className={`transition-opacity duration-500 h-full ${
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
      <div className="mt-5 mb-5 absolute w-full top-[20px] px-2 left-0">
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
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-pink-100"></div>
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
      <div className="mt-5 mb-5 absolute w-full top-[20px] px-2 left-0">
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
