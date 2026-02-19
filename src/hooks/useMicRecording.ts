import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MicRecorder from "mic-recorder-to-mp3";

export type MicStatus = "inactive" | "recording" | "loading";

export const useMicRecording = (
  onRecordingComplete: (file: File, duration: number) => void,
  isChat = false,
) => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  const secondsRef = useRef(0);
  const recorderRef = useRef<MicRecorder | null>(null);

  useEffect(() => {
    recorderRef.current = new MicRecorder({ bitRate: 128 });
  }, []);

  useEffect(() => {
    let interval: number;
    if (status === "recording") {
      interval = window.setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          secondsRef.current = next;
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const startRecording = useCallback(async () => {
    if (!recorderRef.current) return;

    try {
      await recorderRef.current.start();

      setStatus("recording");
      setSeconds(0);
      secondsRef.current = 0;
      setIsShort(false);
    } catch (err) {
      console.error("녹음 시작 실패 (권한 거부 등):", err);
      alert("마이크가 연결되지 않았습니다. 권한을 확인해주세요!");
      navigate("/onboarding");
    }
  }, [navigate]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && status === "recording") {
      const minDuration = isChat ? 0 : 10;

      if (secondsRef.current < minDuration) {
        setIsShort(true);
        setTimeout(() => {
          setIsShort(false);
        }, 2000);

        // 💡 수정됨: .catch() 제거 (stop()은 Promise를 반환하지 않음)
        recorderRef.current.stop();
        setStatus("inactive");
        setSeconds(0);
        secondsRef.current = 0;
        return;
      }

      setStatus("loading");

      recorderRef.current
        .stop()
        .getMp3()
        // 💡 수정: 첫 번째 인자(buffer)는 안 쓰니까 '_'로 두고, 두 번째 인자(blob)를 사용합니다!
        .then(([_, blob]: [Int8Array[], Blob]) => {
          // 💡 수정: 버퍼 대신 완성된 blob을 배열에 담아 File로 만듭니다. (타입스크립트가 아주 좋아함)
          const file = new File([blob], `voice_record_${Date.now()}.mp3`, {
            type: "audio/mpeg",
          });

          onRecordingComplete(file, secondsRef.current);

          if (isChat) {
            setStatus("inactive");
            setSeconds(0);
            secondsRef.current = 0;
            setIsShort(false);
          }
        })
        .catch((e: any) => {
          console.error("MP3 변환 실패:", e);
          setStatus("inactive");
        });
    }
  }, [status, isChat, onRecordingComplete]);

  const handleMicClick = useCallback(() => {
    if (status === "inactive") {
      startRecording();
    } else if (status === "recording") {
      stopRecording();
    }
  }, [status, startRecording, stopRecording]);

  const resetStatus = useCallback(() => {
    setStatus("inactive");
    setSeconds(0);
    secondsRef.current = 0;
    setIsShort(false);
  }, []);

  return {
    status,
    setStatus,
    seconds,
    isShort,
    handleMicClick,
    resetStatus,
    startRecording,
    stopRecording,
  };
};
