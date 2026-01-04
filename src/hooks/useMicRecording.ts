import { useState, useEffect, useCallback } from "react";

export type MicStatus = "inactive" | "recording" | "loading";

export const useMicRecording = (onSuccess?: () => void) => {
  const [status, setStatus] = useState<MicStatus>("inactive");
  const [seconds, setSeconds] = useState(0);
  const [isShort, setIsShort] = useState(false);

  useEffect(() => {
    let interval: number;
    if (status === "recording") {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleMicClick = useCallback(() => {
    if (status === "inactive") {
      setStatus("recording");
      setSeconds(0);
      setIsShort(false);
    } else if (status === "recording") {
      if (seconds < 10) {
        setIsShort(true);
        return;
      }
      setStatus("loading");
      setSeconds(0);
      setIsShort(false);
      if (onSuccess) onSuccess();
    }
  }, [status, seconds, onSuccess]);

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
