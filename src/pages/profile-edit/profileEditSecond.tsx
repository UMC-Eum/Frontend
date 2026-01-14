import BackButton from "../../components/BackButton";
import { useUserStore } from "../../stores/useUserStore";
import camera_btn from "../../assets/camera_btn.png";
const ProfileEditSecond = () => {
  const { user } = useUserStore();
  const hasIntro = user?.introText && user.introText.trim().length > 0;
  // 프로필 이미지가 없으면 기본 이미지 사용
  return (
    <div>
      <BackButton title="내 프로필" textClassName="text-[24px] font-semibold" />
      <div className="h-[108px] w-full flex items-start">
        <div className="flex flex-row gap-x-[12px] items-center justify-center px-[20px] pt-[7px]">
          <div
            className={`relative w-[82px] h-[82px] rounded-full border-[2px] border-[#FC3367] flex items-center justify-center`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              <img
                src={user?.profileImageUrl}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </div>
            <button className="absolute -bottom-1 -right-1 w-[24px] h-[24px] flex items-center justify-center">
              <img src={camera_btn} alt="Change" />
            </button>
          </div>
          <div className="flex flex-col gap-y-1">
            <span className="text-black text-[20px] font-semibold">
              {user?.nickname} {user?.age}
            </span>
            <span className="text-gray-700 text-[14px] font-[500]">
              {user?.area.name}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 w-full h-[20px]"></div>
      <div className="flex flex-col p-[20px] h-[225px] justify-center">
        <p className="h-[48px] text-gray-900 text-[20px] font-[600] mb-[10px]">
          나의 소개
        </p>
        <div
          className={`
            w-full h-[79px] p-[14px] 
            border-[1px] border-[#E9ECED] bg-gray-100 rounded-[14px] 
            text-[16px] leading-[120%]
            ${hasIntro ? "text-gray-700" : "text-gray-400"} 
          `}
        >
          {hasIntro ? user.introText : "자기소개를 입력해주세요"}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditSecond;
