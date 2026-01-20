import { useNavigate } from "react-router-dom";

type NextArrowProps = {
  title? : string
  textclass? : string
  navigateTo : string
}

const NextArrow = ({ title, textclass, navigateTo }: NextArrowProps) => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-[45px] flex gap-[20px] px-[20px] py-[8px] items-center">
      <button onClick={() => navigate(navigateTo)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="9"
          height="16"
          viewBox="0 0 9 16"
          fill="none"
        >
          <path
            d="M1 1L8 8L1 15"
            stroke="#A6AFB6"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      {title && <span className={textclass}>{title}</span>}
    </div>
  );
};

export default NextArrow;
