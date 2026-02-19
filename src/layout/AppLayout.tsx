import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LikeModal from "../components/LikeModal";
import { useSocketStore } from "../stores/useSocketStore";
import { useNotificationStore } from "../stores/useNotificationStore";
import ChatNotificationToast from "../components/chat/ChatNotificationToast";
import { useNotificationPolling } from "../hooks/useNotificationPolling";
import { useGlobalChatNotification } from "../hooks/chat/useGlobalChatNotification";

const AppLayout = () => {
  const location = useLocation();
  const { socket } = useSocketStore();

  useGlobalChatNotification();

  const { showToast } = useNotificationStore();

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

  return (
    <div className="flex justify-center bg-gray-100 h-full">
      <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">
        <Outlet />

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

        <LikeModal />
      </div>
    </div>
  );
};

export default AppLayout;
