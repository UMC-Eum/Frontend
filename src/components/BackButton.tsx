import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  title?: string;
}

const BackButton = ({ title }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/"); // 홈이나 안전한 페이지
    }
  };
  return (
    <div className="w-full h-[45px] flex gap-[20px] px-[20px] py-[8px] items-center">
      <button
        type="button"
        onClick={handleBack}
        className="w-[24px] h-[24px] shrink-0 text-[#636970]"
        aria-label="뒤로 가기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15 5L8 12L15 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {title && <span className="text-[24px] font-semibold">{title}</span>}
    </div>
  );
};

export default BackButton;
