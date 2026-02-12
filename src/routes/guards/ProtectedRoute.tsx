import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

export default function ProtectedRoute() {
  const user = useUserStore((state) => state.user);

  if (!user) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
