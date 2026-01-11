import { useState, useEffect, useCallback, useRef } from "react";

export type MicStatus = "inactive" | "recording" | "loading";

// 👇 [핵심 수정 1] 콜백 함수가 'File'을 받는다고 타입 명시!
export const useMicRecording = (onRecordingComplete: (file: File) => void) => {
  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  // 실제 녹음기를 담을 변수 (렌더링에 영향 안 주려고 useRef 사용)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. 타이머 로직 (기존과 동일)
  useEffect(() => {
    let interval: number;
    if (status === "recording") {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // 2. 녹음 시작 함수
  const startRecording = async () => {
    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = []; // 데이터 초기화

      // 데이터가 들어올 때마다 저장
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // 녹음이 멈췄을 때 실행될 로직 (파일 생성 -> 부모에게 전달)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // 👇 File 객체로 변환
        const file = new File([blob], "voice_record.webm", {
          type: "audio/webm",
        });

        // 👇 [핵심 수정 2] 여기서 파일을 쥐어주며 콜백 실행!
        onRecordingComplete(file);

        // 마이크 끄기 (브라우저 상단 빨간불 끄기)
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setStatus("recording");
      setSeconds(0);
      setIsShort(false);
    } catch (err) {
      console.error("마이크 권한 오류:", err);
      alert("마이크 사용 권한을 허용해주세요! 🎤");
    }
  };

  // 3. 녹음 종료 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      // 10초 미만 체크
      if (seconds < 10) {
        setIsShort(true);
        return; // 녹음 안 멈춤 (사용자가 더 말하게 둠)
      }

      setStatus("loading");
      mediaRecorderRef.current.stop(); // -> 이게 onstop 이벤트를 발생시킴
    }
  };

  // 4. 클릭 핸들러
  const handleMicClick = useCallback(() => {
    if (status === "inactive") {
      startRecording();
    } else if (status === "recording") {
      stopRecording();
    }
  }, [status, seconds]); // startRecording, stopRecording은 내부 함수라 의존성 생략 가능하나 원칙상 넣는게 좋음

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
    startRecording, // 필요하면 밖에서 쓰라고 내보냄
    stopRecording, // 필요하면 밖에서 쓰라고 내보냄
  };
};
