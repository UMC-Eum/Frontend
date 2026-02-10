import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import RecordingControl from "../../components/RecordingControl";
import { useUserStore } from "../../stores/useUserStore";
import { useVoiceAnalysis } from "../../hooks/useVoiceAnalysis";
import { useMicRecording } from "../../hooks/useMicRecording";
import BackButton from "../../components/BackButton";
import { useNavigate } from "react-router-dom";
import { useScoreStore } from "../../stores/useScoreStore";
import { updateMyProfile } from "../../api/users/usersApi";
import KeywordChips from "../../components/keyword/KeywordChips";
import { motion } from "framer-motion";

export default function PersonalitiesRecordPage() {
  const [isKeywordPage, setIsKeywordPage] = useState(false);
  const { user } = useUserStore();
  const { analyzeVoice } = useVoiceAnalysis("personality");

  const recordingCompleteRef = useRef<(file: File) => void>();

  const {
    status,
    setStatus,
    seconds,
    isShort,
    handleMicClick,
    resetStatus,
  } = useMicRecording((file) => recordingCompleteRef.current?.(file));
  

  const onRecordingComplete = useCallback(
    async (file: File) => {
      try {
        setStatus("loading");
        await analyzeVoice(file);
        setIsKeywordPage(true);
      } catch (error) {
        console.error("음성 분석 오류:", error);
        alert("분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
        resetStatus();
      }
    },
    [analyzeVoice, resetStatus, setStatus],
  );  

  useEffect(() => {
    recordingCompleteRef.current = onRecordingComplete;
  }, [onRecordingComplete]);


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


      {isKeywordPage && 
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col"
          >
            <PersonalitiesEditPage />
        </motion.div>
      }
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
      <BackButton
        title="재녹음"
        textClassName="text-[24px] font-semibold"
      />
      <div className="mx-5 guide-container mt-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          {name}의 이야기를 들려주세요.
        </h1>
        <div className="mt-5 flex flex-col gap-3 text-gray-500 text-[15px] transition-opacity duration-500">
          <p>이렇게 말해도 좋아요!</p>
          <p>저는 등산하는걸 좋아하는 사람이에요.</p>
          <p>여러사람들과 다같이 즐겁게 놀고싶어요</p>
          <p>심심할때마다 노래방을 즐겨가요.</p>
        </div>
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
  RecordingControl: React.ReactNode;
};

function WhenRecording({ RecordingControl }: WhenRecordingProps) {
  return (
    <>
      <BackButton
        title="재녹음"
        textClassName="text-[24px] font-semibold"
      />
      <div className="mx-5 guide-container mt-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          듣고있어요..
        </h1>
        <div className="mt-5 flex flex-col gap-3 text-gray-500 text-[15px] transition-opacity duration-500">
          <p>이렇게 말해도 좋아요!</p>
          <p>저는 등산하는걸 좋아하는 사람이에요.</p>
          <p>여러사람들과 다같이 즐겁게 놀고싶어요</p>
          <p>심심할때마다 노래방을 즐겨가요.</p>
        </div>
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
      <BackButton
        title="재녹음"
        textClassName="text-[24px] font-semibold"
      />

      <div className="mx-5 guide-container mt-5">
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

function PersonalitiesEditPage() {
  const MAX_SELECT = 5;
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();

  const personalities = useScoreStore((s) => s.keywords.personalities);

  const allKeywords = useMemo(
    () => (personalities || []).map((p) => p.text),
    [personalities]
  );

  //선택된 키워드
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isInitialized = useRef(false);
  useEffect(() => {
    if (isInitialized.current || allKeywords.length === 0) return;
    setSelectedKeywords(allKeywords.slice(0, MAX_SELECT));
    isInitialized.current = true;
  }, [allKeywords]);

  // 변경사항 감지; 1. 개수 비교 2. 내용 비교
  const isChanged = useMemo(() => {
    const original = user?.personalities || [];
    if (selectedKeywords.length !== original.length) return true;
    return !selectedKeywords.every((kw) => original.includes(kw));
  }, [selectedKeywords, user?.personalities]);

  const handleSave = async () => {
    if (!isChanged || !user) return;
    
    setIsLoading(true); 
    try {
      await updateMyProfile({
        personalities: selectedKeywords,
      });
      updateUser({ personalities: [...selectedKeywords] });
      navigate("/my/edit/");
    } catch (error) {
      console.error("Failed to update personalities:", error);
      alert("성격 키워드 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <BackButton
        title="나는 이런 사람이에요."
        textClassName="text-[24px] font-semibold"
      />
      <div className="p-5 flex flex-col gap-[10px] flex-1">
        <h2 className="text-[22px] font-semibold leading-[1.4] tracking-normal text-gray-900 align-middle">나를 나타내는 키워드들을 골라주세요. </h2>
        <p className="text-[14px] font-medium leading-[1.4] tracking-normal text-gray-500">최대 5개까지 고를 수 있어요.</p>
        <div className="pt-5 flex flex-wrap gap-3">
          <KeywordChips
            allKeywords={allKeywords}
            selectedKeywords={selectedKeywords}
            maxSelect={MAX_SELECT}
            onChange={(ids) => setSelectedKeywords(ids)}
          />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <button
          className={`m-5 px-[149px] py-4 w-full flex items-center justify-center rounded-xl text-[18px] font-semibold leading-[1.2] tracking-normal transition-all ${
            isChanged && !isLoading
              ? "bg-[#FF3D77] text-white"
              : "bg-[#DEE3E5] text-[#A6AFB6] cursor-not-allowed"
          }`}
          onClick={handleSave}
          disabled={!isChanged || isLoading}
        >
          {isLoading ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
