import { type TabType } from "../../pages/NotificationsPage";
interface LikeOrMessageProps {
  tab: TabType;
  setTab: (tab: TabType) => void;
}

const LikeOrMessage = ({ tab, setTab }: LikeOrMessageProps) => {
  return (
    <div className="border-b border-[#DEE3E5] px-[20px] h-[48px] flex bg-white">
      <button
        type="button"
        onClick={() => setTab("HEART")}
        className={`relative flex-1 flex items-center justify-center text-[18px] transition-colors ${
          tab === "HEART"
            ? "font-bold text-[#202020]"
            : "font-medium text-[#ADB5BD]"
        }`}
      >
        마음
        {tab === "HEART" && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-[100%] max-w-[120px] bg-[#FC3367] rounded-full" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setTab("CHAT")}
        className={`relative flex-1 flex items-center justify-center text-[18px] transition-colors ${
          tab === "CHAT"
            ? "font-bold text-[#202020]"
            : "font-medium text-[#ADB5BD]"
        }`}
      >
        대화
        {tab === "CHAT" && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-[100%] max-w-[120px] bg-[#FC3367] rounded-full" />
        )}
      </button>
    </div>
  );
};

export default LikeOrMessage;
