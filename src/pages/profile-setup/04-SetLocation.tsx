import { useState } from "react";
import { ProfileData } from "./ProfileSetupMain";

interface SetLocationProps {
  onNext: (data: Partial<ProfileData>) => void;
}

const LOCATION = [
  "서울", "경기", "부산", "인천", "광주", "대전", "대구", "울산", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "세종"
]

const SUB_LOCATIONS: Record<string, string[]> = {
  "경기": ["일산 인근", "의정부 인근", "안양 인근", "분당 인근", "수원 인근", "기타"],
}

export default function SetLocation({ onNext } : SetLocationProps) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRegionClick = (location: string) => {
    setSelectedLocation(location); // "경기" 저장
    setIsModalOpen(true);          // 모달 열기
  };

  return (
    <div className="flex-1 flex flex-col px-2">
      <div className="mt-5 mb-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          현재 거주하는 <br />
          지역이 어디인가요?
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          내 거주지와 가까운 분들과 더 잘 이어져요.
        </p>
      </div>

      <div className="mt-10 p-4 h-[600px] overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {LOCATION.map((location) => (
            <button
              key={location}
              onClick={() => handleRegionClick(location)}
              className={`
                py-4 px-6 rounded-xl font-medium
                ${selectedLocation === location 
                  ? "bg-[#FFE2E9] text-[#FC3367] outline-2 outline-[#FC3367]" 
                  : "bg-gray-50 text-gray-500"
                }
              `}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      <div>        
        {isModalOpen && (
          <SetCitiesModal 
            location={selectedLocation}
            onClose={() => setIsModalOpen(false)}
            onNext={onNext}
          />
        )}
        
      </div>
    </div>
  );
}

type SetCitiesModalProps = {
  location: string;
  onClose: () => void;
  onNext: (data: Partial<ProfileData>) => void;
};

function SetCitiesModal({ location, onClose, onNext }: SetCitiesModalProps) {
  const [selectedCity, setSelectedCity] = useState("");

  const isValid = (selectedCity !== "")

  const handleNext = () => {
    if (selectedCity) {
      onClose();
      onNext({location: `${location} ${selectedCity}`});
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end" onClick={onClose}>
      
      <div 
        className="w-full bg-white rounded-t-3xl p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">{location} 어디 지역인가요?</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">✕</button>
        </div>

        <div className="flex flex-col gap-6 mb-10">
          {(SUB_LOCATIONS[location] || []).map((city) => (
            <div 
              key={city} 
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setSelectedCity(city)}
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center
                ${selectedCity === city ? "bg-[#FC3367]" : "bg-gray-200"}
              `}>
                <svg width="12" height="9" viewBox="0 0 14 11" fill="none">
                  <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className={`text-lg ${selectedCity === city ? "text-black font-semibold" : "text-gray-600"}`}>
                {city}
              </span>
            </div>
          ))}
        </div>

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
    </div>
  );
}

