interface CheckButtonProps {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}
const CheckButton = ({ label, disabled, onClick }: CheckButtonProps) => {
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`
        px-[149px] py-[16px]
        rounded-[14px]
        font-semibold
        text-[18px]
        font-['Pretendard']
        transition-colors
        ${disabled ? "bg-gray-300 text-gray-500" : "bg-[#FC3367] text-white"}
      `}
      >
        {label}
      </button>
    </>
  );
};

export default CheckButton;
