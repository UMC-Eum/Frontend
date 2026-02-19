import RecommendCard from "../card/presets/RecommendCard1";
import avatar_placeholder from "../../assets/avatar_placeholder.svg";
interface Props {
  onNext: () => void;
  onClose: () => void;
}

const TutorialStep1 = ({ onNext, onClose }: Props) => {
  const MOCK_PROFILE = {
    targetUserId: -1,
    profileUrl: "#",
    imageUrl: avatar_placeholder,
    nickname: "홍길동",
    age: 68,
    area: "서울 강남구",
    description: "함께 맛집 탐방하실 분 찾아요! 😊",
    keywords: ["맛집탐방", "여행", "영화", "산책"],
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-[20px] right-[37.5px] p-1 hover:opacity-70 transition-opacity z-50"
        aria-label="닫기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
        >
          <path
            d="M19.2714 4.62695C19.6498 4.22486 20.2832 4.20568 20.6854 4.58398C21.0876 4.96248 21.1068 5.59587 20.7284 5.99805L14.3729 12.75L20.7284 19.502C21.1069 19.9041 21.0876 20.5375 20.6854 20.916C20.2832 21.2945 19.6499 21.2752 19.2714 20.873L12.9999 14.209L6.72839 20.873C6.3499 21.2752 5.71651 21.2945 5.31433 20.916C4.91233 20.5375 4.89295 19.9041 5.27136 19.502L11.6268 12.75L5.27136 5.99805C4.89306 5.59586 4.91223 4.96243 5.31433 4.58398C5.71646 4.20558 6.34988 4.22495 6.72839 4.62695L12.9999 11.29L19.2714 4.62695Z"
            fill="white"
          />
        </svg>
      </button>

      <div className="absolute top-[10vh] left-1/2 -translate-x-1/2">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="196"
            height="44"
            viewBox="0 0 196 44"
            fill="none"
          >
            <path
              d="M192.989 18.8359L192.996 18.8301L195.824 21.6582L174.126 43.3564L171.298 40.5283L187.912 23.9141H112.496C111.981 31.7321 105.478 37.9141 97.5303 37.9141C89.5821 37.9141 83.0791 31.7321 82.5645 23.9141H7.91211L24.5264 40.5283L21.6982 43.3564L0 21.6582L2.82812 18.8301L2.83496 18.8359L21.6709 0L24.499 2.82812L7.41309 19.9141H82.8301C84.2199 13.0673 90.2734 7.91406 97.5303 7.91406C104.787 7.91406 110.841 13.0673 112.23 19.9141H188.411L171.325 2.82812L174.153 0L192.989 18.8359ZM97.5303 11.9141C91.4551 11.9141 86.5303 16.8389 86.5303 22.9141C86.5303 28.9892 91.4551 33.9141 97.5303 33.9141C103.605 33.9141 108.53 28.9892 108.53 22.9141C108.53 16.8389 103.605 11.9141 97.5303 11.9141Z"
              fill="url(#paint0_linear_2882_5386)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_2882_5386"
                x1="-14.5956"
                y1="2.3014e-07"
                x2="308.35"
                y2="79.1183"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FC3367" />
                <stop offset="0.439695" stopColor="#FE7E71" />
                <stop offset="0.724443" stopColor="#FFCA7A" />
                <stop offset="1" stopColor="white" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-[2px] translate-y-[2px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="43"
              height="44"
              viewBox="0 0 43 44"
              fill="none"
            >
              <rect
                x="6.85698"
                y="2.21074"
                width="6.61009"
                height="38.6202"
                rx="3.30504"
                transform="rotate(-12.2759 6.85698 2.21074)"
                fill="white"
                stroke="black"
                strokeWidth="1.35348"
              />
              <rect
                x="15.3773"
                y="10.2679"
                width="6.62117"
                height="29.1311"
                rx="3.31058"
                transform="rotate(-12.2759 15.3773 10.2679)"
                fill="white"
                stroke="black"
                strokeWidth="1.35348"
              />
              <rect
                x="22.2504"
                y="10.5286"
                width="6.69298"
                height="28.9021"
                rx="3.34649"
                transform="rotate(-12.2759 22.2504 10.5286)"
                fill="white"
                stroke="black"
                strokeWidth="1.35348"
              />
              <rect
                x="29.192"
                y="10.9144"
                width="6.39299"
                height="22.0846"
                rx="3.1965"
                transform="rotate(-12.2759 29.192 10.9144)"
                fill="white"
                stroke="black"
                strokeWidth="1.35348"
              />
              <mask id="path-5-inside-1_2882_5411" fill="white">
                <path d="M9.86322 19.1079L36.9288 13.2186L40.5053 29.655C41.4589 34.0375 38.6792 38.3633 34.2967 39.3169L23.1016 41.7529C18.7191 42.7065 14.3933 39.9269 13.4397 35.5444L9.86322 19.1079Z" />
              </mask>
              <path
                d="M9.86322 19.1079L36.9288 13.2186L40.5053 29.655C41.4589 34.0375 38.6792 38.3633 34.2967 39.3169L23.1016 41.7529C18.7191 42.7065 14.3933 39.9269 13.4397 35.5444L9.86322 19.1079Z"
                fill="white"
              />
              <path
                d="M9.86322 19.1079L36.9288 13.2186L9.86322 19.1079ZM41.8278 29.3673C42.9403 34.4802 39.6974 39.5269 34.5845 40.6395L23.3894 43.0755C18.2765 44.188 13.2297 40.9451 12.1172 35.8321L14.7622 35.2566C15.5569 38.9087 19.1617 41.2251 22.8138 40.4304L34.0089 37.9944C37.661 37.1997 39.9774 33.5949 39.1827 29.9428L41.8278 29.3673ZM23.3894 43.0755C18.2765 44.188 13.2297 40.9451 12.1172 35.8321L8.54068 19.3957L11.1858 18.8201L14.7622 35.2566C15.5569 38.9087 19.1617 41.2251 22.8138 40.4304L23.3894 43.0755ZM38.2513 12.9308L41.8278 29.3673C42.9403 34.4802 39.6974 39.5269 34.5845 40.6395L34.0089 37.9944C37.661 37.1997 39.9774 33.5949 39.1827 29.9428L35.6062 13.5064L38.2513 12.9308Z"
                fill="black"
                mask="url(#path-5-inside-1_2882_5411)"
              />
              <path
                d="M1.49618 25.3809C3.21626 22.1708 7.54666 21.5307 10.1219 24.1059L18.8335 32.8175C19.9734 33.9574 20.1614 35.7388 19.2846 37.0915C18.1095 38.9044 15.5677 39.185 14.0254 37.672L1.49618 25.3809Z"
                fill="white"
              />
              <path
                d="M1.74158 24.8899L1.18328 24.5075C0.998251 24.7776 1.03309 25.1414 1.26602 25.3714L1.74158 24.8899ZM5.74594 22.5022L5.79096 21.827L5.74594 22.5022ZM11.83 27.6174C12.0986 27.8773 12.5271 27.8702 12.7869 27.6016C13.0468 27.3329 13.0397 26.9045 12.7711 26.6446L12.3006 27.131L11.83 27.6174ZM16.4609 39.4279L16.9364 38.9465L2.21713 24.4085L1.74158 24.8899L1.26602 25.3714L15.9853 39.9094L16.4609 39.4279ZM1.74158 24.8899L2.29987 25.2724C2.87433 24.4339 3.82651 23.0525 5.70093 23.1775L5.74594 22.5022L5.79096 21.827C3.07174 21.6457 1.71895 23.7255 1.18328 24.5075L1.74158 24.8899ZM5.74594 22.5022L5.70093 23.1775C6.94695 23.2605 7.86055 23.759 8.77174 24.5435C9.23576 24.9429 9.69154 25.4101 10.1926 25.9363C10.6877 26.4564 11.2262 27.0332 11.83 27.6174L12.3006 27.131L12.7711 26.6446C12.1928 26.0851 11.6797 25.5354 11.1728 25.003C10.6718 24.4768 10.175 23.9656 9.6548 23.5177C8.59751 22.6075 7.41596 21.9353 5.79096 21.827L5.74594 22.5022Z"
                fill="black"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 w-[183px]">
        <p className="text-white text-[20px] font-[500] text-center leading-[140%]">
          좌우로 화면을 넘겨
          <br />
          좋은 인연을 만나보세요
        </p>
      </div>

      <div className="absolute top-[30vh] left-1/2 -translate-x-1/2 pointer-events-none border border-[1px] border-white rounded-[14px]">
        <RecommendCard
          className="w-[362px] h-[453px]"
          targetUserId={MOCK_PROFILE.targetUserId}
          profileUrl={MOCK_PROFILE.profileUrl}
          imageUrl={MOCK_PROFILE.imageUrl}
          nickname={MOCK_PROFILE.nickname}
          age={MOCK_PROFILE.age}
          area={MOCK_PROFILE.area}
          description={MOCK_PROFILE.description}
          keywords={MOCK_PROFILE.keywords}
          onGoProfile={() => {}}
        />
      </div>

      <button
        onClick={onNext}
        className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 px-8 py-3 bg-[rgba(0,0,0,0.70)] text-white rounded-[22px] text-[16px] border border-white whitespace-nowrap z-[10000] hover:bg-black/90 transition"
      >
        다음
      </button>
    </div>
  );
};

export default TutorialStep1;
