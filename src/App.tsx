import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import MatchingPage from "./pages/MatchingPage";
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
    ],
  },
]);
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
