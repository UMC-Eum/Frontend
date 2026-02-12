import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SetName from "./01-SetName";
import SetAge from "./02-SetAge";
import SetGender from "./03-SetGender";
import SetLocation from "./04-SetLocation";
import SetImage from "./05-SetImage";
import SpeechKeyword from "./06-SpeechKeyword";
import SetKeywords from "./07-SetKeywords";
import SetComplete from "./08-SetComplete";
import BackButton from "../../components/BackButton";
import { postProfile } from "../../api/onboarding/onboardingApi";
import { useUserStore } from "../../stores/useUserStore";

export default function ProfileSetupMain() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateUser } = useUserStore();
  const step = Number(searchParams.get("step")) || 1;
  const [direction, setDirection] = useState(1);
  const vibeVectorRef = useRef<number[]>([]);
  const isBarVisible = step <= 5;

  useEffect(() => {}, [step]);

  const handleNext = () => {
    setDirection(1);
    setSearchParams({ step: String(step + 1) });
  };

  const handleBack = () => {
    if (step === 1) return;
    setDirection(-1);
    setSearchParams({ step: String(step - 1) });
  };

  const handleSpeechKeywordNext = (data: {
    record: string;
    transcript: string;
    vibeVector: number[];
  }) => {
    updateUser({
      introText: data.transcript,
      introAudioUrl: data.record,
    })
    vibeVectorRef.current = data.vibeVector;
    handleNext();
  };
  // 7번 페이지 전용
  const handleSubmitProfile = async (selectedData?: { personalities: string[], keywords: string[] }) => {
    if (!user) return;

    try {
      const requestBody = {
        nickname: user.nickname,
        gender: user.gender as "M" | "F",
        birthDate:
          user.birthDate ||
          `${new Date().getFullYear() - (user.age)}-01-01`,
        areaCode: user.area?.code || "",
        introText: user.introText,
        introAudioUrl: user.introAudioUrl,
        selectedKeywords: [...(selectedData?.personalities || []), ...(selectedData?.keywords || [])],
        vibeVector: vibeVectorRef.current,
      };

      console.log("프로필 생성 요청 바디:", requestBody);

      const response = await postProfile(requestBody);
      if (response) handleNext();
    } catch (error: any) {
      if (error.response?.status === 409) {
        handleNext();
        return;
      }
      console.error("프로필 생성 오류:", error);
      alert("프로필 생성에 실패했습니다.");
    }
  };

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] bg-white flex flex-col overflow-hidden relative">
      <div className="z-20 bg-white shrink-0">
        <BackButton onClick={handleBack} showIcon={step !== 1} />

        {isBarVisible && (
          <div className="w-full h-1 bg-gray-100">
            <div
              className="h-full bg-[#FC3367] transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        )}
      </div>
      <main className="flex-1 w-full relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={step}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 flex-1 flex flex-col px-5 pt-[28px] pb-[24px] bg-white"
          >
            {step === 1 && <SetName onNext={handleNext} />}
            {step === 2 && <SetAge onNext={handleNext} />}
            {step === 3 && <SetGender onNext={handleNext} />}
            {step === 4 && <SetLocation onNext={handleNext} />}
            {step === 5 && <SetImage onNext={handleNext} />}
            {step === 6 && <SpeechKeyword onNext={handleSpeechKeywordNext} />}
            {step === 7 && <SetKeywords onNext={handleSubmitProfile} />}
            {step === 8 && <SetComplete />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>

  );
}


