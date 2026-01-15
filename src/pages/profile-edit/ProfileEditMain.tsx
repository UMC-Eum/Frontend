import { useUserStore } from "../../stores/useUserStore";
import signout_btn from "../../assets/signout_btn.png";
import editpen_btn from "../../assets/editpen_btn.png";
import term_detailbutton from "../../assets/term_detailbutton.svg";


export default function ProfileEditMain() {
  const { user } = useUserStore();

  return(
    <div className="flex flex-1 flex-col min-h-screen">
        <div>
            <h2>내 프로필</h2>
            <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full p-[3px] bg-gradient-to-tr from-[#FFBD66] via-[#FF3D77] to-[#FF3D77]">
                    <img className="w-full h-full rounded-full" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"/>
                </div>
                <h3>{user?.nickname}</h3>
                <button className="flex items-center px-2 py-1 rounded-full border border-gray-300 bg-gray-100"> 
                    <img src={editpen_btn} />
                    <span className="text-gray-700">프로필 수정</span>
                </button>
            </div>
        </div>
        <div className="flex flex-1 flex-col items-center bg-gray-100">
            <button className="px-4 py-2 w-[90%] flex justify-between rounded-[10px] bg-white border border-gray-200">
                <div className="flex items-center gap-3">
                    <img src={signout_btn} className="h-[1em]"/>
                    <span>로그아웃</span>
                </div>
                <img src={term_detailbutton} className=""/>
            </button>
            <button className="text-gray-600 text-sm underline underline-offset-4 decoration-1">탈퇴하기</button>
        </div>
    </div>
  )

}