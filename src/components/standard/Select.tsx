import React, { forwardRef } from 'react';

/******************************
 * SelectChip
 * *****************************/

//가로 : w-[177px]
//세로 : h-[58px]

interface SelectChipProps extends React.ComponentPropsWithoutRef<'button'> {
  active: boolean;
  text: string;
}

const SelectChip = forwardRef<HTMLButtonElement, SelectChipProps>(
  ({ className, active, text, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            w-full h-[58px]
            rounded-[14px]
            ${active 
              ? 'bg-[#FFE2E9] border-[2px] border-[#FC3367]' 
              : 'bg-[#F8FAFB]'}
            ${className}`}
        {...props}
      >
        <p className={`text-[18px]  ${active 
              ? 'font-bold text-[#FC3367]' 
              : 'font-medium text-[#636970]'}`}>{text}</p>
      </button>
    );
  }
);

/******************************
 * SelectRow
 * *****************************/

//가로 : w-full
//세로 : h-[54px]

interface SelectRowProps extends React.ComponentPropsWithoutRef<'button'> {
  active: boolean;
  text: string;
}

const SelectRow = forwardRef<HTMLButtonElement, SelectRowProps>(
  ({ className, active, text, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            pl-[1px]
            w-full h-[54px]
            border-t-[1px] border-[#DEE3E5]
            flex justify-start items-center
            ${active 
              ? 'bg-[#FFE2E9]' 
              : 'bg-white'}
            ${className}`}
        {...props}
      >
        <p className="text-[18px] font-medium truncate">{text}</p>
      </button>
    );
  }
);

export { SelectChip, SelectRow };