import { NavLink } from "react-router-dom";

import home from "../assets/home.svg";
import emptyhome from "../assets/empty_home.svg";
import heart from "../assets/heart.svg";
import emptyheart from "../assets/empty_heart.svg";
import message from "../assets/message.svg";
import emptymessage from "../assets/empty_message.svg";
import my from "../assets/my.svg";
import emptymy from "../assets/empty_my.svg";
import mic from "../assets/mic.svg";

const linkBase =
  "flex flex-col items-center gap-[6px] text-[#A6AFB6] text-[10px]";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${isActive ? "text-black font-semibold" : "text-[#A6AFB6]"}`;

export default function Navbar() {
  return (
    <nav className="absolute bottom-[34px] left-0 w-full h-[62px] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="relative h-full">
        <div className="h-full grid grid-cols-5 items-center px-5">
          <NavLink to="/" end className={linkClass}>
            {({ isActive }) => (
              <>
                <img src={isActive ? home : emptyhome} />
                <span>홈</span>
              </>
            )}
          </NavLink>
          <NavLink to="/like" end className={linkClass}>
            {({ isActive }) => (
              <>
                <img src={isActive ? heart : emptyheart} />
                <span>마음</span>
              </>
            )}
          </NavLink>
          <div />
          <NavLink to="/message" end className={linkClass}>
            {({ isActive }) => (
              <>
                <img src={isActive ? message : emptymessage} />
                <span>메세지</span>
              </>
            )}
          </NavLink>
          <NavLink to="/my" end className={linkClass}>
            {({ isActive }) => (
              <>
                <img src={isActive ? my : emptymy} />
                <span>마이</span>
              </>
            )}
          </NavLink>
        </div>

        <button className="absolute flex top-[-25px] h-[68px] w-[68px] items-center justify-center -translate-x-1/2 left-1/2">
          <img src={mic} />
        </button>
      </div>
    </nav>
  );
}
