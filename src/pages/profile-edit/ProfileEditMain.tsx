import { useUserStore } from "../../stores/useUserStore";
import signout_btn from "../../assets/signout_btn.png";
import editpen_btn from "../../assets/editpen_btn.png";
import term_detailbutton from "../../assets/term_detailbutton.svg";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth/authApi";
import { deactivateUser } from "../../api/users/usersApi";
import Navbar from "../../components/Navbar";

export default function ProfileEditMain() {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // API 호출 성공 여부와 상관없이 클라이언트 상태는 초기화
      clearUser();
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
    }
  };

  const handleDeactivate = async () => {
    if (
      !window.confirm(
        "정말로 탈퇴하시겠습니까? 탈퇴 후에는 데이터를 복구할 수 없습니다.",
      )
    ) {
      return;
    }

    try {
      await deactivateUser();
      alert("탈퇴가 완료되었습니다.");
      clearUser();
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Deactivation failed:", error);
      alert("탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div>
      <div className="flex flex-1 flex-col min-h-screen">
        {/* 상단 화면 */}
        <div className="pb-6">
          <h2 className="px-5 py-2 text-[24px] font-semibold">내 프로필</h2>
          <div className="flex flex-col items-center">
            {/* 프로필 사진 */}
            <div className="mb-6 w-[111px] h-[111px] rounded-full p-[2px] bg-gradient-to-tr from-[#FFBD66] via-[#FF3D77] to-[#FF3D77]">
              <img
                className="w-full h-full rounded-full object-cover"
                src={user?.profileImageUrl}
              />
            </div>
            {/* 닉네임 */}
            <h3 className="mb-[10px] text-[20px] font-semibold leading-[1.2]">
              {user?.nickname} {user?.age}
            </h3>
            {/* 프로필 수정 버튼 */}
            <button
              onClick={() => navigate("edit")}
              className="flex items-center px-[12px] py-[7px] rounded-full border border-gray-300 bg-gray-100"
            >
              <img src={editpen_btn} />
              <span className="text-gray-700 text-[14px] font-medium leading-[1.2]">
                프로필 수정
              </span>
            </button>
          </div>
        </div>
        {/* 하단 화면 */}
        <div className="pt-6 flex flex-1 flex-col items-center bg-gray-100">
          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="py-4 pl-6 pr-4 w-[90%] flex justify-between rounded-[10px] bg-white border border-[#F2F4F7]"
          >
            <div className="flex items-center gap-3 text-[#475467]">
              <img src={signout_btn} className="h-[1em]" />
              <span className="text-[16px] font-medium leading-[24px]">
                로그아웃
              </span>
            </div>
            <img src={term_detailbutton} className="" />
          </button>
          {/* 탈퇴하기 버튼 */}
          <button
            onClick={handleDeactivate}
            className="pt-6 text-gray-600 text-sm underline underline-offset-4 decoration-1"
          >
            탈퇴하기
          </button>
        </div>
      </div>
      <Navbar />
    </div>
  );
}
