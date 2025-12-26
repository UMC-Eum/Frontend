const RecordingMic = () => {
  return (
    <button type="button" className="relative w-[90px] h-[90px]">
      {/* bottom */}
      <svg viewBox="0 0 90 90" className="absolute inset-0" fill="none">
        <circle cx="45" cy="45" r="45" fill="white" />
      </svg>

      {/* top */}
      <svg viewBox="0 0 81 81" className="absolute inset-0" fill="none">
        {/* ✅ 중앙 기준 고정 */}
        <g transform="translate(4.5 4.5)">
          {/* 기준 y = 20.1602 */}
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
              values="20.16;16;20.16"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="height"
              values="5.76;13.76;5.76"
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
              values="20.16;12;20.16"
              dur="1s"
              begin="0.1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="height"
              values="5.76;21.76;5.76"
              dur="1s"
              begin="0.1s"
              repeatCount="indefinite"
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
              values="20.16;8;20.16"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="height"
              values="5.76;29.76;5.76"
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
              values="20.16;12;20.16"
              dur="1s"
              begin="0.15s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="height"
              values="5.76;21.76;5.76"
              dur="1s"
              begin="0.15s"
              repeatCount="indefinite"
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
              values="20.16;16;20.16"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="height"
              values="5.76;13.76;5.76"
              dur="1s"
              repeatCount="indefinite"
            />
          </rect>
        </g>
      </svg>
    </button>
  );
};

export default RecordingMic;
