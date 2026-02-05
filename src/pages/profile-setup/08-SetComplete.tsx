import { useNavigate } from "react-router-dom"; // 페이지 이동용
import { useUserStore } from "../../stores/useUserStore";
import KeywordLabel from "../../components/keyword/KeywordLabel";
import locationIcon from "../../assets/location.svg";


export default function SetComplete() {
  const navigate = useNavigate();

  const { user } = useUserStore();

  const handleStart = async () => {
    try {
      // 💡 여기서 백엔드에 최종 회원가입 요청(POST)을 보낼 수 있습니다.
      // await signupApi(user);

      console.log("최종 가입 정보:", user);

      // 메인 페이지로 이동
      navigate("/home");
    } catch (error) {
      console.error("가입 실패", error);
    }
  };

return (
  <div className="flex-1 flex flex-col px-2">
    <div className="mt-5 mb-5">
      <h1 className="text-[26px] font-bold text-black leading-tight">
        {user?.nickname}님의 프로필이 준비됐어요!
      </h1>
      <p className="text-gray-500 text-[15px] mt-2">
        이제 새로운 인연을 만나볼 시간이에요. <br/>
        천천히 둘러보며 시작해봐요.
      </p>
    </div>

    {/* 카드 */}
    <div className="relative w-full h-[380px] w-[314px] overflow-hidden mb-6 rounded-[30px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${user?.profileImageUrl})`,
        }}
      />

      <div className="absolute inset-0 backdrop-blur-[24px]"/>
      
      <div className="relative z-10 flex flex-col items-center px-8 pt-8 pb-4">
        <div className="w-[102px] h-[102px] rounded-full overflow-hidden border-[3px] border-white mb-4">
          <img
            src={user?.profileImageUrl}
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-[22px] font-bold mb-1 text-white">
          {user?.nickname}
        </h2>

        <p className="text-[14px] opacity-90 mb-3 flex items-center gap-1 text-white">
          <img src={locationIcon}/>
          {user?.area.name} 거주 · {user?.age}세
        </p>

        <p className="text-[14px] text-center opacity-80 mb-2 line-clamp-2 leading-relaxed text-white">
          {user?.introText}
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-2 px-4">
        {[...(user?.personalities || []), ...(user?.keywords || [])].map(
          (k, i) => (
            <KeywordLabel
              key={i}
              keyword={k}
              shape="pill"
            />
          )
        )}
      </div>
    </div>

    <div className="mt-auto pb-10">
      <p className="text-center text-gray-500 text-[14px] mb-5">프로필은 설정에서 언제든지 수정할 수 있어요.</p>
      <button
        onClick={handleStart}
        className="w-full py-5 rounded-[20px] text-[18px] font-semibold transition-all bg-[#FC3367] text-white active:bg-pink-300"
      >
        시작하기
      </button>
    </div>
  </div>
);
}
