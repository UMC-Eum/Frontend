import { useState } from "react";

const CheckIcon = () => {
  const [checked, setChecked] = useState(false);

  return (
    <button
      type="button"
      aria-checked={checked}
      role="checkbox"
      onClick={() => setChecked((prev) => !prev)}
      className="w-[28px] h-[28px] p-[2.33px]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className={`${checked ? "text-[#FC3367]" : "text-gray-300"}`}
      >
        {/* 배경 원 */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.3333 11.6667C23.3333 18.1097 18.1097 23.3333 11.6667 23.3333C5.22366 23.3333 0 18.1097 0 11.6667C0 5.22366 5.22366 0 11.6667 0C18.1097 0 23.3333 5.22366 23.3333 11.6667Z"
          fill="currentColor"
        />

        {/* 체크 표시 */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.2312 8.24717C17.6485 8.6645 17.6485 9.34113 17.2312 9.75846L11.2639 15.7258C11.0635 15.9262 10.7917 16.0387 10.5083 16.0387C10.2248 16.0387 9.95303 15.9262 9.75262 15.7258L6.10214 12.0753C5.68481 11.6579 5.68481 10.9813 6.10214 10.564C6.51947 10.1467 7.1961 10.1467 7.61343 10.564L10.5083 13.4588L15.7199 8.24717C16.1372 7.82984 16.8139 7.82984 17.2312 8.24717Z"
          fill="white"
        />
      </svg>
    </button>
  );
};

export default CheckIcon;
