//github and vercel deployment settings
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import MatchingPage from "./pages/MatchingPage";
import OnBoardingPage from "./pages/onboarding/OnBoardingPage";
import ResultPage from "./pages/ResultPage";
import HomePage from "./pages/HomePage";
import ProfileSetupMain from "./pages/profile-setup/ProfileSetupMain";
import ProfileEditMain from "./pages/profile-edit/ProfileEditMain";
import ProfileRecommendPage from "./pages/ProfileRecommendPage";
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
        element: (
          <ProfileSetupMain />
        )
      },
      {
        path: "onboarding",
        element: (
            <OnBoardingPage />
        )
      },
      {
        path: "my",
        element: <ProfileEditMain />,
      },
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
]);
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
