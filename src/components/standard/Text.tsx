import { forwardRef, InputHTMLAttributes } from 'react';

/******************************
 * Input
 * *****************************/

//가로 : w-full & 최대 픽셀 고정
//세로 : 픽셀 고정

//input 그대로 상속
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    errMsg?: string
}

const   Input = forwardRef<HTMLInputElement, InputProps>(({ className, errMsg, ...props }, ref) => {
  return (
    <div className="
        flex flex-col gap-2
        w-full max-w-[362px]">
        <input
            ref={ref}
            className={`
            px-4
            h-[58px]
            border-2 border-gray-200 focus:border-[#FC3367]
            rounded-[14px] 
            outline-none
            text-[17px] leading-none
            placeholder:text-gray-400
            ${className}`}
            {...props}
        />
        {/* 에러메시지 */}
        {/* 시각적 보정을 위해 1px 마진 넣음 */}
        {errMsg && (
          <p className="ml-[1px] text-[#FC3367] text-[14px] font-medium">{errMsg}</p>
        )}
    </div>
  );
});


export default Input;