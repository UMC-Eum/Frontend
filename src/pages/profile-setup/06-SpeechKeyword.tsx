import { useEffect, useState, useCallback } from "react";

// 경로에 맞게 import 확인해주세요
import { useMicRecording } from "../../hooks/useMicRecording";
import RecordingControl from "../../components/RecordingControl";
import { useUserStore } from "../../stores/useUserStore";
import { useVoiceAnalysis } from "../../hooks/useVoiceAnalysis";

interface SpeechKeywordProps {
  onNext: (data: {
    record: string;
    keywords: string[];
    vibeVector: number[];
  }) => void;
}

export default function SpeechKeyword({ onNext }: SpeechKeywordProps) {
  // ✅ 스토어에서 유저 정보와 업데이트 함수 가져오기
  const { user } = useUserStore();

  // ✅ 닉네임 가져오기 (없으면 기본값 '회원')
  const name = user?.nickname || "회원";

  // ✅ 목소리 분석 훅 사용
  const { analyzeVoice } = useVoiceAnalysis();

  // ✅ 녹음 완료 후 실행될 로직
  const onRecordingComplete = useCallback(
    async (file: File) => {
      try {
        const result = await analyzeVoice(file);

        // 🚨 [핵심 수정 부분] 🚨
        // API 결과(result.personalities/interests)는 { text: string, score: number } 형태의 객체 배열입니다.
        // 하지만 Request Body는 단순 문자열 배열(string[])을 원하므로, .text만 추출해야 합니다.

        const keywordStrings = [
          ...(result.personalities?.map((p: any) => p.text || p) || []),
          ...(result.interests?.map((i: any) => i.text || i) || []),
        ];

        console.log("✅ 변환된 키워드(String[]):", keywordStrings);

        onNext({
          record: result.audioUrl,
          keywords: keywordStrings, // 문자열 배열로 전송
          vibeVector: result.vibeVector || [], // 없으면 빈 배열 처리
        });
      } catch (error) {
        console.error("음성 분석 오류:", error);
        alert("분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
        // 실패 시 상태 초기화가 필요하다면 아래 주석 해제
        // resetStatus();
      }
    },
    [analyzeVoice, onNext],
  );

  const { status, seconds, isShort, handleMicClick } =
    useMicRecording(onRecordingComplete);

  const RenderRecordingControl = (
    <RecordingControl
      status={status}
      seconds={seconds}
      isShort={isShort}
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

// --- 하위 컴포넌트들 ---

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
      {/* 스타일 태그 대신 인라인 스타일이나 Tailwind 사용 권장하지만, 기존 로직 유지를 위해 유지 */}
      <style>{`
        .guide-container {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: absolute;
          width: 100%;
          left: 0;
          padding-left: 0.5rem;
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
