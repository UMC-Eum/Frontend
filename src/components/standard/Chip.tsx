import React, { forwardRef } from "react";

interface KeywordChipProps extends React.ComponentPropsWithoutRef<"button"> {
  active: boolean;
  keyword: string;
}

const KeywordChip = forwardRef<HTMLButtonElement, KeywordChipProps>(
  ({ className, active, keyword, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            w-[115px] h-[38px]
            border-[2px]
            rounded-[7px]
            ${
              active
                ? "bg-[#FFECF1] border-[#FC3367]"
                : "bg-white border-[#DEE3E5]"
            }
            ${className}`}
        {...props}
      >
        <p
          className={`text-[16px] font-medium ${
            active ? "text-[#FC3367]" : "text-black"
          }`}
        >
          {keyword}
        </p>
      </button>
    );
  },
);

export { KeywordChip };
