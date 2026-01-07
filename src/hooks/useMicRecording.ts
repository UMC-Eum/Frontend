// src/hooks/useMicRecording.ts
import { useState, useRef, useEffect } from "react";

type RecordingStatus = "inactive" | "recording" | "loading";

export const useMicRecording = (onRecordingComplete: (file: File) => void) => {
  const [status, setStatus] = useState<RecordingStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false); // 녹음이 너무 짧은지 체크

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 로직
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // 녹음 시작
  const startRecording = async () => {
    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); //나중에 로그인쪽 권한으로 빼기

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 데이터가 들어올 때마다 청크(조각) 저장
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 녹음 종료 시 처리
      mediaRecorder.onstop = () => {
        // 청크들을 합쳐서 Blob 생성 (webm 형식)
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        // 서버 전송용 File 객체로 변환
        const audioFile = new File([audioBlob], "voice_record.webm", {
          type: "audio/webm",
        });

        // 부모 컴포넌트로 파일 전달
        onRecordingComplete(audioFile);

        // 스트림 트랙 종료 (마이크 끄기)
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setStatus("recording");
      setSeconds(0);
      setIsShort(false);
    } catch (err) {
      console.error("마이크 권한 오류:", err);
      alert("마이크 사용 권한을 허용해주세요.");
    }
  };

  // 녹음 종료
  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      if (seconds < 10) {
        // 10초 미만이면 너무 짧음 처리
        setIsShort(true);
        setTimeout(() => setIsShort(false), 2000);

        // 녹음은 취소하지만 스트림은 꺼줘야 함
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        resetStatus();
        return;
      }

      mediaRecorderRef.current.stop();
      setStatus("loading"); // 파일 변환 및 전송 대기 상태
    }
  };

  // 상태 초기화 (재녹음 등)
  const resetStatus = () => {
    setStatus("inactive");
    setSeconds(0);
    setIsShort(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  // 마이크 버튼 클릭 핸들러
  const handleMicClick = () => {
    if (status === "inactive") {
      startRecording();
    } else if (status === "recording") {
      stopRecording();
    }
  };

  return {
    status,
    setStatus,
    seconds,
    isShort,
    handleMicClick,
    resetStatus,
  };
};
