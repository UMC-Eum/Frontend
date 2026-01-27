import { useNavigate } from "react-router-dom"; // 페이지 이동용
import { useUserStore } from "../../stores/useUserStore";
import { KEYWORDS } from "../../components/keyword/keyword.model"; // 키워드 정보 매핑용
import KeywordLabel from "../../components/keyword/KeywordLabel";

export default function SetComplete() {
  const navigate = useNavigate();

  // ✅ 1. 스토어에서 완성된 유저 정보 가져오기
  const { user } = useUserStore();

  // 유저 정보가 없을 경우 (새로고침 등) 방어 로직
  if (!user) {
    return <div className="p-4">유저 정보를 불러오는 중입니다...</div>;
  }

  // ✅ 2. 저장된 location 객체에서 이름만 꺼내기
  // user.area는 { code: "...", name: "경기 분당 인근" } 형태임
  const locationName = user.area?.name || "지역 미정";

  // ✅ 3. 저장된 키워드(string[])를 화면 표시용 객체로 변환
  // KeywordLabel이 객체(id, label, color 등)를 요구한다고 가정
  const displayKeywords = KEYWORDS.filter((k) =>
    user.keywords?.includes(k.label)
  );

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
    <div className="flex flex-col h-full px-2">
      <div className="mt-12 mb-10">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          {user.nickname}님의 프로필이 준비됐어요!
        </h1>
        <div className="text-gray-400 text-[15px] mt-2 decoration-gray-300 underline-offset-4">
          <p>이제 새로운 인연을 만나볼 시간이에요.</p>
          <p>천천히 둘러보며 시작해봐요.</p>
        </div>
      </div>

      <div className="relative w-full aspect-[4/5] rounded-[30px] overflow-hidden shadow-xl mb-6">
        {/* ✅ 프로필 이미지가 있으면 보여주고, 없으면 기본 이미지 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${
              user.profileImageUrl ||
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            })`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center text-white">
          <h2 className="text-[24px] font-bold mb-1">{user.nickname}</h2>
          <p className="text-[16px] opacity-90 mb-4">
            {locationName} 거주 · {user.age}세
          </p>

          <p className="text-[14px] text-center opacity-80 mb-6 line-clamp-2">
            {/* introText가 있다면 보여주고, 없으면 기본 문구 */}
            {user.introText || "안녕하세요! 반갑습니다."}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {/* 변환된 키워드 객체 리스트 사용 */}
            {displayKeywords.map((k) => (
              <KeywordLabel key={k.id} keyword={k} shape="pill" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pb-10">
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
