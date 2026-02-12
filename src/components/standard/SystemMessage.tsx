//가로 : max-w-full(최대) w-fit(글자만큼만)
//세로 : h-[36px]

/******************************
 * GuideTooltip (말풍선)
 * GuideBar (막대)
 * *****************************/


interface GuideTooltipProps {
    content: string;
}

const GuideTooltip = ({ content }: GuideTooltipProps) => {
    return (
        <div className="
            flex-col 
            flex items-center">
            <div className=" 
                px-[18px]
                max-w-full w-fit h-[36px]
                bg-[#FFE2E9] rounded-[7px]
                flex items-center justify-center">
                <p className="text-[14px] font-medium text-[#FF88A6] truncate">
                    {content}
                </p>
            </div>
            {/* 삼각형 */}
            {/* 정확한 픽셀이 없어서 임의로 설정 */}
            <div className="
                w-0 h-0 
                border-l-[6px] border-l-transparent 
                border-r-[6px] border-r-transparent 
                border-t-[11px] border-t-[#FFE2E9]
            "></div>
        </div>
    )
}

interface GuideBarProps {
    content: string;
}

const GuideBar = ({ content }: GuideBarProps) => {
    return (
        <div className="
            px-[18px]
            max-w-full w-fit h-[36px]
            bg-[#FFE2E9] rounded-[7px]
            flex items-center justify-center">
            <p className="text-[14px] font-medium text-[#FF88A6] truncate">
                {content}
            </p>
        </div>
    )
}

export { GuideTooltip, GuideBar };