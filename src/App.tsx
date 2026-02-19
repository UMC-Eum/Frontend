import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useMediaStore } from "./stores/useMediaStore";
import { useSocketStore } from "./stores/useSocketStore";
import { getChatRooms } from "./api/chats/chatsApi";
import { useUserStore } from "./stores/useUserStore";
import AppLayout from "./layout/AppLayout";
import MatchingPage from "./pages/MatchingPage";
import OnBoardingPage from "./pages/onboarding/OnBoardingPage";
import ResultPage from "./pages/ResultPage";
import HomePage from "./pages/HomePage";
import ProfileEditMain from "./pages/profile-edit/ProfileEditMain";
import ChatListPage from "./pages/chat/ChatListPage";
import ChatRoomPage from "./pages/chat/ChatRoomPage";
import ProfileEditSecond from "./pages/profile-edit/ProfileEditSecond";
import HobbyEditPage from "./pages/profile-edit/HobbyEditPage";
import PersonalitiesEditPage from "./pages/profile-edit/PersonalitiesEditPage";
import IdealEditPage from "./pages/profile-edit/IdealEditPage";
import IdealRecordPage from "./pages/profile-edit/IdealRecordPage";
import LocationEditPage from "./pages/profile-edit/LocationEditPage";
//버셀 배포용 주석
import LoginPage from "./pages/onboarding/LoginPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

import ProfileRecommendPage from "./pages/ProfileRecommendPage";
import PersonalitiesRecordPage from "./pages/profile-edit/PersonalitiesRecordPage";
import Like from "./pages/Like";
import CardTestPage from "./mock/CardTestPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfileSetupMain from "./pages/profileset/ProfileSetupMain";

import ErrorPage from "./pages/ErrorPage";

import { Outlet, Navigate } from "react-router-dom";

function PublicOnlyRoute() {
  const user = useUserStore((s) => s.user);
  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}

function ProtectedRoute() {
  const user = useUserStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
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
          {
            path: "/profileset",
            element: <ProfileSetupMain />,
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

  const { connect, disconnect, joinRoom, socket, isConnected } =
    useSocketStore();

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    const joinAllMyRooms = async () => {
      if (!socket || !isConnected) return;

      try {
        const response = await getChatRooms({ size: 20 });

        if (response && response.items) {
          response.items.forEach((room) => {
            joinRoom(room.chatRoomId);
          });
        }
      } catch (error) {
        console.error("채팅방 입장 실패:", error);
      }
    };

    joinAllMyRooms();
  }, [socket, isConnected, joinRoom]);

  return <RouterProvider router={router} />;
};

export default App;
