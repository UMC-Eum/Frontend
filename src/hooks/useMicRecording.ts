import { useState, useEffect, useCallback, useRef } from "react";
import { useMediaStore } from "../stores/useMediaStore";

export type MicStatus = "inactive" | "recording" | "loading";

<<<<<<< HEAD
// 👇 [수정] 콜백함수가 file과 duration(초) 두 개를 받도록 변경
export const useMicRecording = (
  onRecordingComplete: (file: File, duration: number) => void, 
  isChat = false
) => {
=======
export const useMicRecording = (onRecordingComplete: (file: File) => void) => {
  const { stream } = useMediaStore();

>>>>>>> 41baf905672beac75cb342c06f4874b332ea05ea
  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

<<<<<<< HEAD
  // 👇 [추가] 최신 시간 값을 실시간으로 기억할 Ref
  const secondsRef = useRef(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. 타이머 로직 수정 (Ref 동기화 추가)
=======
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

>>>>>>> 41baf905672beac75cb342c06f4874b332ea05ea
  useEffect(() => {
    let interval: number;
    if (status === "recording") {
      interval = window.setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          secondsRef.current = next; // Ref에도 최신 값 저장
          return next;
        });
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
<<<<<<< HEAD
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
=======
>>>>>>> 41baf905672beac75cb342c06f4874b332ea05ea
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
<<<<<<< HEAD
        const file = new File([blob], "voice_record.webm", { type: "audio/webm" });

        // 👇 [핵심 수정] seconds 대신 최신 값이 담긴 secondsRef.current 전달
        onRecordingComplete(file, secondsRef.current);

        stream.getTracks().forEach((track) => track.stop());

        if (isChat) {
          setStatus("inactive");
          setSeconds(0);
          secondsRef.current = 0; // Ref 초기화
          setIsShort(false);
        }
=======
        const file = new File([blob], "voice_record.webm", {
          type: "audio/webm",
        });

        onRecordingComplete(file);
>>>>>>> 41baf905672beac75cb342c06f4874b332ea05ea
      };

      mediaRecorder.start();
      setStatus("recording");
      setSeconds(0);
      secondsRef.current = 0; // 시작할 때 0으로
      setIsShort(false);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
    }
  };

  // 녹음 종료
  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
<<<<<<< HEAD
      // 10초 미만 체크 (Ref값 사용 권장)
      if (secondsRef.current < 10) {
        setIsShort(true);
        return; 
=======
      if (seconds < 10) {
        setIsShort(true);
        return;
>>>>>>> 41baf905672beac75cb342c06f4874b332ea05ea
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
<<<<<<< HEAD
  }, [status]); // seconds 의존성 제거 가능
=======
  }, [status, seconds, stream]); // stream 의존성 추가
>>>>>>> 41baf905672beac75cb342c06f4874b332ea05ea

  const resetStatus = useCallback(() => {
    setStatus("inactive");
    setSeconds(0);
    secondsRef.current = 0; // 초기화
    setIsShort(false);
  }, []);

  return {
    status,
    setStatus,
    seconds,
    isShort,
    handleMicClick,
    resetStatus,
<<<<<<< HEAD
    startRecording,
    stopRecording,
=======
>>>>>>> 41baf905672beac75cb342c06f4874b332ea05ea
  };
};