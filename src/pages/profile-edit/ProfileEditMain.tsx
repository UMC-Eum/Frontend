import { useUserStore } from "../../stores/useUserStore";
import editpen_btn from "../../assets/editpen_btn.png";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/standard/Navbar";

export default function ProfileEditMain() {
  const { user } = useUserStore();
  const navigate = useNavigate();

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
        </div>
      </div>
      <Navbar />
    </div>
  );
}
