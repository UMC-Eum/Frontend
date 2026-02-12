import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useMediaStore } from "./stores/useMediaStore";
// 🔥 [추가] 소켓 스토어 및 API import
import { useSocketStore } from "./stores/useSocketStore";
import { getChatRooms } from "./api/chats/chatsApi";
import { useUserStore } from "./stores/useUserStore";
import AppLayout from "./layout/AppLayout";
import MatchingPage from "./pages/MatchingPage";
import OnBoardingPage from "./pages/onboarding/OnBoardingPage";
import ResultPage from "./pages/ResultPage";
import HomePage from "./pages/HomePage";
import ProfileSetupMain from "./pages/profile-setup/ProfileSetupMain";
import ProfileEditMain from "./pages/profile-edit/ProfileEditMain";
import ChatListPage from "./pages/chat/ChatListPage";
import ChatRoomPage from "./pages/chat/ChatRoomPage";
import ProfileEditSecond from "./pages/profile-edit/ProfileEditSecond";
import HobbyEditPage from "./pages/profile-edit/HobbyEditPage";
import PersonalitiesEditPage from "./pages/profile-edit/PersonalitiesEditPage";
import IdealEditPage from "./pages/profile-edit/IdealEditPage";
import IdealRecordPage from "./pages/profile-edit/IdealRecordPage";
import LocationEditPage from "./pages/profile-edit/LocationEditPage";

import LoginStep from "./pages/onboarding/steps/LoginStep";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

import ProfileRecommendPage from "./pages/ProfileRecommendPage";
import PersonalitiesRecordPage from "./pages/profile-edit/PersonalitiesRecordPage";
import Like from "./pages/Like";
import CardTestPage from "./mock/CardTestPage";
import NotificationsPage from "./pages/NotificationsPage";

import { Outlet, Navigate } from "react-router-dom";

/**
 * ✅ PublicOnlyRoute:
 * - 로그인(유저 데이터 있음) 상태면 /login 같은 공개 페이지 접근 막고 /home으로 보냄
 */
function PublicOnlyRoute() {
  const user = useUserStore((s) => s.user);
  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}

/**
 * ✅ ProtectedRoute:
 * - 로그인 안되어 있으면 /home 같은 보호 페이지 접근 막고 /login으로 보냄
 * - (원하지 않으면 아래 ProtectedRoute 래핑은 빼도 됨)
 */
function ProtectedRoute() {
  const user = useUserStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
  // ... (기존 라우터 설정 그대로 유지) ...
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <div>Home Page</div>,
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: "/login",
            element: <LoginStep />,
          },

          {
            path: "/profileset",
            element: <ProfileSetupMain />,
          },
        ],
      },

      {
        path: "/oauth/callback/:provider",
        element: <OAuthCallbackPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "matching",
            element: <MatchingPage />,
            children: [
              {
                path: "result",
                element: <ResultPage />,
              },
            ],
          },
          {
            path: "/onboarding",
            element: <OnBoardingPage />,
          },
          {
            path: "my",
            element: <ProfileEditMain />,
          },
          {
            path: "my/edit",
            element: <ProfileEditSecond />,
          },
          {
            path: "my/edit/hobby",
            element: <HobbyEditPage />,
          },
          {
            path: "my/edit/character",
            element: <PersonalitiesEditPage />,
          },
          {
            path: "my/edit/ideal",
            element: <IdealEditPage />,
          },
          {
            path: "my/edit/character-record",
            element: <PersonalitiesRecordPage />,
          },
          {
            path: "my/edit/ideal-record",
            element: <IdealRecordPage />,
          },
          {
            path: "my/edit/location",
            element: <LocationEditPage />,
          },
          {
            path: "/home",
            children: [
              { index: true, element: <HomePage /> },
              {
                path: "profile/:id",
                element: <ProfileRecommendPage />,
              },
            ],
          },
          {
            path: "/like",
            children: [
              {
                index: true,
                element: <Like />,
              },
            ],
          },
          {
            path: "/message",
            children: [
              {
                index: true,
                element: <ChatListPage />,
              },
              {
                path: "room/:roomId",
                element: <ChatRoomPage />,
              },
            ],
          },
          {
            path: "/notifications",
            element: <NotificationsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/cardtest",
    element: <CardTestPage />,
  },
]);

const App = () => {
  const { checkPermission } = useMediaStore();

  // 🔥 [추가] 소켓 스토어 가져오기
  const { connect, disconnect, joinRoom, socket, isConnected } =
    useSocketStore();

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // 🔥 [추가 1] 앱 실행 시(로그인 상태라면) 소켓 연결
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      connect();
    }

    // 앱이 꺼질 때만 연결 해제 (페이지 이동 시에는 유지됨)
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // 🔥 [추가 2] 소켓 연결 성공 시 -> 내 모든 채팅방 입장 (구독)
  useEffect(() => {
    const joinAllMyRooms = async () => {
      // 소켓이 연결된 상태(isConnected)일 때만 실행
      if (!socket || !isConnected) return;

      try {
        console.log("📂 [App] 전체 채팅방 목록 가져오는 중...");
        // size를 넉넉하게 잡아서 전체 방을 가져옵니다.
        const response = await getChatRooms({ size: 20 });

        if (response && response.items) {
          response.items.forEach((room) => {
            // 각각의 방에 입장 (Store 내부에서 중복 체크하므로 안심)
            joinRoom(room.chatRoomId);
          });
          console.log(
            `✅ [App] 총 ${response.items.length}개의 방에 입장했습니다.`,
          );
        }
      } catch (error) {
        console.error("❌ [App] 채팅방 입장 실패:", error);
      }
    };

    joinAllMyRooms();

    // socket이나 연결 상태가 변하면 다시 실행 (재연결 시 다시 입장하기 위함)
  }, [socket, isConnected, joinRoom]);

  return <RouterProvider router={router} />;
};

export default App;
