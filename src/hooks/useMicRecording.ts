import { useState, useEffect, useCallback, useRef } from "react";
import { useMediaStore } from "../stores/useMediaStore";

export type MicStatus = "inactive" | "recording" | "loading";

export const useMicRecording = (
  onRecordingComplete: (file: File, duration: number) => void,
  isChat = false,
) => {
  const { stream } = useMediaStore();

  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  // 실시간 시간을 정확하게 추적하기 위한 Ref
  const secondsRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. 타이머 로직 (Ref 동기화)
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

  // 2. 녹음 시작 함수
  const startRecording = useCallback(() => {
    if (!stream) {
      alert("마이크가 연결되지 않았습니다. 권한을 확인해주세요!");
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "voice_record.webm", {
          type: "audio/webm",
        });

        // 최신 Ref 값을 duration으로 전달
        onRecordingComplete(file, secondsRef.current);

        if (isChat) {
          setStatus("inactive");
          setSeconds(0);
          secondsRef.current = 0;
          setIsShort(false);
        }
      };

      mediaRecorder.start();
      setStatus("recording");
      setSeconds(0);
      secondsRef.current = 0;
      setIsShort(false);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
    }
  }, [stream, onRecordingComplete, isChat]);

  // 3. 녹음 종료 함수 (2초 타이머 로직 + Ref 기반 10초 체크)
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === "recording") {
      if (secondsRef.current < 10) {
        setIsShort(true);
        // ✨ 우리가 만든 자동 닫기 로직 유지
        setTimeout(() => {
          setIsShort(false);
        }, 2000);
        return;
      }
      setStatus("loading");
      mediaRecorderRef.current.stop();
    }
  }, [status]);

  // 4. 마이크 클릭 핸들러 (의존성 최적화)
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
