import { NavLink, useLocation, useNavigate } from "react-router-dom";

import home from "../../assets/home.svg";
import emptyhome from "../../assets/empty_home.svg";
import heart from "../../assets/heart.svg";
import emptyheart from "../../assets/empty_heart.svg";
import message from "../../assets/message.svg";
import emptymessage from "../../assets/empty_message.svg";
import my from "../../assets/my.svg";
import emptymy from "../../assets/empty_my.svg";
import mic from "../../assets/mic.svg";

const linkBase =
  "flex flex-col items-center gap-[6px] text-[#A6AFB6] text-[10px] leading-none";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${isActive ? "text-black font-semibold" : "text-[#A6AFB6]"}`;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="absolute bottom-0 left-0 
        w-full h-[92px] z-50 
        bg-white"
      style={{ filter: "drop-shadow(0 -4px 12px rgba(0,0,0,0.08))" }}
    >
      <div
        className="
        px-4 pb-[39px]
        h-full
        items-end
        grid grid-cols-[1fr_1fr_1.1fr_1fr_1fr]
        "
      >
        <NavLink to="/home" end className={linkClass}>
          {({ isActive }) => (
            <>
              <img src={isActive ? home : emptyhome} alt="홈" />
              <span>홈</span>
            </>
          )}
        </NavLink>
        <NavLink to="/like" end className={linkClass}>
          {({ isActive }) => (
            <>
              <img src={isActive ? heart : emptyheart} alt="마음" />
              <span>마음</span>
            </>
          )}
        </NavLink>

        <div className="relative h-full">
          <button
            onClick={() => navigate("/matching")}
            className="
                absolute flex top-[-35px] 
                h-[68px] w-[68px]
                -translate-x-1/2 left-1/2
                items-center justify-center
                rounded-full ring-[5px] ring-white"
          >
            <img src={mic} alt="매칭" />
          </button>
        </div>

        <NavLink to="/message" end className={linkClass}>
          {({ isActive }) => (
            <>
              <img src={isActive ? message : emptymessage} alt="메세지" />
              <span>메세지</span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/my"
          end
          className={() => {
            const isActive =
              location.pathname === "/my" || location.pathname === "/my/edit";
            return linkClass({ isActive });
          }}
        >
          {() => {
            const isActive =
              location.pathname === "/my" || location.pathname === "/my/edit";
            return (
              <>
                <img src={isActive ? my : emptymy} alt="마이" />
                <span>마이</span>
              </>
            );
          }}
        </NavLink>
      </div>
    </nav>
  );
}
