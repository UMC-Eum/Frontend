import { useState, useMemo } from "react";
import { useUserStore } from "../../stores/useUserStore";
import { IUserArea } from "../../types/user";
import { REGIONS, DISTRICTS } from "../../constants/locationData";
import { SelectChip } from "../../components/standard/Select";
import { FullButton } from "../../components/standard/CTA";

interface SetLocationProps {
  onNext: () => void;
}

export default function SetLocation({ onNext }: SetLocationProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(
    null,
  );
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    string | null
  >(null);

  const { updateUser } = useUserStore();

  const currentDistricts = useMemo(() => {
    if (!selectedRegionCode) return [];
    return DISTRICTS[selectedRegionCode] || [];
  }, [selectedRegionCode]);

  const isValid = step === 1 ? !!selectedRegionCode : !!selectedDistrictCode;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      const region = REGIONS.find((r) => r.code === selectedRegionCode);
      const district = currentDistricts.find(
        (d) => d.code === selectedDistrictCode,
      );

      if (region && district) {
        const newArea: IUserArea = {
          code: district.code,
          name: `${region.name} ${district.name}`,
        };
        updateUser({ area: newArea });
        onNext();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-none">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          현재 거주하는 <br />
          지역이 어디인가요?
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          내 거주지와 가까운 분들과 더 잘 이어져요.
        </p>
      </div>

      <div className="flex-1 mt-[62px] overflow-y-auto no-scrollbar pb-10">
        <div className="grid grid-cols-2 gap-2">
          {step === 1
            ? REGIONS.map((region) => (
                <SelectChip
                  key={region.code}
                  onClick={() => setSelectedRegionCode(region.code)}
                  active={selectedRegionCode === region.code}
                  text={region.name}
                />
              ))
            : currentDistricts.map((district) => (
                <SelectChip
                  key={district.code}
                  onClick={() => setSelectedDistrictCode(district.code)}
                  active={selectedDistrictCode === district.code}
                  text={district.name}
                />
              ))}
        </div>
      </div>

      <div className="flex-none pt-4 bg-white flex justify-center">
        <FullButton onClick={handleNext} disabled={!isValid}>
          {step === 1 ? "다음" : "완료"}
        </FullButton>
      </div>
    </div>
  );
}
