//가로 : w-full
//세로 : 픽셀 고정(45px)

import { useNavigate } from "react-router-dom";

import GrayBack from "../../assets/GrayBack.svg";
import LightGrayBack from "../../assets/LightGrayBack.svg";
import KebabMenu from "../../assets/KebabMenu.svg";

/******************************
 * PageHeader
 * MenuHeader
 * BackBar
 * BackHeader
 * *****************************/

interface PageHeaderProps {
    title: string;
}

const PageHeader = ({ title }: PageHeaderProps) => {
    return (
        <div className="
            w-full h-[45px] 
            flex items-center pl-5">
            <h1 className="text-[24px] font-bold">{title}</h1>
        </div>
    );
};

interface MenuHeaderProps {
    title: string;
    handleBack?: () => void;
    handleMenu: () => void;
}

const MenuHeader = ({ title, 
    handleBack = () => { 
        const navigate = useNavigate();
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/"); // 홈이나 안전한 페이지
        }
    },
    handleMenu }: MenuHeaderProps) => {
    return (
        <div className="
            pl-5 pr-[19px]
            w-full h-[45px] 
            flex items-center
            grid grid-cols-[auto_1fr_auto]
            ">
            <button onClick={handleBack}>
                <img src={LightGrayBack} alt="뒤로 가기" />
            </button>
            <h1 className="flex justify-center text-[24px] font-bold">{title}</h1>
            <button onClick={handleMenu}>
                <img src={KebabMenu} alt="메뉴" />
            </button>
        </div>
    );
};

interface BackBarProps {
    handleBack?: () => void;
}

const BackBar = ({ 
    handleBack = () => { 
        const navigate = useNavigate();
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/"); // 홈이나 안전한 페이지
        }
    } }: BackBarProps) => {
    return (
        <div className="
            pl-5
            w-full h-[45px] 
            flex items-center
            ">
            <button onClick={handleBack}>
                <img src={LightGrayBack} alt="뒤로 가기" />
            </button>
        </div>
    );
};

interface BackHeaderProps {
    title: string;
    handleBack?: () => void;
}

const BackHeader = ({ 
    title,
    handleBack = () => { 
        const navigate = useNavigate();
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/"); // 홈이나 안전한 페이지
        }
    } }: BackHeaderProps) => {
    return (
        <div className="
            pl-5
            w-full h-[45px] 
            flex items-center
            gap-5
            ">
            <button onClick={handleBack}>
                <img src={GrayBack} alt="뒤로 가기" />
            </button>
            <h1 className="flex justify-center text-[24px] font-semibold">{title}</h1>
        </div>
    );
};

export { PageHeader, MenuHeader, BackBar, BackHeader };