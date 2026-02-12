import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  errMsg?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, errMsg, ...props }, ref) => {
    return (
      <div
        className="
        flex flex-col gap-2
        w-full max-w-[362px]"
      >
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
        {errMsg && (
          <p className="ml-[1px] text-[#FC3367] text-[14px] font-medium">
            {errMsg}
          </p>
        )}
      </div>
    );
  },
);

export default Input;
