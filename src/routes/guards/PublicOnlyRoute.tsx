import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

export default function PublicOnlyRoute() {
  const user = useUserStore((state) => state.user);

  // ✅ 로그인 되어있으면 로그인/회원가입 같은 public 페이지 접근 막고 홈으로
  if (user) return <Navigate to="/home" replace />;

  return <Outlet />;
}
