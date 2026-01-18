import { useNavigate } from "react-router-dom";
const NextArrow = ({ navigateTo }: { navigateTo: string }) => {
  const navigate = useNavigate();
  return (
    <div>
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
    </div>
  );
};

export default NextArrow;
