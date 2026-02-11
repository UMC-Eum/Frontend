import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import BackButton from "../components/BackButton";
import Navbar from "../components/standard/Navbar";
import chatpinkbox from "../assets/chat_pinkbox.svg";
import KeywordLabel from "../components/keyword/KeywordLabel";
import RecommendCard2 from "../components/card/presets/RecommendCard2";
import { createChatRoom } from "../api/chats/chatsApi";

type Profile = {
  id: number;
  name: string;
  age: number;
  imageUrl: string;
  area: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop";

export default function ProfileRecommendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const stateProfile = (location.state as { profile?: Profile } | null)
    ?.profile;

  const profile: Profile | null =
    stateProfile ??
    (id
      ? {
          id: Number(id),
          name: `유저 ${id}`,
          age: 0,
          imageUrl: FALLBACK_IMAGE,
          area: "",
        }
      : null);

  const { mutate: handleStartChat, isPending } = useMutation({
    mutationFn: () => createChatRoom({ targetUserId: profile!.id }),

    onSuccess: (data) => {
      navigate(`/message/room/${data.chatRoomId}`, {
        state: { peer: data.peer },
      });
    },
    onError: (error) => {
      console.error("채팅방 생성 실패:", error);
      alert("상대방과 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    },
  });

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
        <main className="flex-1 overflow-y-auto pb-[72px]">
          <div className="relative">
            <div className="relative w-full h-[585px] overflow-hidden">
              <RecommendCard2
                profileUrl={`/home/profile/${profile.id}`}
                targetUserId={profile.id}
                imageUrl={profile.imageUrl}
                nickname={profile.name}
                age={profile.age}
                area={profile.area}
              />
            </div>
            <header className="absolute inset-0 w-full pt-[5px] shrink-0 pointer-events-none">
              <div className="pointer-events-auto">
                <BackButton />
              </div>
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
                {["식물키우기", "반려동물케어", "공부취미"].map((k, i) => (
                  <KeywordLabel key={i} keyword={k} />
                ))}
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
                <p className="text-[16px] font-medium text-[#212529]">
                  나와 이런점이 닮았어요!
                </p>
                <div className="flex flex-wrap justify-center gap-[8px]">
                  <p className="bg-white rounded-lg text-[14px] text-gray-700 px-[12px] py-[4px] shadow-sm">
                    친절한
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-[20px] mb-[40px] flex justify-center">
              <button
                onClick={() => handleStartChat()}
                disabled={isPending}
                className={`w-full transition-all active:scale-95 ${isPending ? "grayscale opacity-70" : ""}`}
              >
                <img src={chatpinkbox} alt="대화하기" className="w-full" />
              </button>
            </div>
          </section>
        </main>
        <Navbar />
      </div>
    </div>
  );
}
