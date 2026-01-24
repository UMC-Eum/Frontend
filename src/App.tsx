import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useMediaStore } from "./stores/useMediaStore";

// 👇 페이지들 import (경로가 빨간줄 뜨면 본인 폴더명에 맞게 고쳐주세요!)
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
import CharacterEditPage from "./pages/profile-edit/CharacterEditPage";
import IdealEditPage from "./pages/profile-edit/IdealEditPage";
import CharacterRecordPage from "./pages/profile-edit/CharacterRecordPage";
import IdealRecordPage from "./pages/profile-edit/IdealRecordPage";

// ⭐ [필수] 로그인 관련 페이지 2개 import
import LoginStep from "./pages/onboarding/steps/LoginStep";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

import ProfileRecommendPage from "./pages/ProfileRecommendPage";
const router = createBrowserRouter([
  // 1. 메인 레이아웃을 쓰는 페이지들
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

  // 2. ⭐ [중요] 레이아웃 없는 단독 페이지 (로그인)
  // 이 부분이 없어서 아까 에러가 난 겁니다!
  {
    path: "/login",
    element: <LoginStep />,
  },

  // 3. ⭐ [중요] 카카오 로그인 처리 페이지
  {
    path: "/oauth/callback/:provider",
    element: <OAuthCallbackPage />,
  },

  // 4. 홈 관련 페이지
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
  }
]);

const App = () => {
  const { checkPermission } = useMediaStore();

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);
  return <RouterProvider router={router} />;
};

export default App;
