import { useState, useRef } from "react";
import { motion } from "framer-motion";
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
  const [step, setStep] = useState(1);
  const { user } = useUserStore();

  // 스토어 구조를 변경하지 않기 위해 local에 임시 저장
  const vibeVectorRef = useRef<number[]>([]);
  const isBarVisible = step <= 5;

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  // 6번 페이지 전용
  const handleSpeechKeywordNext = (data: {
    record: string;
    keywords: string[];
    vibeVector: number[];
  }) => {
    vibeVectorRef.current = data.vibeVector; //vibe vector 임시 저장
    handleNext();
  };
  // 7번 페이지 전용
  const handleSubmitProfile = async () => {
    if (!user) return;
    try {
      const requestBody = {
        nickname: user.nickname,
        gender: user.gender as "M" | "F",
        //일단 가짜 생일 넣었습니다.
        birthDate: user.birthDate || `${new Date().getFullYear() - (user.age || 0)}-01-01`,
        areaCode: user.area?.code || "",
        introText: user.introText,
        introAudioUrl: user.introAudioUrl,
        selectedKeywords: [...user.personalities, ...user.keywords],
        vibeVector: vibeVectorRef.current,
      };

      const response = await postProfile(requestBody);
      if (response.profileCompleted) {
        handleNext();
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        handleNext();
        return;
      }
      console.error("프로필 생성 오류:", error);
      alert("프로필 생성에 실패했습니다.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white flex flex-col">
      <BackButton />
      {/* 상단 프로그레스 바 */}
      {isBarVisible && (
        <div className="w-full h-1 bg-gray-100">
          <div
            className="h-full bg-[#FC3367] transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      )}

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col p-6">
        {step === 1 && <SetName onNext={handleNext} />}
        {step === 2 && <SetAge onNext={handleNext} />}
        {step === 3 && <SetGender onNext={handleNext} />}
        {step === 4 && <SetLocation onNext={handleNext} />}
        {step === 5 && <SetImage onNext={handleNext} />}
        {step === 6 && <SpeechKeyword onNext={handleSpeechKeywordNext} />}
        {step === 7 && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col"
          >
            <SetKeywords onNext={handleSubmitProfile} />
          </motion.div>
        )}
        {step === 8 && <SetComplete />}
      </main>
    </div>
  );
}
