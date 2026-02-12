import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";
import useCompleteLogin from "../../hooks/useCompleteLogin";
import KeywordLabel from "../../components/keyword/KeywordLabel";
import locationIcon from "../../assets/location.svg";
import { FullButton } from "../../components/standard/CTA";
import { updateMyProfile } from "../../api/users/usersApi";

import {
  postPresign,
  uploadFileToS3,
} from "../../api/onboarding/onboardingApi";

export default function SetComplete() {
  const navigate = useNavigate();

  const { user } = useUserStore();
  const { completeLogin, loading } = useCompleteLogin();

  const handleStart = async () => {
    try {
      console.log("최종 가입 정보:", user);

      const currentImage = user?.profileImageUrl;

      if (currentImage && !currentImage.startsWith("http")) {
        const response = await fetch(currentImage);
        const blob = await response.blob();

        let extension = "jpg";
        if (blob.type.includes("svg")) extension = "svg";
        else if (blob.type.includes("png")) extension = "png";
        else if (blob.type.includes("webp")) extension = "webp";

        const file = new File([blob], `profile_${Date.now()}.${extension}`, {
          type: blob.type,
        });

        const presignResult = await postPresign({
          fileName: file.name,
          contentType: file.type,
          purpose: "PROFILE_IMAGE",
        });

        const { uploadUrl, fileUrl } = presignResult.data;

        await uploadFileToS3(uploadUrl, file);

        await updateMyProfile({
          profileImageUrl: fileUrl,
        });
      } else if (currentImage && currentImage.startsWith("http")) {
        await updateMyProfile({
          profileImageUrl: currentImage,
        });
      }

      await completeLogin();

      navigate("/home");
    } catch (error) {
      console.error("가입 실패", error);
      alert("가입 처리에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="mt-[28px] mb-[40px] w-full">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          {user?.nickname}님의 프로필이 준비됐어요!
        </h1>
        <p className="text-gray-500 text-[15px] mt-2">
          이제 새로운 인연을 만나볼 시간이에요. <br />
          천천히 둘러보며 시작해봐요.
        </p>
      </div>

      <div className="relative w-[314px] h-[380px] overflow-hidden mb-6 rounded-[30px] mx-auto flex-none shadow-lg">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${user?.profileImageUrl})`,
          }}
        />

        <div className="absolute inset-0 backdrop-blur-[24px]" />

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
            <img src={locationIcon} />
            {user?.area.name} 거주 · {user?.age}세
          </p>

          <p className="text-[14px] text-center opacity-80 mb-2 line-clamp-2 overflow-hidden leading-relaxed text-white px-4">
            {user?.introText}
          </p>
        </div>

        <div className="absolute bottom-[26px] inset-x-0 z-10 flex flex-wrap justify-center gap-2 px-4">
          {[...(user?.personalities || []), ...(user?.keywords || [])].map(
            (k, i) => (
              <KeywordLabel key={i} keyword={k} shape="pill" />
            ),
          )}
        </div>
      </div>

      <div className="flex-1" />

      <p className="text-center text-gray-500 text-[14px] mb-5">
        프로필은 설정에서 언제든지 수정할 수 있어요.
      </p>
      <FullButton onClick={handleStart} disabled={loading}>
        {loading ? "로딩 중..." : "시작하기"}
      </FullButton>
    </div>
  );
}
