import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

export default function PublicOnlyRoute() {
  const user = useUserStore((state) => state.user);

  if (user) return <Navigate to="/home" replace />;

  return <Outlet />;
}
