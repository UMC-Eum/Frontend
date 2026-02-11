import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

export default function ProtectedRoute() {
  const user = useUserStore((state) => state.user);

  // ✅ 로그인 안 되어있으면 로그인으로
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
