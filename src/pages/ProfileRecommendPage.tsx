import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
import chatpinkbox from "../assets/chat_pinkbox.svg";
import KeywordLabel from "../components/keyword/KeywordLabel";
import RecommendCard2 from "../components/card/presets/RecommendCard2";
import { useLocation } from "react-router-dom";

type Profile = {
  id: number;
  name: string;
  age: number;
  imageUrl: string;
  distance: number;
  area: string;
};

export default function ProfileRecommendPage() {
  const location = useLocation();
  const profile = (location.state as { profile: Profile })?.profile;

  // 🔒 방어 처리 (직접 URL 접근 대비)
  if (!profile) {
    return (
      <div className="flex justify-center min-h-screen items-center">
        <p>프로필 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-[420px] h-screen bg-[#F8FAFB] flex flex-col overflow-hidden flex-1 relative">
        <main className="flex-1 overflow-y-auto pb-[62px]">
          {/* 프로필 이미지 및 백버튼 */}
          <div className="relative">
            <div className="h-[585px]">
              <RecommendCard2
                profileUrl={`/home/profile/${profile.id}`}
                targetUserId={profile.id}
                imageUrl={profile.imageUrl}
                name={profile.name}
                age={profile.age}
                distance={`${profile.distance}`}
                area={profile.area}
              />
            </div>
            <header className="absolute inset-0 w-full pt-[5px] shrink-0">
              <BackButton />
            </header>
          </div>
          <section className="m-[20px]">
            <section className="flex flex-col gap-[12px] mb-[15px]">
              <h1 className="text-[20px] font-semibold">소개</h1>
              <p className="flex bg-white rounded-xl border border-[#E9ECED] shadow-[0px_4px_24px_rgba(0,0,0,0.06)] text-[14px] text-gray-700 px-[14px] py-[14px]">
                안녕하세요. 하루를 마무리하며 나누는 소소한 대화를 좋아합니다.
                서두르지 않고, 편안하게 이야기할 수 있는 인연을 만나고 싶어요.
              </p>
            </section>
            <section className="flex flex-col gap-[12px] mb-[15px]">
              <h1 className="text-[20px] font-semibold">저의 관심사에요.</h1>
              <div className="flex flex-wrap gap-[8px]">
                <KeywordLabel keyword="식물키우기" />
                <KeywordLabel keyword="반려동물케어" />
                <KeywordLabel keyword="공부취미" />
              </div>
            </section>
            <section className="flex flex-col gap-[12px] mb-[15px]">
              <h1 className="text-[20px] font-semibold">이런 사람이 좋아요.</h1>
              <div className="flex flex-wrap gap-[8px]">
                <KeywordLabel keyword="식물키우기" />
                <KeywordLabel keyword="반려동물케어" />
                <KeywordLabel keyword="공부취미" />
                <KeywordLabel keyword="식물키우기" />
                <KeywordLabel keyword="반려동물케어" />
                <KeywordLabel keyword="공부취미" />
              </div>
            </section>
            <section className="mb-[15px]">
              <div
                className="flex flex-col w-full rounded-2xl items-center gap-[8px] px-[16px] py-[16px]"
                style={{
                  background:
                    "linear-gradient(93.1deg, rgba(252, 51, 103, 0.35) -7.07%, rgba(254, 126, 113, 0.35) 65.84%, rgba(255, 202, 122, 0.35) 113.06%, rgba(255, 255, 255, 0.35) 158.75%)",
                }}
              >
                <p className="text-[16px] font-medium">
                  나와 이런점이 닮았어요!
                </p>
                <div className="flex flex-wrap justify-center gap-[8px]">
                  <p className="bg-[#FFFFFF] rounded-lg text-[14px] text-gray-700 px-[12px] py-[4px]">
                    친절한
                  </p>
                  <p className="bg-[#FFFFFF] rounded-lg text-[14px] text-gray-700 px-[12px] py-[4px]">
                    친절한
                  </p>
                </div>
              </div>
            </section>
            <img src={chatpinkbox} />
          </section>
        </main>
        <Navbar />
      </div>
    </div>
  );
}
