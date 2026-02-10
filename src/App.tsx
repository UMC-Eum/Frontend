import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useMediaStore } from "./stores/useMediaStore";
// ❌ useNotificationPolling import 제거

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <div>Home Page</div>,
      },
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
        path: "profileset",
        element: <ProfileSetupMain />,
      },
      {
        path: "onboarding",
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
        path: "/login",
        element: <LoginStep />,
      },

      {
        path: "/oauth/callback/:provider",
        element: <OAuthCallbackPage />,
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
  {
    path: "/cardtest",
    element: <CardTestPage />,
  },
]);

const App = () => {
  const { checkPermission } = useMediaStore();

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // ❌ 여기서 훅 호출 삭제함 (AppLayout으로 이동)

  return <RouterProvider router={router} />;
};

export default App;
