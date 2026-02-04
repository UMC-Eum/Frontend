import { Outlet } from "react-router-dom";
import LikeModal from "../components/LikeModal";

const AppLayout = () => {
  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-[420px] h-screen bg-white flex flex-col overflow-hidden">
        <main className="flex-1 relative overflow-hidden">
          <Outlet />
        </main>
        <LikeModal />
      </div>
    </div>
  );
};

export default AppLayout;
