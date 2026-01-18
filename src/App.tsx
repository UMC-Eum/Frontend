//github and vercel deployment settings
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import MatchingPage from "./pages/MatchingPage";
import OnBoardingPage from "./pages/onboarding/OnBoardingPage";
import ResultPage from "./pages/ResultPage";
import HomePage from "./pages/HomePage";
import ProfileSetupMain from "./pages/profile-setup/ProfileSetupMain";
import ProfileRecommendPage from "./pages/ProfileRecommendPage";
import Like from "./pages/Like";
import ProfileEditMain from "./pages/profile-edit/ProfileEditMain";
import ChatListPage from "./pages/chat/ChatListPage";
import ChatRoomPage from "./pages/chat/ChatRoomPage";
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
        path: "like",
        element: <Like />,
      },
      {
        path: "my",
        element: <ProfileEditMain/>
      }
    ],
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
  }
]);
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
