import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  title?: string;
  textClassName?: string;
  onClick?: () => void;
  showIcon?: boolean;
}

const BackButton = ({
  title,
  textClassName,
  onClick,
  showIcon = true, // 기본은 보이기
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (!showIcon) return; // 아이콘 안 보일 때는 동작도 막음

    if (onClick) {
      onClick();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full h-[45px] flex gap-[20px] px-[20px] py-[8px] items-center">
      <button
        type="button"
        onClick={handleBack}
        aria-label="뒤로 가기"
        className="w-[24px] h-[24px] shrink-0"
      >
        {/* ✅ 아이콘만 조건부 렌더링 */}
        {showIcon && (
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
        )}
      </button>

      {title && (
        <span className={`text-[24px] font-semibold ${textClassName}`}>
          {title}
        </span>
      )}
    </div>
  );
};

export default BackButton;
