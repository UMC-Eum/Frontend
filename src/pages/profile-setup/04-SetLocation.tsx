import { useState, useMemo } from "react";
import { useUserStore } from "../../stores/useUserStore";
import { IUserArea } from "../../types/user";
import { REGIONS, DISTRICTS } from "../../constants/locationData";

interface SetLocationProps {
  onNext: () => void;
}

export default function SetLocation({ onNext }: SetLocationProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | null>(null);

  const { updateUser } = useUserStore();

  const handleRegionClick = (code: string) => {
    setSelectedRegionCode(code);
    setStep(2);
  };

  const handleDistrictClick = (districtName: string, districtCode: string) => {
    setSelectedDistrictCode(districtCode);
    
    const region = REGIONS.find((r) => r.code === selectedRegionCode);
    
    if (region) {
      const newArea: IUserArea = {
        code: districtCode,
        name: `${region.name} ${districtName}`,
      };
      updateUser({ area: newArea });
      onNext();
    }
  };

  const currentDistricts = useMemo(() => {
    if (!selectedRegionCode) return [];
    return DISTRICTS[selectedRegionCode] || [];
  }, [selectedRegionCode]);

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
        {step === 1 ? (
          <div className="grid grid-cols-2 gap-3">
            {REGIONS.map((region) => (
              <button
                key={region.code}
                onClick={() => handleRegionClick(region.code)}
                className={`
                  py-4 px-6 rounded-xl font-medium
                  ${
                    selectedRegionCode === region.code
                      ? "bg-[#FFE2E9] text-[#FC3367] outline-2 outline-[#FC3367]"
                      : "bg-gray-50 text-gray-500"
                  }
                `}
              >
                {region.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {currentDistricts.map((district) => (
              <button
                key={district.code}
                onClick={() => handleDistrictClick(district.name, district.code)}
                className={`
                  py-4 px-6 rounded-xl font-medium
                  ${
                    selectedDistrictCode === district.code
                      ? "bg-[#FFE2E9] text-[#FC3367] outline-2 outline-[#FC3367]"
                      : "bg-gray-50 text-gray-500"
                  }
                `}
              >
                {district.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

