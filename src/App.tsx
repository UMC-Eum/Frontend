//github and vercel deployment settings
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import MatchingPage from "./pages/MatchingPage";
import ResultPage from "./pages/ResultPage";
import HomePage from "./pages/HomePage";
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
    ],
  },
  {
    path: "/home",
    element: <HomePage />,
  },
]);
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
