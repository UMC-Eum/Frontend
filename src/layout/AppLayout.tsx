import { Outlet } from "react-router-dom";
import BackButton from "../components/BackButton";

const AppLayout = () => {
  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-[420px] h-screen bg-white flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="w-full px-[20px] pt-[5px] shrink-0">
          <BackButton />
        </header>

        {/* 콘텐츠 영역: 여기가 h-full의 기준이 됩니다 */}
        <main className="flex-1 relative overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
