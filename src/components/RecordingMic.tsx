const RecordingMic = () => {
  //추후 수정예정 svg 애니메이션
  return (
    <div className="relative w-[90px] h-[90px]">
      {/* 바깥 원 (90) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 90 90"
        className="pointer-events-none absolute inset-0 w-[90px] h-[90px] rounded-full shadow-[0_0_50.625px_0_rgba(161,0,42,0.12)]"
        fill="none"
      >
        <circle cx="45" cy="45" r="45" fill="white" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 47 47"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[47px] h-[47px]"
        fill="none"
      >
        <rect
          x="2.88"
          y="20.1602"
          width="5.76"
          height="5.76"
          rx="2.88"
          fill="#FC3367"
        >
          <animate
            attributeName="y"
            values="20.16;19;20.16"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="height"
            values="5.76;8.16;5.76"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>

        <rect
          x="11.52"
          y="20.1602"
          width="5.76"
          height="5.76"
          rx="2.88"
          fill="#FC3367"
        >
          <animate
            attributeName="y"
            values="20.16;15;20.16"
            dur="1s"
            repeatCount="indefinite"
            begin="0.1s"
          />
          <animate
            attributeName="height"
            values="5.76;15.76;5.76"
            dur="1s"
            repeatCount="indefinite"
            begin="0.1s"
          />
        </rect>

        <rect
          x="20.16"
          y="20.1602"
          width="5.76"
          height="5.76"
          rx="2.88"
          fill="#FC3367"
        >
          <animate
            attributeName="y"
            values="20.16;10;20.16"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="height"
            values="5.76;25.76;5.76"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>

        <rect
          x="28.8"
          y="20.1602"
          width="5.76"
          height="5.76"
          rx="2.88"
          fill="#FC3367"
        >
          <animate
            attributeName="y"
            values="20.16;15;20.16"
            dur="1s"
            repeatCount="indefinite"
            begin="0.15s"
          />
          <animate
            attributeName="height"
            values="5.76;15.76;5.76"
            dur="1s"
            repeatCount="indefinite"
            begin="0.15s"
          />
        </rect>

        <rect
          x="37.44"
          y="20.1602"
          width="5.76"
          height="5.76"
          rx="2.88"
          fill="#FC3367"
        >
          <animate
            attributeName="y"
            values="20.16;19;20.16"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="height"
            values="5.76;8.16;5.76"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </div>
  );
};

export default RecordingMic;
