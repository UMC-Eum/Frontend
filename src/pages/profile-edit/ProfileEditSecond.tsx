//버셀 오류 수정
import BackButton from "../../components/BackButton";
import { useUserStore } from "../../stores/useUserStore";
import camera_btn from "../../assets/camera_btn.png";
import volume_btn from "../../assets/volume_btn.png";
import white_mic from "../../assets/white_mic.png";

import { useEffect, useMemo, useRef, useState } from "react";
import KeywordChip from "../../components/keyword/KeywordChip";
import IntroTextEditModal from "./overlays/IntroTextEditModal";
import SetImageModal from "./overlays/SetImageModal";
import NextArrow from "../../components/NextArrow";
import { useNavigate } from "react-router-dom";

const ProfileEditSecond = () => {
  const { user } = useUserStore();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // 프로필 변경 모달창
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false); // 나의 소개 모달창
  const navigate = useNavigate();

  return (
    <>
      <BackButton title="내 프로필" textClassName="text-[24px] font-semibold" />

      {/* 내 프로필 */}
      <div className="flex items-center">
        {/* 내 프로필 - 프로필사진 */}
        <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#FFBD66] via-[#FF3D77] to-[#FF3D77]">
          <img
            className="w-full h-full rounded-full"
            src={user?.profileImageUrl}
          />
          <button
            onClick={() => setIsImageModalOpen(true)}
            className="w-7 h-7 absolute -bottom-1 -right-1 flex items-center justify-center"
          >
            <img src={camera_btn} />
          </button>
        </div>
        {/* 내 프로필 - 이름 상자 */}
        <div className="flex flex-col">
          <span>
            {user?.nickname} {user?.age}
          </span>
          <span>{user?.area.name}</span>
        </div>
      </div>
      {/* 내 프로필 - 프로필 변경 */}
      {isImageModalOpen && (
        <SetImageModal onClose={() => setIsImageModalOpen(false)} />
      )}

      {/* 나의 소개 */}
      <div>
        <h2>나의 소개</h2>
        <p
          onClick={() => setIsIntroModalOpen(true)}
          className="m-5 p-4 border border-gray-200 rounded-xl bg-gray-100 text-sm text-gray-600 leading-tight"
        >
          {user?.introText ||
            "안녕하세요. 특별한 사람이라기보다는, 평범한 하루를 함께 나눌 수 있는 인연을 찾고 있습니다. 부담 없이 대화부터 시작해보고 싶어요... 평소 등산하는 것을 좋아합니다."}
        </p>
        {/* 나의 소개 - 음성 녹음 */}
        <IntroPlayer />
      </div>
      {/* 나의 소개 - 모달창 */}
      {isIntroModalOpen && (
        <IntroTextEditModal onClose={() => setIsIntroModalOpen(false)} />
      )}

      {/* 나의 관심사 */}
      <div>
        <div className="flex justify-between items-center">
          <h2>나의 관심사</h2>
          <NextArrow navigateTo="./hobby" />
        </div>
        <div className="m-5 flex flex-wrap gap-2">
          {user?.keywords.map((k, i) => {
            return (
                <KeywordChip
                  key={i}
                  keyword={k}
                  isSelected={false}
                  disabled
                  onToggle={() => {}}
                />
            );
          })}
        </div>
      </div>

      {/* 나는 이런 사람이에요. */}
      <div>
        <div className="flex justify-between items-center">
          <h2>나는 이런 사람이에요.</h2>
          <NextArrow navigateTo="./character" />
        </div>
        <div className="m-5 flex flex-wrap gap-2">
          {user?.personalities.map((k, i) => {
            return (
                <KeywordChip
                  key={i}
                  keyword={k}
                  isSelected={false}
                  disabled
                  onToggle={() => {}}
                />
            );
          })}
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={() => navigate("./character-record")}
            className="mx-5 p-3 w-full flex items-center justify-center rounded-xl bg-[#FF3D77]"
          >
            <img className="h-4" src={white_mic} />
            <span className="text-white">재녹음</span>
          </button>
        </div>
      </div>

      {/* 나의 이상형 */}
      <div>
        <div className="flex justify-between items-center">
          <h2>나의 이상형</h2>
          <NextArrow navigateTo="./ideal" />
        </div>
        <div className="m-5 flex flex-wrap gap-2">
          {user?.idealPersonalities.map((k, i) => {
            return (
                <KeywordChip
                  key={i}
                  keyword={k}
                  isSelected={false}
                  disabled
                  onToggle={() => {}}
                />
            );
          })}
        </div>
        {user?.idealPersonalities.length === 0 && (
          <div className="mx-5 p-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-[#FEC4D1] to-[#FFF0E5]">
            <span className="">
              지금 바로 <span className="text-[#FF3D77]">이상형 등록</span>하고{" "}
              <br /> 내 취향에 맞는 프로필을 보러가요!
            </span>
            <button
              onClick={() => navigate("./ideal-record")}
              className="px-3 rounded-full bg-white text-[#FF3D77]"
            >
              바로가기
            </button>
          </div>
        )}
        {user?.idealPersonalities.length !== 0 && (
          <div className="flex items-center justify-center">
            <button
              onClick={() => navigate("./ideal-record")}
              className="mx-5 p-3 w-full flex items-center justify-center rounded-xl bg-[#FF3D77]"
            >
              <img className="h-4" src={white_mic} />
              <span className="text-white">재녹음</span>
            </button>
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div>
        <h2>기본 정보</h2>

        <div className="flex items-center">
          <dt>성별</dt>
          <dd>{user?.gender}</dd>
        </div>

        <div className="flex items-center">
          <dt>나이</dt>
          <dd>
            {user?.birthDate} ({user?.age})
          </dd>
        </div>

        <div className="flex items-center">
          <dt>지역</dt>
          <dd>{user?.area.name}</dd>
        </div>
      </div>
    </>
  );
};

export default ProfileEditSecond;

// todo list
// - 재생 버튼 누르면 버튼 바뀌기
// - 재생 버튼 누르면 멈추기
// - 녹음된 소리 나오기
// - 음량 조절 가능하게 만들기

const IntroPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playIcon = `
    w-0 h-0 
    border-t-[6px] border-t-transparent
    border-b-[6px] border-b-transparent 
    border-l-[9px] border-l-white 
    ml-1`;

  const pauseIcon = `
    w-[10px] h-[12px] 
    border-l-[3px] border-r-[3px] border-white
  `;

  return (
    <div className="m-5 p-2 gap-4 flex items-center border border-gray-300 rounded-full">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center justify-center w-8 h-8 rounded-[19px] bg-[#FF3D77]"
      >
        <div className={isPlaying ? pauseIcon : playIcon} />
      </button>
      <Waveform paused={!isPlaying} />
      <img src={volume_btn} />
    </div>
  );
};

interface WaveformProps {
  width?: number;
  barCount?: number;
  barWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  paused?: boolean;
}

const Waveform = ({
  width = 180,
  barCount = 30,
  barWidth = 2,
  minHeight = 5,
  maxHeight = 15,
  paused = false,
}: WaveformProps) => {
  const barsRef = useRef<HTMLDivElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const tRef = useRef(0);

  // ⏱ 타이머 상태
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // gap 계산
  const gap = useMemo(() => {
    if (barCount <= 1) return 0;
    return Math.max(0, (width - barCount * barWidth) / (barCount - 1));
  }, [width, barCount, barWidth]);

  /* =====================
     Waveform Animation
  ====================== */
  useEffect(() => {
    if (paused) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const animate = () => {
      tRef.current += 0.08;

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const wave = Math.sin(tRef.current - i * 0.6) * 0.5 + 0.5;
        const height = minHeight + wave * (maxHeight - minHeight);
        bar.style.height = `${height}px`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [paused, minHeight, maxHeight]);

  /* =====================
     Timer
  ====================== */
  useEffect(() => {
    if (paused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [paused]);

  // mm:ss 포맷
  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  return (
    <div className="flex items-center gap-8">
      {/* Waveform */}
      <div
        style={{
          width: `${width}px`,
          display: "flex",
          alignItems: "center",
        }}
      >
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) barsRef.current[i] = el;
            }}
            style={{
              width: `${barWidth}px`,
              height: `${minHeight}px`,
              marginRight: i === barCount - 1 ? 0 : `${gap}px`,
              backgroundColor: "#4b5563",
              borderRadius: "9999px",
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Timer */}
      <span className="text-sm text-gray-500" style={{ width: "40px" }}>
        {formattedTime}
      </span>
    </div>
  );
};
