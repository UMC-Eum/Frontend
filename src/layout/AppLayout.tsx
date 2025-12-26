import { Outlet } from "react-router-dom";
const AppLayout = () => {
  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <div className="w-full max-w-[420] h-screen bg-white">
        <Outlet />
      </div>
    </div>
  );
};
export default AppLayout;
