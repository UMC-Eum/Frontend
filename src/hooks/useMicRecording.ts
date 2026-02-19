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

  // 💡 핵심 수정 1: async를 붙여서 권한 재요청을 기다릴 수 있게 만듭니다.
  const startRecording = useCallback(async () => {
    let activeStream = stream;

    const isStreamDead =
      !activeStream ||
      !activeStream.active ||
      activeStream
        .getAudioTracks()
        .every((track) => track.readyState === "ended");

    if (isStreamDead) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      } catch (err) {
        console.error("마이크 권한 재요청 실패:", err);
        alert("마이크가 연결되지 않았습니다. 권한을 확인해주세요!");
        navigate("/onboarding");
        return;
      }
    }

    // 💡 [해결책] 타입 가드 추가: activeStream이 null이 아님을 확신시켜 줍니다.
    if (!activeStream) {
      console.error("스트림을 확보할 수 없습니다.");
      return;
    }

    try {
      // 이제 activeStream은 무조건 MediaStream 타입이므로 에러가 사라집니다!
      const mediaRecorder = new MediaRecorder(activeStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        let actualMimeType =
          chunksRef.current[0]?.type || mediaRecorder.mimeType || "audio/webm";

        if (actualMimeType.includes("mp4")) {
          actualMimeType = "audio/mp4";
        }

        const ext =
          actualMimeType.includes("mp4") || actualMimeType.includes("m4a")
            ? "m4a"
            : "webm";

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
  }, [stream, onRecordingComplete, isChat, navigate]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === "recording") {
      // 1. 채팅창(isChat)이면 시간 제한 없이 통과, 아니면(이상형 찾기 등) 10초 제한
      const minDuration = isChat ? 0 : 10;

      if (secondsRef.current < minDuration) {
        setIsShort(true);
        // 💡 중요: 너무 짧아서 취소될 때 상태를 다시 'inactive'로 돌려줘야 버튼이 안 굳습니다!
        setStatus("inactive");
        setTimeout(() => {
          setIsShort(false);
        }, 2000);
        return;
      }

      // 2. 정상 범위일 때만 로딩 상태로 진입
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
