import { useState, useEffect, useCallback, useRef } from "react";

export type MicStatus = "inactive" | "recording" | "loading";

// 👇 [수정] 콜백함수가 file과 duration(초) 두 개를 받도록 변경
export const useMicRecording = (
  onRecordingComplete: (file: File, duration: number) => void, 
  isChat = false
) => {
  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  // 👇 [추가] 최신 시간 값을 실시간으로 기억할 Ref
  const secondsRef = useRef(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. 타이머 로직 수정 (Ref 동기화 추가)
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

  // 2. 녹음 시작 함수
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      };

      mediaRecorder.start();
      setStatus("recording");
      setSeconds(0);
      secondsRef.current = 0; // 시작할 때 0으로
      setIsShort(false);
    } catch (err) {
      console.error("마이크 권한 오류:", err);
      alert("마이크 사용 권한을 허용해주세요! 🎤");
    }
  };

  // 3. 녹음 종료 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      // 10초 미만 체크 (Ref값 사용 권장)
      if (secondsRef.current < 10) {
        setIsShort(true);
        return; 
      }

      setStatus("loading");
      mediaRecorderRef.current.stop();
    }
  };

  // 4. 클릭 핸들러
  const handleMicClick = useCallback(() => {
    if (status === "inactive") {
      startRecording();
    } else if (status === "recording") {
      stopRecording();
    }
  }, [status]); // seconds 의존성 제거 가능

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
    startRecording,
    stopRecording,
  };
};