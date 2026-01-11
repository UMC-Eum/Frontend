import { ProfileData } from "./ProfileSetupMain";
import KeywordLabel from "../../components/keyword/KeywordLabel";

interface SetCompleteProps {
  profileData: ProfileData;
}

export default function SetComplete({ profileData }: SetCompleteProps) {
  const { name, age, location, keywords } =
    profileData;
  return (
    <div className="flex flex-col h-full px-2">
      <div className="mt-12 mb-10">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          {name}님의 프로필이 준비됐어요!
        </h1>
        <div className="text-gray-400 text-[15px] mt-2 decoration-gray-300 underline-offset-4">
          <p>이제 새로운 인연을 만나볼 시간이에요.</p>
          <p>천천히 둘러보며 시작해봐요.</p>
        </div>
      </div>

      <div className="relative w-full aspect-[4/5] rounded-[30px] overflow-hidden shadow-xl mb-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee)`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center text-white">
          <h2 className="text-[24px] font-bold mb-1">{name}</h2>
          <p className="text-[16px] opacity-90 mb-4">
            {location} 거주 · {age}세
          </p>

          <p className="text-[14px] text-center opacity-80 mb-6 line-clamp-2">
            안녕하세요! 반갑습니다.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {keywords?.map((k) => (
              <KeywordLabel key={k.id} keyword={k} shape="pill" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pb-10">
        <button
          className={`w-full py-5 rounded-[20px] text-[18px] font-semibold transition-all ${"bg-[#FC3367] text-white active:bg-pink-300"}`}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
