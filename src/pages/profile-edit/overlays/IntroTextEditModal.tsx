import { useState } from "react";
import { useUserStore } from "../../../stores/useUserStore";
import { updateMyProfile } from "../../../api/users/usersApi";

type IntroTextEditModalProps = {
  onClose: () => void;
};

export default function IntroTextEditModal({
  onClose,
}: IntroTextEditModalProps) {
  const { user, updateUser } = useUserStore();
  const [text, setText] = useState(user?.introText || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await updateMyProfile({
        introText: text,
      });
      updateUser({ introText: text });
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-[100]
    flex items-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pt-[14px] px-[20px] pb-[58px] flex flex-col justify-center w-full bg-white rounded-t-3xl gap-5"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-[40px] h-[4px] bg-[#A6AFB6] rounded-full" />
          <h2 className="text-[20px] font-semibold leading-[1.2] tracking-normal text-gray-900">
            나의 소개
          </h2>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            placeholder="상대방이 나에 대해 더 잘 알 수 있게 말로 풀어내듯, 편안하게 작성해 주세요.😄"
            className="
            pt-[20px] px-[20px] pb-[12px] w-full h-[25vh] border border-gray-300 rounded-xl resize-none
            text-black bg-gray-100
            placeholder:text-gray-400
            "
          />
          <div className="absolute bottom-4 right-4 text-[14px] font-medium leading-[1.2] tracking-normal text-gray-500">
            {text.length}/300
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={text.length === 0 || isLoading}
          className={`py-[16px] px-[149px] font-semibold text-[18px] leading-[1.2] tracking-normal rounded-[14px] active:bg-[#e6356a]
              ${
                text.length === 0 || isLoading
                  ? "bg-[#DEE3E5] text-[#A6AFB6] cursor-not-allowed"
                  : "bg-[#FF3D77] text-white"
              }`}
        >
          {isLoading ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
