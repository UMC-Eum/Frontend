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

  // 💡 마이크를 완전히 종료시키는 함수 (아이폰 소리 키우기용)
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
    }
  }, [stream]);

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

    if (!activeStream) {
      console.error("스트림을 확보할 수 없습니다.");
      return;
    }

    try {
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
      const minDuration = isChat ? 0 : 10;

      if (secondsRef.current < minDuration) {
        setIsShort(true);
        setStatus("inactive");
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
    stopStream, // 💡 외부에서 끌 수 있게 반환
  };
};
