import { useState, useEffect, useCallback, useRef } from "react";
// useMediaStore는 필요 없다면 제거하셔도 됩니다.
// import { useMediaStore } from "../stores/useMediaStore"; 

export type MicStatus = "inactive" | "recording" | "loading";

export const useMicRecording = (
  // 👇 duration(초)까지 부모에게 전달하도록 수정됨
  onRecordingComplete: (file: File, duration: number) => void,
  isChat = false
) => {
  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  // 👇 타이머 값을 실시간으로 참조하기 위한 Ref (이게 핵심!)
  const secondsRef = useRef(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. 타이머 로직 (Ref와 State 동기화)
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

  // 2. 녹음 시작
  const startRecording = async () => {
    try {
      // 마이크 권한 요청 및 스트림 생성
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

        // 👇 [핵심] secondsState 대신 최신 값이 담긴 secondsRef.current를 전달
        onRecordingComplete(file, secondsRef.current);

        // 스트림 트랙 종료 (마이크 끄기)
        stream.getTracks().forEach((track) => track.stop());

        // 채팅용이라면 바로 상태 초기화
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
      alert("마이크 권한이 필요합니다.");
    }
  };

  // 3. 녹음 종료
  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      // 👇 State 대신 Ref값으로 비교 (State는 클로저 문제로 0일 수 있음)
      if (secondsRef.current < 10) {
        setIsShort(true);
        // 여기서 바로 리턴하지 않고, 녹음은 멈추되 전송만 안 하거나
        // UI에서 처리를 위해 일단 stop()을 부르지 않거나 정책에 따라 결정
        // 보통은 짧으면 알림만 띄우고 녹음 상태 유지 or 취소
        return; 
      }
      
      setStatus("loading");
      mediaRecorderRef.current.stop();
    }
  };

  // 4. 마이크 버튼 클릭 핸들러
  const handleMicClick = useCallback(() => {
    if (status === "inactive") {
      startRecording();
    } else if (status === "recording") {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); 

  // 5. 상태 초기화 (재녹음 등)
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