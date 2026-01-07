import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import MatchingPage from "./pages/MatchingPage";
import OnBoardingPage from "./pages/onboarding/OnBoardingPage";
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
        element: (
          <div>
            <MatchingPage />
          </div>
        ),
      },
      {
        path: "onboarding",
        element: (
            <OnBoardingPage />
        ),
      },
    ],
  },
]);
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
