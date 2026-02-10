import { Outlet, useLocation } from "react-router-dom";
import LikeModal from "../components/LikeModal";
import { useNotificationPolling } from "../hooks/useNotificationPolling"; // 🟢 훅 import

const AppLayout = () => {
  const location = useLocation();

  const isMatchingPage = location.pathname.startsWith("/matching");

  useNotificationPolling(30000, !isMatchingPage);

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
