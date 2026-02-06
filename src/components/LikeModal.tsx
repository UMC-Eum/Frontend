import { useNotificationStore } from "../stores/useNotificationStore";
import { useNavigate } from "react-router-dom";
const LikeModal = () => {
  const { isModalOpen, selectedNotificationId, closeModal } =
    useNotificationStore();
  const navigate = useNavigate();

  if (!isModalOpen || !selectedNotificationId) return null;

  return (
    <div
      className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center"
      onClick={closeModal}
    >
      <div
        className="relative w-[322px] h-[331px] rounded-[14px] bg-white flex flex-col items-center justify-between p-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼: absolute를 써서 우측 상단에 고정하는 게 일반적입니다 */}
        <button
          onClick={closeModal}
          className="absolute top-[20px] right-[20px] p-1 hover:opacity-70 transition-opacity"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M0.292846 1.70703C-0.097639 1.31655 -0.0975608 0.683502 0.292846 0.292969C0.683378 -0.0974636 1.31641 -0.0975247 1.70691 0.292969L6.81628 5.40234L11.9257 0.292968C12.3162 -0.0974641 12.9502 -0.0975252 13.3407 0.292968C13.7307 0.683455 13.7308 1.31665 13.3407 1.70703L8.23035 6.81641L13.3407 11.9258C13.7308 12.3162 13.7307 12.9494 13.3407 13.3398C12.9502 13.7303 12.3162 13.7303 11.9257 13.3398L6.81628 8.23047L1.70691 13.3398C1.31642 13.7303 0.68338 13.7303 0.292847 13.3398C-0.0975603 12.9493 -0.0976385 12.3163 0.292847 11.9258L5.40222 6.81641L0.292846 1.70703Z"
              fill="#A6AFB6"
            />
          </svg>
        </button>

        {/* 상단 텍스트 영역 (중앙 정렬을 위해 mt-auto 등 활용 가능) */}
        <div className="flex flex-col gap-[12px] mt-10">
          <p className="text-[20px] font-semibold leading-[1.2] text-black">
            누군가 회원님을
            <br />
            마음에 들어 했어요!
          </p>
          <p className="text-[#666] text-[14px] leading-normal font-medium">
            지금 바로 만나러 가볼까요?
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-row gap-[10px] w-full justify-center">
          <button
            onClick={closeModal}
            className="w-[131px] h-[50px] bg-[#E9ECEF] text-[18px] text-[#868E96] rounded-[7px] font-semibold"
          >
            다음에
          </button>
          <button
            onClick={() => {
              /* 바로보기 로직 추가 */
              closeModal();
              navigate("/likes");
            }}
            className="w-[131px] h-[50px] bg-[#FC3367] text-[18px] text-white rounded-[7px] font-semibold"
          >
            바로 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LikeModal;
