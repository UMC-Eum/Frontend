import { useNotificationStore } from "../stores/useNotificationStore";
import { useNavigate } from "react-router-dom";

const LikeModal = () => {
  const { isModalOpen, selectedNotificationId, closeModal } =
    useNotificationStore();
  const navigate = useNavigate();

  if (!isModalOpen || !selectedNotificationId) return null;

  return (
    <div
      className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center"
      onClick={closeModal}
    >
      <div
        className="relative w-[322px] rounded-[24px] bg-white flex flex-col items-center p-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 (X) */}
        <button
          onClick={closeModal}
          className="absolute top-[20px] right-[20px] p-1 hover:opacity-70 transition-opacity"
        >
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1L13 13M1 13L13 1"
              stroke="#A6AFB6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* 상단 텍스트 섹션 */}
        <div className="mt-6 text-center">
          <h1 className="text-[22px] font-bold leading-[1.3] text-[#202020]">
            누군가 회원님을
            <br />
            마음에 들어 했어요!
          </h1>
          <p className="text-[#8E949A] text-[16px] mt-2 font-medium">
            지금 바로 만나러 가볼까요?
          </p>
        </div>

        {/* 중앙 하트 SVG 섹션 (마진 조정으로 중앙 배치) */}
        <div className="flex-1 flex items-center justify-center mt-[16px] mb-[32px]">
          <svg
            width="109"
            height="94"
            viewBox="0 0 109 94"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_i_3757_5374)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M59.9828 8.33146C71.0914 -2.77715 89.1027 -2.77715 100.211 8.33146C111.32 19.4401 111.32 37.4514 100.211 48.56L94.436 54.3344L94.4926 54.392L56.5893 92.2953C55.3055 93.5787 53.2245 93.5788 51.9408 92.2953L8.33146 48.6859C-2.77715 37.5773 -2.77715 19.566 8.33146 8.45743C19.44 -2.65085 37.4505 -2.65094 48.559 8.45743L54.2074 14.1059L59.9828 8.33146Z"
                fill="url(#paint0_linear_3757_5374)"
              />
            </g>
            <g filter="url(#filter1_f_3757_5374)">
              <path
                d="M95.5223 19.6192C99.1331 25.168 96.8328 30.2235 92.4893 30.8367C88.1458 31.45 90.499 28.3831 89.7754 23.2579C89.0518 18.1327 76.3399 15.2594 80.6834 14.6461C85.0269 14.0329 91.9115 14.0703 95.5223 19.6192Z"
                fill="#FFC0C0"
                fillOpacity="0.88"
                style={{ mixBlendMode: "lighten" }}
              />
            </g>
            <g filter="url(#filter2_f_3757_5374)">
              <circle cx="94.1023" cy="21.7773" r="2.1543" fill="white" />
            </g>
            <defs>
              <filter
                id="filter0_i_3757_5374"
                x="0"
                y="-1"
                width="116.543"
                height="94.2578"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="8" dy="-1" />
                <feGaussianBlur stdDeviation="7.45" />
                <feComposite
                  in2="hardAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
                />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.543006 0 0 0 0 0 0 0 0 0 0.181002 0 0 0 0.2 0"
                />
                <feBlend
                  mode="normal"
                  in2="shape"
                  result="effect1_innerShadow_3757_5374"
                />
              </filter>
              <filter
                id="filter1_f_3757_5374"
                x="71.0813"
                y="5.68379"
                width="34.9264"
                height="33.9308"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="4.35"
                  result="effect1_foregroundBlur_3757_5374"
                />
              </filter>
              <filter
                id="filter2_f_3757_5374"
                x="84.448"
                y="12.123"
                width="19.3086"
                height="19.3086"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="3.75"
                  result="effect1_foregroundBlur_3757_5374"
                />
              </filter>
              <linearGradient
                id="paint0_linear_3757_5374"
                x1="-8.09015"
                y1="4.95021e-07"
                x2="180.905"
                y2="11.9317"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FC3367" />
                <stop offset="0.439695" stopColor="#FE7E71" />
                <stop offset="0.724443" stopColor="#FFCA7A" />
                <stop offset="1" stopColor="white" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 하단 버튼 섹션 */}
        <div className="flex gap-[12px] w-full mt-auto mb-2">
          <button
            onClick={closeModal}
            className="flex-1 h-[56px] bg-[#EDF0F3] text-[18px] text-[#8E949A] rounded-[14px] font-bold"
          >
            다음에
          </button>
          <button
            onClick={() => {
              closeModal();
              navigate("/like");
            }}
            className="flex-1 h-[56px] bg-[#F22459] text-[18px] text-white rounded-[14px] font-bold"
          >
            바로 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LikeModal;
