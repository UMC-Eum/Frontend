import { useEffect, useState } from "react";
import TutorialStep1 from "./TutorialStep1";
import TutorialStep2 from "./TutorialStep2";

const TutorialMain = () => {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const isHidden = localStorage.getItem("tutorialHidden");
    if (!isHidden) {
      setStep(0);
    } else {
      setStep(2);
    }
  }, []);

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handleCloseForever = () => {
    localStorage.setItem("tutorialHidden", "true");
    setStep(2);
  };
  const handleClose = () => {
    setStep(2);
  };

  if (step < 0 || step > 1) return null;

  return (
    <>
      {step === 0 && (
        <TutorialStep1 onNext={handleNextStep} onClose={handleClose} />
      )}
      {step === 1 && (
        <TutorialStep2
          onCloseForever={handleCloseForever}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default TutorialMain;
