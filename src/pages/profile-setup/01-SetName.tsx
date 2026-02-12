import { useState } from "react";
import { useUserStore } from "../../stores/useUserStore";
import { FullButton } from "../../components/standard/CTA";
import Input from "../../components/standard/Text";
interface SetNameProps {
  onNext: () => void;
}

export default function SetName({ onNext }: SetNameProps) {
  const [error, setError] = useState('');
  const [name, setName] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const { updateUser } = useUserStore();

  const isValid = !error && name.trim().length > 0;

  const handleNext = () => {
    updateUser({ nickname: name.trim() });
    onNext();
  };

  const validateNickname = (value: string) => {
    const regex = /^[ㄱ-ㅎㅏ-ㅣ가-힣]+$/;

    if (!isDirty && value.length > 0) {
      setIsDirty(true);
    }
    
    if (value.length === 0) {
      setError('닉네임을 입력해주세요.');
    } else if (!regex.test(value)) {
      setError('한글만 입력해주세요.');
    } else {
      setError(''); // 유효성 통과
    }
    setName(value);
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <h1 className="text-[26px] font-bold text-black leading-tight">
          성함이 어떻게 되세요?
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          실명도, 닉네임도 모두 괜찮아요.
        </p>

        <Input
          type="text"
          className="mt-6"
          errMsg={error}
          value={name}
          onChange={(e) => validateNickname(e.target.value)}
          placeholder="이름을 입력해주세요"
          autoFocus
        >
        </Input>
      </div>

      <FullButton
        onClick={handleNext}
        disabled={!isValid}
      >
        다음
      </FullButton>
    </div>
  );
}
