import { useNavigate } from "react-router-dom";

const EmptyNotification = () => {
  const navigate = useNavigate();

  const info = {
    title: "아직 받은 마음이 없어요.",
    desc: "지금 나와 어울릴 것 같은\n사람을 먼저 찾으러가요.",
  };

  return (
    <div className="flex flex-col items-center mt-[174px] px-[20px] text-center">
      <div className="flex items-center justify-center h-[81px] w-full">
        <svg width="112" height="78" viewBox="0 0 112 78" fill="none">
          <rect
            x="16.9438"
            y="15.1934"
            width="95.0587"
            height="61.2792"
            rx="6"
            transform="rotate(0.77691 16.9438 15.1934)"
            fill="#DADFE1"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M71.2153 35.8716C74.3236 32.8777 79.2704 32.9705 82.2642 36.0787C85.2579 39.187 85.1652 44.1338 82.057 47.1275L80.4407 48.6844L80.456 48.7004L69.8505 58.9155C69.4914 59.2612 68.9203 59.2504 68.5744 58.8915L56.8206 46.6896C53.8269 43.5814 53.9198 38.6346 57.0277 35.6407C60.1359 32.6469 65.0827 32.7397 68.0766 35.8479L69.599 37.4285L71.2153 35.8716Z"
            fill="#DADFE1"
          />
          <rect
            y="7.76416"
            width="99"
            height="65"
            rx="6"
            transform="rotate(-4.49808 0 7.76416)"
            fill="#E9ECED"
          />
          <path
            d="M92.7136 0.470577C96.0171 0.210698 98.9058 2.67804 99.1656 5.98154L99.7068 12.8607L52.242 40.7129L1.02964 20.8526L0.470554 13.7457C0.210674 10.4422 2.67802 7.55349 5.98152 7.29361L92.7136 0.470577Z"
            fill="url(#paint_like_linear)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M53.5448 26.292C56.3476 23.0106 61.2801 22.6228 64.5616 25.4253C67.8431 28.2282 68.2311 33.1606 65.4282 36.4421L63.9706 38.1476L63.9884 38.1628L54.425 49.3594C54.1011 49.7386 53.5308 49.7835 53.1516 49.4596L40.2695 38.4565C36.988 35.6536 36.6 30.7212 39.4028 27.4398C42.2057 24.1585 47.1381 23.7704 50.4195 26.5731L52.0872 27.9975L53.5448 26.292Z"
            fill="white"
          />
          <defs>
            <linearGradient
              id="paint_like_linear"
              x1="49.3475"
              y1="3.88209"
              x2="52.2449"
              y2="40.7126"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#DEE3E5" />
              <stop offset="1" stopColor="#CCD0D1" />
            </linearGradient>
          </defs>
        </svg>
        ) : (
        <svg width="127" height="81" viewBox="0 0 127 81" fill="none">
          <rect width="66" height="40" rx="6" fill="url(#paint_msg_linear)" />
          <rect x="47" y="17" width="6" height="9" rx="3" fill="white" />
          <rect x="36" y="17" width="6" height="6" rx="3" fill="white" />
          <rect x="25" y="14" width="6" height="12" rx="3" fill="white" />
          <rect x="14" y="17" width="6" height="6" rx="3" fill="white" />
          <rect x="37" y="21" width="90" height="50" rx="6" fill="#E9ECED" />
          <path
            d="M107.485 78.1341C108.78 79.2558 110.794 78.3357 110.794 76.6222L110.794 69.5C110.794 68.3954 109.899 67.5 108.794 67.5H100.57C98.7185 67.5 97.8611 69.7996 99.2609 71.0119L107.485 78.1341Z"
            fill="#E9ECED"
          />
          <path
            d="M13.1456 45.1721C13.2023 47.0189 15.5185 47.8078 16.6907 46.3795L21.9725 39.9434C22.8335 38.8942 22.4217 37.3103 21.1587 36.8134L15.6122 34.6313C14.2756 34.1054 12.8368 35.1181 12.8809 36.5538L13.1456 45.1721Z"
            fill="#DEE3E5"
          />
          <path
            d="M64.2575 40H64.2425C62.4517 40 61 41.4551 61 43.25V49.75C61 51.5449 62.4517 53 64.2425 53H64.2575C66.0483 53 67.5 51.5449 67.5 49.75V43.25C67.5 41.4551 66.0483 40 64.2575 40Z"
            fill="white"
          />
          <path
            d="M76.2575 34H76.2425C74.4517 34 73 35.2928 73 36.8875V55.1125C73 56.7072 74.4517 58 76.2425 58H76.2575C78.0483 58 79.5 56.7072 79.5 55.1125V36.8875C79.5 35.2928 78.0483 34 76.2575 34Z"
            fill="white"
          />
          <path
            d="M88.2575 40H88.2425C86.4517 40 85 41.4537 85 43.247V50.753C85 52.5463 86.4517 54 88.2425 54H88.2575C90.0483 54 91.5 52.5463 91.5 50.753V43.247C91.5 41.4537 90.0483 40 88.2575 40Z"
            fill="white"
          />
          <path
            d="M100.258 42H100.242C98.4517 42 97 43.4536 97 45.2466V47.7534C97 49.5464 98.4517 51 100.242 51H100.258C102.048 51 103.5 49.5464 103.5 47.7534V45.2466C103.5 43.4536 102.048 42 100.258 42Z"
            fill="white"
          />
          <defs>
            <linearGradient
              id="paint_msg_linear"
              x1="29"
              y1="30"
              x2="51"
              y2="42"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#DEE3E5" />
              <stop offset="1" stopColor="#DADEDF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h2 className="mt-[40px] text-[20px] font-bold text-[#202020]">
        {info.title}
      </h2>

      <p className="mt-[12px] text-[18px] text-[#707070] leading-[140%] font-medium">
        {info.desc.split("\n").map((line: string, i: number) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </p>

      <button
        onClick={() => navigate("/home")}
        className="mt-[24px] w-[113px] h-[43px] flex items-center justify-center rounded-[14px] bg-[#FC3367] text-white font-semibold text-[16px] active:scale-95 transition-transform"
      >
        홈으로 가기
      </button>
    </div>
  );
};

export default EmptyNotification;
