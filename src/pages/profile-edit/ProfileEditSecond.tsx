import BackButton from "../../components/BackButton";
import { useUserStore } from "../../stores/useUserStore";
import camera_btn from "../../assets/camera_btn.png";
import Sound_Icon from "../../assets/Sound_Icon.svg";
import white_mic from "../../assets/white_mic.png";

import { useEffect, useMemo, useRef, useState } from "react";
import KeywordChip from "../../components/keyword/KeywordChip";
import IntroTextEditModal from "./overlays/IntroTextEditModal";
import SetImageModal from "./overlays/SetImageModal";
import NextArrow from "../../components/NextArrow";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/standard/Navbar";

const ProfileEditSecond = () => {
  const { user } = useUserStore();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <BackButton title="내 프로필" textClassName="text-[24px] font-semibold" />

      <div className="h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pb-10">
        <div className="ml-5 mt-2 flex items-center gap-3">
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
          <div className="flex flex-col gap-2">
            <span className="text-[20px] font-semibold leading-[1.2] text-gray-900">
              {user?.nickname} {user?.age}
            </span>
            <span className="text-[14px] font-medium leading-[1.2] text-gray-600">
              {user?.area.name}
            </span>
          </div>
        </div>
        {isImageModalOpen && (
          <SetImageModal onClose={() => setIsImageModalOpen(false)} />
        )}

        <div className="mt-5 mb-6">
          <h2 className="px-5 pt-3 pb-4 text-[20px] font-semibold leading-[1.2]">
            나의 소개
          </h2>
          <div className="flex flex-col gap-3">
            <p
              onClick={() => setIsIntroModalOpen(true)}
              className="mx-5 p-[14px] border border-gray-200 rounded-xl bg-gray-100 text-[14px] font-medium leading-[1.2] text-gray-600 tracking-normal break-all [overflow-wrap:anywhere] whitespace-pre-wrap"
            >
              {user?.introText ||
                "안녕하세요. 특별한 사람이라기보다는, 평범한 하루를 함께 나눌 수 있는 인연을 찾고 있습니다. 부담 없이 대화부터 시작해보고 싶어요... 평소 등산하는 것을 좋아합니다."}
            </p>
            <IntroPlayer />
          </div>
        </div>
        {isIntroModalOpen && (
          <IntroTextEditModal onClose={() => setIsIntroModalOpen(false)} />
        )}

        <div className="flex flex-col gap-[10px] mb-6">
          <div className="px-5 pt-3 pb-4 flex w-full justify-between items-center">
            <h2 className="text-[20px] font-semibold leading-[1.2]">
              나의 관심사
            </h2>
            <NextArrow navigateTo="./hobby" />
          </div>
          <div className="mx-5 flex flex-wrap gap-2">
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
        <div className="flex flex-col gap-[20px] mb-6">
          <div className="px-5 pt-3 pb-4 flex w-full justify-between items-center">
            <h2 className="text-[20px] font-semibold leading-[1.2]">
              나는 이런 사람이에요.
            </h2>
            <NextArrow navigateTo="./character" />
          </div>
          <div className="mx-5 flex flex-wrap gap-2">
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
              className="mx-5 p-4 w-full flex items-center justify-center rounded-2xl bg-[#FF3D77] gap-1"
            >
              <img className="h-4" src={white_mic} />
              <span className="text-white text-[18px] font-semibold leading-[1.2] tracking-normal">
                재녹음
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[20px] mb-6">
          <div className="px-5 pt-3 pb-4 flex w-full justify-between items-center">
            <h2 className="text-[20px] font-semibold leading-[1.2]">
              나의 이상형
            </h2>
            <NextArrow navigateTo="./ideal" />
          </div>
          {user?.idealPersonalities.length === 0 && (
            <div className="mx-5 py-[15px] px-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#FEC4D1] to-[#FFF0E5]">
              <span className="text-[16px] font-medium leading-[1.4] tracking-normal text-gray-800">
                지금 바로{" "}
                <span className="font-semibold text-[#FF3D77]">
                  이상형 등록
                </span>
                하고 <br /> 내 취향에 맞는 프로필을 보러가요!
              </span>
              <button
                onClick={() => navigate("/matching")}
                className="px-[9px] py-[3px] rounded-full bg-white text-[#FF3D77] text-[13px] font-semibold leading-[1.2] tracking-normal"
              >
                바로가기
              </button>
            </div>
          )}
          {user?.idealPersonalities.length !== 0 && (
            <>
              <div className="mx-5 flex flex-wrap gap-2">
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
              <div className="flex items-center justify-center">
                <button
                  onClick={() => navigate("./ideal-record")}
                  className="mx-5 p-4 w-full flex items-center justify-center rounded-2xl bg-[#FF3D77] gap-1"
                >
                  <img className="h-4" src={white_mic} />
                  <span className="text-white text-[18px] font-semibold leading-[1.2] tracking-normal">
                    재녹음
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <h2 className="px-5 pt-3 pb-4 text-[20px] font-semibold leading-[1.2]">
            기본 정보
          </h2>

          <div className="px-5 flex flex-col gap-3">
            <div className="flex items-center gap-[28px]">
              <dt className="text-[16px] font-medium leading-[1.2] text-gray-700 tracking-normal">
                성별
              </dt>
              <dd className="text-[16px] font-medium leading-[1.2] text-gray-500 tracking-normal">
                {user?.gender}
              </dd>
            </div>

            <div className="flex items-center gap-[28px]">
              <dt className="text-[16px] font-medium leading-[1.2] text-gray-700 tracking-normal">
                나이
              </dt>
              <dd className="text-[16px] font-medium leading-[1.2] text-gray-500 tracking-normal">
                {user?.birthDate} ({user?.age})
              </dd>
            </div>

            <div className="flex w-full justify-between tems-center gap-[28px]">
              <div className="flex items-center gap-[28px]">
                <dt className="text-[16px] font-medium leading-[1.2] text-gray-700 tracking-normal">
                  지역
                </dt>
                <dd className="text-[16px] font-medium leading-[1.2] text-gray-700 tracking-normal">
                  {user?.area.name}
                </dd>
              </div>
              <NextArrow navigateTo="./location" />
            </div>
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default ProfileEditSecond;

const IntroPlayer = () => {
  const { user } = useUserStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

  useEffect(() => {
    if (user?.introAudioUrl) {
      const audio = new Audio(user.introAudioUrl);
      audio.crossOrigin = "anonymous";

      const handleEnded = () => {
        setIsPlaying(false);
        audio.currentTime = 0;
      };

      audio.addEventListener("ended", handleEnded);
      setAudioElement(audio);

      return () => {
        audio.pause();
        audio.removeEventListener("ended", handleEnded);
        setAudioElement(null);
      };
    }
  }, [user?.introAudioUrl]);

  const togglePlay = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch((err) => {
        console.error("Audio play failed:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const playIcon = (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      className="ml-1"
    >
      <path
        d="M10.5 5.6L3 1.1C1.7 0.3 0 1.3 0 2.9V11.1C0 12.7 1.7 13.7 3 12.9L10.5 8.4C11.8 7.7 11.8 6.3 10.5 5.6Z"
        fill="white"
      />
    </svg>
  );

  const pauseIcon = (
    <div className="flex gap-[3px]">
      <div className="w-[3px] h-[12px] bg-white rounded-full" />
      <div className="w-[3px] h-[12px] bg-white rounded-full" />
    </div>
  );

  return (
    <div className="mx-5 pl-[10px] pr-[15px] py-2 gap-3 flex items-center border border-gray-300 rounded-full">
      <button
        onClick={togglePlay}
        disabled={!user?.introAudioUrl}
        className={`flex items-center justify-center w-[30px] h-[30px] rounded-[19px] bg-[#FF3D77] ${!user?.introAudioUrl ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isPlaying ? pauseIcon : playIcon}
      </button>
      <div className="flex-1 min-w-0">
        <Waveform audioElement={audioElement} paused={!isPlaying} />
      </div>
      <img className="w-[24px] h-[24px]" src={Sound_Icon} />
    </div>
  );
};

interface WaveformProps {
  barWidth?: number;
  gap?: number;
  minHeight?: number;
  maxHeight?: number;
  paused?: boolean;
  audioElement: HTMLAudioElement | null;
}

const Waveform = ({
  barWidth = 2,
  gap = 4,
  minHeight = 4,
  maxHeight = 16,
  paused = false,
  audioElement,
}: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const barCount = useMemo(() => {
    if (containerWidth === 0) return 30;
    const count = Math.floor((containerWidth + gap) / (barWidth + gap));
    return Math.max(1, count);
  }, [containerWidth, barWidth, gap]);

  const barsRef = useRef<HTMLDivElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!paused) return;

    if (audioElement && audioElement.currentTime === 0) {
      setSeconds(0);
    }
  }, [paused, audioElement]);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      if (audioElement) {
        setSeconds(Math.floor(audioElement.currentTime));
      } else {
        setSeconds((s) => s + 1);
      }
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [paused, audioElement]);

  useEffect(() => {
    if (!audioElement) return;

    if (sourceRef.current) return;

    try {
      const AudioContextCtor =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextCtor) return;

      const actx = new AudioContextCtor();
      audioContextRef.current = actx;

      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = actx.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(actx.destination);
      sourceRef.current = source;
    } catch (e) {
      console.error("Audio Context Setup Error:", e);
    }

    return () => {
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
      sourceRef.current = null;
      analyserRef.current = null;
      audioContextRef.current = null;
    };
  }, [audioElement]);

  const volumeHistoryRef = useRef<number[]>(new Array(barCount).fill(0));

  useEffect(() => {
    volumeHistoryRef.current = new Array(barCount).fill(0);
  }, [barCount]);

  useEffect(() => {
    const animate = () => {
      if (analyserRef.current && !paused) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        volumeHistoryRef.current.pop();
        volumeHistoryRef.current.unshift(average);

        barsRef.current.forEach((bar, i) => {
          if (!bar) return;
          const value = volumeHistoryRef.current[i];

          const percent = value / 255;
          const height = minHeight + percent * (maxHeight - minHeight);

          bar.style.height = `${height}px`;
        });
      } else if (audioElement?.currentTime === 0) {
        volumeHistoryRef.current.fill(0);
        barsRef.current.forEach((bar) => {
          if (bar) bar.style.height = `${minHeight}px`;
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [paused, minHeight, maxHeight, barCount, audioElement]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  return (
    <div className="flex-1 flex items-center gap-[18px] min-w-0">
      <div
        ref={containerRef}
        className="flex-1 flex items-center h-[30px] overflow-hidden"
      >
        <div className="flex items-center w-full">
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
                transition: "height 0.1s ease",
              }}
            />
          ))}
        </div>
      </div>

      <span className="text-sm text-gray-500 w-[36px] text-center shrink-0">
        {formattedTime}
      </span>
    </div>
  );
};
