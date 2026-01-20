import { useState, useEffect, useCallback, useRef } from "react";
import { useMediaStore } from "../stores/useMediaStore";

export type MicStatus = "inactive" | "recording" | "loading";

export const useMicRecording = (onRecordingComplete: (file: File) => void) => {
  const { stream } = useMediaStore();

  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let interval: number;
    if (status === "recording") {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // 녹음 시작
  const startRecording = () => {
    if (!stream) {
      alert("마이크가 연결되지 않았습니다. 권한을 확인해주세요!");
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "voice_record.webm", {
          type: "audio/webm",
        });

        onRecordingComplete(file);
      };

      mediaRecorder.start();
      setStatus("recording");
      setSeconds(0);
      setIsShort(false);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
    }
  };

  // 녹음 종료
  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      if (seconds < 10) {
        setIsShort(true);
        return;
      }
      setStatus("loading");
      mediaRecorderRef.current.stop();
    }
  };

  const handleMicClick = useCallback(() => {
    if (status === "inactive") {
      startRecording();
    } else if (status === "recording") {
      stopRecording();
    }
  }, [status, seconds, stream]); // stream 의존성 추가

  const resetStatus = useCallback(() => {
    setStatus("inactive");
    setSeconds(0);
    setIsShort(false);
  }, []);

  return {
    status,
    setStatus,
    seconds,
    isShort,
    handleMicClick,
    resetStatus,
  };
};
