interface BackButtonProps {
  onClick?: () => void;
}

const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[24px] h-[24px] shrink-0 text-gray-700"
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
  );
};

export default BackButton;
