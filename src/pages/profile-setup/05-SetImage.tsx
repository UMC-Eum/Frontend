import { useState } from "react";
import { ProfileData } from "./ProfileSetupMain";
import avatar_placeholder from "../../assets/avatar_placeholder.png";
import camera_btn from "../../assets/camera_btn.png";

interface SetImageProps {
  onNext: (data: Partial<ProfileData>) => void;
}

export default function SetImage({ onNext }: SetImageProps) {
  const [imageSrc, setImageSrc] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isValid = imageSrc.length > 0;

  const handleNext = () => {
    onNext({ image: imageSrc });
  };

  const handleImageUpload = () => {
    setIsMenuOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col px-2">
      <div className="mt-5 mb-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          사진을 등록해주세요.
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          따뜻한 미소가 담긴 사진은 매칭에 큰 도움이 됩니다.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center pt-40">
        <div
          className={`relative w-40 h-40 rounded-full p-[3px] ${
            isValid
              ? "bg-gradient-to-tr from-[#FFBD66] via-[#FF3D77] to-[#FF3D77]"
              : "bg-gray-300"
          } flex items-center justify-center`}
        >
          <div className="w-full h-full rounded-full overflow-hidden">
            <img src={isValid ? imageSrc : avatar_placeholder} />
          </div>
          <button
            onClick={handleImageUpload}
            className="absolute -bottom-1 -right-1 flex items-center justify-center"
          >
            <img src={camera_btn} />
          </button>
        </div>
      </div>

      <div className="mt-auto pb-10">
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`w-full py-5 rounded-[20px] text-[18px] font-semibold transition-all ${
            isValid
              ? "bg-[#FC3367] text-white active:bg-pink-300"
              : "bg-[#DEE3E5] text-[#A6AFB6] cursor-not-allowed"
          }`}
        >
          다음
        </button>
      </div>

      <div>
        {isMenuOpen && (
          <SetImageModal
            onClose={() => setIsMenuOpen(false)}
            onChange={setImageSrc}
          />
        )}
      </div>
    </div>
  );
}

type SetImageModallProps = {
  onClose: () => void;
  onChange: (image: string) => void;
};

function SetImageModal({ onClose, onChange }: SetImageModallProps) {
  const handleSelectPhoto = () => {};

  const handleDefaultProfile = () => {
    onChange("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee");
    onClose();
  };

  return (
    <div
      className="px-10 pb-4 fixed inset-0 bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white text-center rounded-2xl divide-y-2 divide-gray-100">
          <button
            className="w-full py-3 text-lg font-medium"
            onClick={handleSelectPhoto}
          >
            촬영 또는 앨범에서 선택
          </button>
          <button
            className="w-full py-3 text-lg font-medium"
            onClick={handleDefaultProfile}
          >
            기본 프로필 선택
          </button>
        </div>
        <div className="bg-white text-center rounded-2xl">
          <button className="w-full py-3 text-lg font-medium" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
