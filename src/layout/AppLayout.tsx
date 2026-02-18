import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import LikeModal from "../components/LikeModal";
import { useSocketStore } from "../stores/useSocketStore";
import { useNotificationStore } from "../stores/useNotificationStore";
import ToastNotification from "../components/common/ToastNotification";
import ChatNotificationToast from "../components/chat/ChatNotificationToast";
import { useNotificationPolling } from "../hooks/useNotificationPolling";
import { useGlobalChatNotification } from "../hooks/chat/useGlobalChatNotification";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocketStore();

  useGlobalChatNotification();

  const { showToast, hideToast, toastMessage, isToastVisible, toastLink } =
    useNotificationStore();

  const { chatNotification, hideChatNotification } = useSocketStore();

  const isMatchingPage = location.pathname.startsWith("/matching");
  useNotificationPolling(30000, !isMatchingPage);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (response: any) => {
      const payload = response.success?.data || response;
      const { title, body, data } = payload;

      if (
        data?.chatRoomId &&
        location.pathname.includes(`/room/${data.chatRoomId}`)
      ) {
        return;
      }

      showToast(
        `${title}: ${body}`,
        data?.chatRoomId ? `/message/room/${data.chatRoomId}` : null,
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
        <main className="flex-1 relative overflow-y-auto w-full no-scrollbar">
          <Outlet />
        </main>

        {chatNotification && (
          <ChatNotificationToast
            isVisible={!!chatNotification}
            senderName={chatNotification.senderName}
            senderProfileImage={chatNotification.senderProfileImage}
            messagePreview={chatNotification.messagePreview}
            chatRoomId={chatNotification.chatRoomId}
            onClose={hideChatNotification}
          />
        )}

        {isToastVisible && (
          <div
            onClick={handleToastClick}
            className="absolute top-4 left-0 right-0 z-[9998] px-4 cursor-pointer animate-fade-in-down"
          >
            <ToastNotification
              message={toastMessage}
              isVisible={isToastVisible}
              onClose={hideToast}
            />
          </div>
        )}

        <LikeModal />
      </div>
    </div>
  );
};

export default AppLayout;
