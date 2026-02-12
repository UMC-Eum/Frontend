import React, { forwardRef } from "react";

type ButtonProps = React.ComponentPropsWithoutRef<"button">;

const FullButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            w-full max-w-[362px] h-14
            bg-[#FC3367]
            rounded-[14px]
            text-white text-[18px] font-semibold
            flex items-center justify-center

            /* 비활성화(disabled) 상태 디자인 */
            disabled:bg-[#DEE3E5]
            disabled:text-[#A6AFB6]
            ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

const HalfButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            w-full max-w-[175px] h-14
            bg-[#FC3367]
            rounded-[14px]
            text-white text-[18px] font-semibold
            flex items-center justify-center

            /* 비활성화(disabled) 상태 디자인 */
            disabled:bg-[#DEE3E5]
            disabled:text-[#A6AFB6]
            ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

const FullGradButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            w-full max-w-[362px] h-[52px]
            bg-[linear-gradient(93.1deg,#FC3367_-7.07%,#FE7E71_65.84%,#FFCA7A_113.06%,#FFFFFF_158.75%)]
            rounded-[14px]
            text-white text-[16px] font-semibold
            flex items-center justify-center

            /* 비활성화(disabled) 상태 디자인 */
            disabled:bg-none disabled:bg-[#DEE3E5]
            disabled:text-white
            ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

const SmallGradButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            w-full max-w-[322px] h-[52px]
            bg-[linear-gradient(93.1deg,#FC3367_-7.07%,#FE7E71_65.84%,#FFCA7A_113.06%,#FFFFFF_158.75%)]
            rounded-[14px]
            text-white text-[18px] font-semibold
            flex items-center justify-center

            /* 비활성화(disabled) 상태 디자인 */
            disabled:bg-none disabled:bg-[#E9ECED]
            disabled:text-[#636970]
            ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

const YesNoButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            w-full max-w-[131px] h-[50px]
            bg-[#FC3367]
            rounded-[14px]
            text-white text-[16px] font-semibold
            flex items-center justify-center

            /* 비활성화(disabled) 상태 디자인 */
            disabled:bg-none disabled:bg-[#DEE3E5]
            disabled:text-[#636970]
            ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export { FullButton, HalfButton, FullGradButton, SmallGradButton, YesNoButton };
