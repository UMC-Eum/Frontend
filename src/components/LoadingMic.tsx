const LoadingMic = () => {
  return (
    <div className="relative w-[90px] h-[90px]">
      {/* 바깥 원 */}
      <svg
        viewBox="0 0 90 90"
        className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_50.625px_0_rgba(161,0,42,0.12)]"
        fill="none"
      >
        <circle cx="45" cy="45" r="45" fill="white" />
      </svg>

      {/* 로딩 점 */}
      <svg
        width="45"
        height="30"
        viewBox="0 0 45 30"
        fill="none"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[45px] h-[30px]"
      >
        <circle cx="4.5" cy="15" r="4.5" fill="#FC3367">
          <animate
            attributeName="cy"
            values="15;6;15;15;15"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="22.5" cy="15" r="4.5" fill="#FC3367">
          <animate
            attributeName="cy"
            values="15;6;6;15;15"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="40.5" cy="15" r="4.5" fill="#FC3367">
          <animate
            attributeName="cy"
            values="15;6;6;6;15"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default LoadingMic;
