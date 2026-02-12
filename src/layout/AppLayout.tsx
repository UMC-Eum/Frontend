import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom"; 
import LikeModal from "../components/LikeModal";
import { useSocketStore } from "../stores/useSocketStore";
import { useNotificationStore } from "../stores/useNotificationStore"; 
import ToastNotification from "../components/common/ToastNotification"; 
import { useNotificationPolling } from "../hooks/useNotificationPolling";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocketStore();
  
  const { 
    showToast, 
    hideToast, 
    toastMessage, 
    isToastVisible, 
    toastLink,
  } = useNotificationStore();

  const isMatchingPage = location.pathname.startsWith("/matching");
  useNotificationPolling(30000, !isMatchingPage);

  // 🔥 글로벌 알림 리스너 (notification.new만 처리)
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (response: any) => {
      // 서버 응답 구조 파싱 (response.success.data 혹은 response)
      const payload = response.success?.data || response;
      const { title, body, data } = payload;
      
      console.log("🔔 [AppLayout] 알림 수신:", title, body);

      // 현재 보고 있는 채팅방이면 토스트 띄우기 생략
      if (data?.chatRoomId && location.pathname.includes(`/room/${data.chatRoomId}`)) {
        return;
      }

      // 토스트 띄우기
      showToast(
        `${title}: ${body}`, 
        data?.chatRoomId ? `/message/room/${data.chatRoomId}` : null
      );
    };

    socket.on("notification.new", handleNotification);

    return () => {
      socket.off("notification.new", handleNotification);
    };
  }, [socket, location.pathname, showToast]);

  const handleToastClick = () => {
    if (toastLink) {
      navigate(toastLink);
      hideToast();
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 h-full"> 
      <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">
        
        {/* 1. 메인 컨텐츠를 먼저 그립니다 */}
        <main className="flex-1 relative overflow-y-auto w-full no-scrollbar">
          <Outlet />
        </main>

        {/* 🔥 2. [위치 이동] 토스트를 main 아래에 두어야 화면 맨 위에 뜹니다! */}
        {isToastVisible && (
          <div 
            onClick={handleToastClick}
            className="absolute top-4 left-0 right-0 z-[9999] px-4 cursor-pointer animate-fade-in-down"
          > 
            <ToastNotification 
              message={toastMessage}
              isVisible={isToastVisible}
              onClose={hideToast}
            />
          </div>
        )}

        {/* 3. 모달 */}
        <LikeModal />
      </div>
    </div>
  );
};

export default AppLayout;