import heart from "../assets/heart_new.svg";
import { useNavigate } from "react-router-dom";
import x from "../assets/gray_x.svg";

const LikePopup = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="
          relative
          w-[322px] h-[332px]
          rounded-[18px]
          bg-white
          shadow-xl
          px-[22px] pt-[22px] pb-[18px]
          flex flex-col
        "
      >
        <button className="absolute right-[20px] top-[20px]">
          <img src={x} />
        </button>

        <div className="text-center">
          <p className="text-[20px] font-semibold text-[#202020] mt-[28px]">
            누군가 회원님을
            <br />
            마음에 들어 했어요!
          </p>
          <p className="mt-[12px] text-[14px] font-medium text-[#636970]">
            지금 바로 만나러 가볼까요?
          </p>
        </div>

        <div className="flex justify-center mt-[28px] items-center">
          <img src={heart} className="w-[108px] h-[93px]" />
        </div>

        <div className="grid grid-cols-2 gap-[12px] mt-[33px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[131px] h-[50px] rounded-[7px] bg-[#E9ECED] text-[#636970] text-[18px] font-semibold"
          >
            다음에
          </button>
          <button
            onClick={() => navigate("/hearts")}
            className="w-[131px] h-[50px] rounded-[7px] bg-[#FC3367] text-white text-[18px] font-semibold"
          >
            바로 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LikePopup;
