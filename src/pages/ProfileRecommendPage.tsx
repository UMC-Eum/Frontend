import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useUserStore } from "../stores/useUserStore";
import { getCommonKeywords } from "../utils/userUtils";
import BackButton from "../components/BackButton";
import Navbar from "../components/standard/Navbar";
import chatpinkbox from "../assets/chat_pinkbox.svg";
import KeywordLabel from "../components/keyword/KeywordLabel";
import RecommendCard2 from "../components/card/presets/RecommendCard2";
import { createChatRoom } from "../api/chats/chatsApi";

type Profile = {
  userId: number;
  nickname: string;
  age: number;
  profileImageUrl: string;
  areaName: string;
  introText?: string;
  keywords?: string[];
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop";

export default function ProfileRecommendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // ✅ 스토어에서 내 키워드 가져오기
  const myKeywords = useUserStore((state) => state.user?.keywords || []);

  const stateProfile = (location.state as { profile?: Profile } | null)
    ?.profile;

  const profile: Profile | null = stateProfile
    ? {
        ...stateProfile,
        profileImageUrl: stateProfile.profileImageUrl || FALLBACK_IMAGE,
        introText: stateProfile.introText,
        keywords: stateProfile.keywords || [],
      }
    : id
      ? {
          userId: Number(id),
          nickname: `유저 ${id}`,
          age: 25,
          profileImageUrl: FALLBACK_IMAGE,
          areaName: "지역 미설정",
          introText: "",
          keywords: ["임시", "데이터"],
        }
      : null;

  // ✅ 공통 키워드 계산
  const commonKeywords = useMemo(
    () => getCommonKeywords(myKeywords, profile?.keywords),
    [myKeywords, profile?.keywords],
  );

  const { mutate: handleStartChat, isPending } = useMutation({
    mutationFn: () => createChatRoom({ targetUserId: profile!.userId }),
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
        <main className="flex-1 overflow-y-auto pb-[72px] no-scrollbar">
          <div className="relative">
            <div className="relative w-full h-[585px] overflow-hidden">
              <RecommendCard2
                profileUrl={`/home/profile/${profile.userId}`}
                targetUserId={profile.userId}
                imageUrl={profile.profileImageUrl}
                nickname={profile.nickname}
                age={profile.age}
                area={profile.areaName}
                description={profile.introText || "아직 소개글이 없어요!"}
                keywords={profile.keywords || []}
              />
            </div>
            <header className="absolute inset-0 w-full pt-[5px] shrink-0 pointer-events-none z-50">
              <div className="pointer-events-auto">
                <BackButton onClick={() => navigate("/home")} />
              </div>
            </header>
          </div>

          <section className="m-[20px]">
            {/* 소개 섹션 */}
            <section className="flex flex-col gap-[12px] mb-[15px]">
              <h1 className="text-[20px] font-semibold">소개</h1>
              <p
                className={`flex bg-white rounded-xl border border-[#E9ECED] shadow-[0px_4px_24px_rgba(0,0,0,0.06)] text-[14px] px-[14px] py-[14px] whitespace-pre-wrap leading-relaxed ${
                  !profile.introText ? "text-gray-400 italic" : "text-gray-700"
                }`}
              >
                {profile.introText && profile.introText.trim() !== ""
                  ? profile.introText
                  : "아직 소개글이 없어요!"}
              </p>
            </section>

            {/* 관심사 섹션 */}
            <section className="flex flex-col gap-[12px] mb-[15px]">
              <h1 className="text-[20px] font-semibold">저의 관심사에요.</h1>
              <div className="flex flex-wrap gap-[8px]">
                {profile.keywords && profile.keywords.length > 0 ? (
                  profile.keywords.map((keyword, index) => (
                    <KeywordLabel key={index} keyword={keyword} />
                  ))
                ) : (
                  <span className="text-gray-400 text-sm italic">
                    등록된 관심사가 없습니다.
                  </span>
                )}
              </div>
            </section>

            {/* ✅ "나와 이런점이 닮았어요!" 섹션 - 이전 글씨 디자인 유지 */}
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
                  {commonKeywords.length > 0 ? (
                    commonKeywords.map((keyword, index) => (
                      <p
                        key={index}
                        className="bg-white rounded-lg text-[14px] text-gray-700 px-[12px] py-[4px] shadow-sm"
                      >
                        {keyword}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      공통점을 찾는 중이에요
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="mt-[20px] mb-[40px] flex justify-center">
              <button
                onClick={() => handleStartChat()}
                disabled={isPending}
                className={`w-full transition-all active:scale-95 ${
                  isPending ? "grayscale opacity-70" : ""
                }`}
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
