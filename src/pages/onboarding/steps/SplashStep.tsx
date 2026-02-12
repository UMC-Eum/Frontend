import { useEffect } from "react";
import splashbackground from "../../../assets/splash_background.svg";

interface SplashProps {
  onNext: () => void;
}

export default function SplashStep({ onNext }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="flex items-center justify-center h-full bg-white">
      <img
        src={splashbackground}
        alt="스플래쉬 배경 이미지"
        className="w-28 h-28"
      />
    </div>
  );
}
