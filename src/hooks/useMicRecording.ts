import { useState, useEffect, useCallback, useRef } from "react";
import { useMediaStore } from "../stores/useMediaStore";
import { useNavigate } from "react-router-dom";

export type MicStatus = "inactive" | "recording" | "loading";

export const useMicRecording = (
  onRecordingComplete: (file: File, duration: number) => void,
  isChat = false,
) => {
  const { stream } = useMediaStore();
  const navigate = useNavigate();

  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  const secondsRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  const startRecording = useCallback(() => {
    if (!stream) {
      alert("마이크가 연결되지 않았습니다. 권한을 확인해주세요!");
      navigate("/onboarding");
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
        // 1. 녹음된 데이터의 실제 MIME 타입을 가져옵니다.
        let actualMimeType =
          chunksRef.current[0]?.type || mediaRecorder.mimeType || "audio/webm";

        // 💡 2. [핵심] iOS 사파리가 'video/mp4'라고 우겨도 강제로 'audio/mp4'로 세탁합니다!
        if (actualMimeType.includes("mp4")) {
          actualMimeType = "audio/mp4";
        }

        // 3. 확장자 결정 (mp4 계열이면 m4a, 아니면 webm)
        const ext =
          actualMimeType.includes("mp4") || actualMimeType.includes("m4a")
            ? "m4a"
            : "webm";

        // 4. 백엔드가 좋아하는 완벽한 audio/ 타입으로 덮어씌워서 포장합니다.
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        const file = new File([blob], `voice_record_${Date.now()}.${ext}`, {
          type: actualMimeType,
        });

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

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === "recording") {
      const minDuration = isChat ? 0 : 10;
      if (secondsRef.current < minDuration) {
        setIsShort(true);
        setTimeout(() => {
          setIsShort(false);
        }, 2000);
        return;
      }
      setStatus("loading");
      mediaRecorderRef.current.stop();
    }
  }, [status, isChat]);

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
