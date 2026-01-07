import { useState, useRef, useEffect } from "react";

type RecordingStatus = "inactive" | "recording" | "loading";

export const useMicRecording = (onRecordingComplete: (file: File) => void) => {
  const [status, setStatus] = useState<RecordingStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 정상 종료 시 실행될 로직
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], "voice_record.webm", {
          type: "audio/webm",
        });
        onRecordingComplete(audioFile);

        // 스트림 정리 (마이크 끄기)
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

  // 녹음 종료 버튼을 눌렀을 때
  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      if (seconds < 10) {
        setIsShort(true);
        setTimeout(() => setIsShort(false), 2000);
        return;
      }
      mediaRecorderRef.current.stop();
      setStatus("loading");
    }
  };

  const resetStatus = () => {
    setStatus("inactive");
    setSeconds(0);
    setIsShort(false);

    // 강제 종료 시에는 onstop 이벤트가 발동하지 않도록 처리하고 끔
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = null; // 전송 방지
        mediaRecorderRef.current.stop();
      }
      // 스트림 트랙 종료
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    }
  };

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
