import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useMediaStore } from "./stores/useMediaStore";
import { useNotificationPolling } from "./hooks/useNotificationPolling";
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
import CharacterEditPage from "./pages/profile-edit/PersonalitiesEditPage";
import IdealEditPage from "./pages/profile-edit/IdealEditPage";
import CharacterRecordPage from "./pages/profile-edit/PersonalitiesRecordPage";
import IdealRecordPage from "./pages/profile-edit/IdealRecordPage";

import LoginStep from "./pages/onboarding/steps/LoginStep";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

import ProfileRecommendPage from "./pages/ProfileRecommendPage";
import CardTestPage from "./pages/CardTestPage";
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
        element: <CharacterEditPage />,
      },
      {
        path: "my/edit/ideal",
        element: <IdealEditPage />,
      },
      {
        path: "my/edit/character-record",
        element: <CharacterRecordPage />,
      },
      {
        path: "my/edit/ideal-record",
        element: <IdealRecordPage />,
      },
    ],
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
        path: "profilerecommend",
        element: <ProfileRecommendPage />,
      },
    ],
  },
  {
    path: "/message",
    children: [
      {
        index: true, 
        element: <ChatListPage />, // url: /chats
      },
      {
        path: "room/:roomId", 
        element: <ChatRoomPage />, // url: /message/room/{숫자}
      }
    ]
  },
  {
    path: "/cardtest",
    element: <CardTestPage />,
  }
]);

const App = () => {
  const { checkPermission } = useMediaStore();

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useNotificationPolling(30000);

  return <RouterProvider router={router} />;
};

export default App;
