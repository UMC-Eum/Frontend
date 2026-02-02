import { useNavigate } from "react-router-dom";

type NextArrowProps = {
  navigateTo: string;
};

const NextArrow = ({ navigateTo }: NextArrowProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(navigateTo)}
      className="flex items-center justify-center p-1"
      aria-label="next page"
    >
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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default NextArrow;