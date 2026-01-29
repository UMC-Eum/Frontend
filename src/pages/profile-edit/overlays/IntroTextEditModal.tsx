import { useState } from "react";
import { useUserStore } from "../../../stores/useUserStore";

type IntroTextEditModalProps = {
  onClose: () => void;
};

export default function IntroTextEditModal({
  onClose,
}: IntroTextEditModalProps) {
  const { user, updateUser } = useUserStore();
  const [text, setText] = useState(user?.introText || "");
  const handleSave = () => {
    updateUser({ introText: text });
    onClose();
  };
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50
    flex items-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col justify-center w-full bg-white rounded-t-3xl"
      >
        <h2 className="text-center font-bold my-4">나의 소개</h2>

        <div className="relative mx-4">
          <textarea
            defaultValue={user?.introText}
            onChange={(e) => setText(e.target.value)}
            placeholder="상대방이 나에 대해 더 잘 알 수 있게 말로 풀어내듯, 편안하게 작성해 주세요.😄"
            className="
            p-4 w-full h-[25vh] border border-gray-300 rounded-xl resize-none
            text-black
            placeholder:text-gray-400
            "
          />
          <div className="absolute bottom-4 right-4 text-xs text-gray-400">
            {text.length}/300
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mx-4 my-6 p-3 bg-[#FF3D77] text-white font-bold rounded-xl active:bg-[#e6356a]"
        >
          저장
        </button>
      </div>
    </div>
  );
}
