import { useState } from "react";
import SplashStep from "./steps/SplashStep";
import LoginStep from "./steps/LoginStep";

export default function LoginPage() {
  const [step, setStep] = useState<"splash" | "login">("splash");

  return (
    <div className="relative h-full bg-white">
      {step === "splash" && <SplashStep onNext={() => setStep("login")} />}
      {step === "login" && <LoginStep />}
    </div>
  );
}
