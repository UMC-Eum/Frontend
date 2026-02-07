import { NavLink } from "react-router-dom";

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

//전체 박스
//가로 : w-full
//세로 : 픽셀 고정

export default function Navbar() {
  return (
    <nav className="absolute bottom-0 left-0 
        w-full h-[92px] z-50 
        bg-white"
        style={{ filter: 'drop-shadow(0 -4px 12px rgba(0,0,0,0.08))' }}>

        {/* 아래 패딩은 디자이너분이 일부러 줬다고 하네요
        그래서 아래쪽에 패딩을 붙이고 요소박스들을 아래로 까는 방식으로 만들었습니다. */}

        {/* 좌우 패딩은 피그마가 아니라 단순 보정값입니다. 
        비슷하지만 피그마와 픽셀 차이가 있습니다. */}
        <div className="
        px-4 pb-[39px]
        h-full
        items-end
        grid grid-cols-[1fr_1fr_1.1fr_1fr_1fr]
        ">
            <NavLink to="/home" end className={linkClass}>
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
            <div className="relative h-full">
                <button className="
                absolute flex top-[-35px] 
                h-[68px] w-[68px]
                -translate-x-1/2 left-1/2
                items-center justify-center
                rounded-full ring-[5px] ring-white">
                <img src={mic} />
                </button>
            </div>
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
    </nav>
  );
}
