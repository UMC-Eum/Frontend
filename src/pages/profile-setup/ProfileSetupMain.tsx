import { useState } from "react";
import SetName from "./01-SetName";
import SetAge from "./02-SetAge";
import SetGender from "./03-SetGender";
import SetLocation from "./04-SetLocation";
import SetImage from "./05-SetImage";
import SpeechKeyword from "./06-SpeechKeyword";
import SetKeywords from "./07-SetKeywords";
import SetComplete from "./08-SetComplete";

export default function ProfileSetupMain() {
  const [step, setStep] = useState(1);

  const isBarVisible = step <= 5;

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white flex flex-col">
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

        {step === 6 && <SpeechKeyword onNext={handleNext} />}

        {step === 7 && <SetKeywords onNext={handleNext} />}

        {step === 8 && <SetComplete />}
      </main>
    </div>
  );
}
