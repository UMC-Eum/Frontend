import { useState, useCallback } from "react";
import RecordingControl from "../../components/RecordingControl";
import { useUserStore } from "../../stores/useUserStore";
import PersonalitiesEditPage from "./PersonalitiesEditPage";
import { useVoiceAnalysis } from "../../hooks/useVoiceAnalysis";
import { useMicRecording } from "../../hooks/useMicRecording";

export default function CharacterRecordPage() {
  const [isKeywordPage, setIsKeywordPage] = useState(false);
  const { user } = useUserStore();
  const { analyzeVoice } = useVoiceAnalysis("personality");

<<<<<<< Updated upstream
  const { user, updateUser } = useUserStore();

  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  const { mutate: simulateAnalysis } = useMutation({
    mutationFn: mockAnalyzeVoice,
    onSuccess: () => {
      const mockResult = {
        record: "가짜녹음파일.webm",
        keywords: ["미니멀", "소유중시", "반려식물"], // Mock 데이터 예시
      };

      const mergedKeywords = Array.from(
        new Set([...(user?.personalities || []), ...mockResult.keywords]),
      );

      updateUser({
        introAudioUrl: mockResult.record,
        personalities: mergedKeywords,
      });

      setIsKeywordPage(true);
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
=======
  const onRecordingComplete = useCallback(
    async (file: File) => {
      try {
>>>>>>> Stashed changes
        setStatus("loading");
        await analyzeVoice(file);
        setIsKeywordPage(true);
      } catch (error) {
        console.error("음성 분석 오류:", error);
        alert("분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
        resetStatus();
      }
    },
    [analyzeVoice],
  );

  const {
    status,
    setStatus,
    seconds,
    isShort,
    handleMicClick,
    resetStatus,
  } = useMicRecording(onRecordingComplete);

  const RenderRecordingControl = (
    <RecordingControl
      status={status}
      seconds={seconds}
      isShort={isShort}
      onMicClick={handleMicClick}
    />
  );

  return (
    <>
      {!isKeywordPage && (
        <main className="flex-1 flex flex-col px-2 relative h-full">
          {status === "inactive" && (
            <WhenInactive
              name={user?.nickname}
              RecordingControl={RenderRecordingControl}
            />
          )}
          {status === "recording" && (
            <WhenRecording
              name={user?.nickname}
              RecordingControl={RenderRecordingControl}
            />
          )}
          {status === "loading" && (
            <Whenloading
              name={user?.nickname}
              RecordingControl={RenderRecordingControl}
            />
          )}
        </main>
      )}
<<<<<<< Updated upstream
      {isKeywordPage && <CharacterEditPage />}
=======
      {isKeywordPage && <PersonalitiesEditPage />}
>>>>>>> Stashed changes
    </>
  );
}

type WhenInactiveProps = {
  name: string | undefined;
  RecordingControl: React.ReactNode;
};

function WhenInactive({ name, RecordingControl }: WhenInactiveProps) {
  return (
    <>
      <div className="guide-container mt-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          반갑습니다! {name}님. <br />
          {name}님의 성격에 대해 들려주세요.
        </h1>
        <p className="text-gray-500 text-[15px] mt-2 transition-opacity duration-500">
          자신의 성격이나 장점, 특징들에 대해 편하게 말해주세요.
        </p>
      </div>

      <div className="transition-opacity duration-500 h-full">
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
  name: string | undefined;
  RecordingControl: React.ReactNode;
};

function WhenRecording({ name, RecordingControl }: WhenRecordingProps) {
  return (
    <>
      <div className="mt-5 mb-5 absolute w-full top-[20px] px-2 left-0">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          {name}님의 성격을 듣고있어요..
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
  name: string | undefined;
  RecordingControl: React.ReactNode;
};

function Whenloading({ name, RecordingControl }: WhenloadingProps) {
  return (
    <>
      <div className="mt-5 mb-5 absolute w-full top-[20px] px-2 left-0">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          AI가 {name}님의 성격을 <br />
          정리하고있어요!
        </h1>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative w-full h-[140px]">{RecordingControl}</div>
      </div>
    </>
  );
}