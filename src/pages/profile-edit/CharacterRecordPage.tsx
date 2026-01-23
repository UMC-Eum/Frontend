import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

// 경로에 맞게 import 확인해주세요
import { MicStatus } from "../../hooks/useMicRecording";
import RecordingControl from "../../components/RecordingControl";
import { mockAnalyzeVoice } from "../../mock/mockApi";
import { useUserStore } from "../../stores/useUserStore";
import { KEYWORDS } from "../../components/keyword/keyword.model";
import BackButton from "../../components/BackButton";
import KeywordChips from "../../components/keyword/KeywordChips";

export default function CharacterRecordPage() {
  const location = useLocation();
  const isResultPage = location.pathname.includes("result");
  const [isKeywordPage, setIsKeywordPage] = useState(false);

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
        keywords: ["미니멀", "소유중시", "반려식물"], // Mock 데이터 예시
      };

      const existingHobbies = (user?.keywords || []).filter((label) => {
        const k = KEYWORDS.find((item) => item.label === label);
        return k?.category === "hobby";
      });

      const mergedKeywords = Array.from(
        new Set([...existingHobbies, ...mockResult.keywords]),
      );

      updateUser({
        introAudioUrl: mockResult.record,
        keywords: mergedKeywords,
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
    <>
      {!isKeywordPage && (
        <main className="flex-1 flex flex-col px-2 relative h-full">
          {status === "inactive" && (
            <WhenInactive
              name={name}
              RecordingControl={RenderRecordingControl}
            />
          )}
          {status === "recording" && (
            <WhenRecording
              name={name}
              RecordingControl={RenderRecordingControl}
            />
          )}
          {status === "loading" && (
            <Whenloading
              name={name}
              RecordingControl={RenderRecordingControl}
            />
          )}
        </main>
      )}
      {isKeywordPage && <CharacterEditPage />}
    </>
  );
}
type WhenInactiveProps = {
  name: string;
  RecordingControl: React.ReactNode;
};

function WhenInactive({ name, RecordingControl }: WhenInactiveProps) {
  return (
    <>
      <div className="guide-container">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          반갑습니다! {name}님. <br />
          {name}님의 이야기를 들려주세요.
        </h1>
        <p className="text-gray-500 text-[15px] mt-2 transition-opacity duration-500">
          좋아하는 취미나 관심사, 일상에 대해 편하게 말해주세요.
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

//CharacterEditPage에서 그대로 가져옴
//글자만 수정
function CharacterEditPage() {
  const MAX_SELECT = 5;
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();

  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    if (!user?.keywords) return [];

    // 현재 유저의 키워드 라벨들과 일치하는 ID들을 찾아 초기값으로 설정
    return KEYWORDS.filter(
      (k) =>
        ["character", "value", "lifestyle", "expression"].includes(
          k.category,
        ) && user.keywords.includes(k.label),
    ).map((k) => k.id);
  });

  const filteredKeywords = useMemo(() => {
    return KEYWORDS.filter((k) => k.id >= 180 && k.id <= 200);
  }, []);

  const handleSave = () => {
    const selectedLabels = selectedIds
      .map((id) => KEYWORDS.find((k) => k.id === id)?.label)
      .filter((label): label is string => !!label);

    const hobbyKeywords = (user?.keywords || []).filter((label) => {
      const k = KEYWORDS.find((item) => item.label === label);
      return k?.category === "hobby";
    });

    updateUser({ keywords: [...hobbyKeywords, ...selectedLabels] });
    navigate("/my/edit/");
  };

  return (
    <>
      <BackButton
        title="나는 이런 사람이에요."
        textClassName="text-[24px] font-semibold"
      />
      <h2>나를 나타내는 키워드들을 골라주세요. </h2>
      <p>최대 5개까지 고를 수 있어요.</p>
      <div className="pb-4 flex flex-wrap gap-3">
        <KeywordChips
          keywords={filteredKeywords}
          selectedIds={selectedIds}
          maxSelect={MAX_SELECT}
          onChange={(ids) => setSelectedIds(ids)}
        />
      </div>
      <div className="flex items-center justify-center">
        <button
          className="m-5 p-3 w-full flex items-center justify-center rounded-xl bg-[#FF3D77] text-white"
          onClick={handleSave}
        >
          저장하기
        </button>
      </div>
    </>
  );
}
