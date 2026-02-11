import React, { forwardRef } from 'react';

import MaleBlack from '../../assets/MaleBlack.svg';
import MalePink from '../../assets/MalePink.svg';
import FemaleBlack from '../../assets/FemaleBlack.svg';
import FemalePink from '../../assets/FemalePink.svg';

/******************************
 * Gender Button(틀)
 * MaleButton, FemaleButton
 * *****************************/

// 가로 : 150px 고정 (원형)
// 세로 : 150px 고정 (원형)

interface GenderButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  active: boolean;
}

const GenderButton = forwardRef<HTMLButtonElement, GenderButtonProps>(
  ({ className, children, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            w-[150px] h-[150px]
            rounded-full
            border-[2px]
            ${active 
              ? 'bg-[#FFF0F3] border-[#FC3367]' 
              : 'bg-white border-[#EAEEF2]'}
            ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

const MaleButton = forwardRef<HTMLButtonElement, GenderButtonProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <GenderButton ref={ref} className={className} active={active} {...props}>
        <div className='flex flex-col items-center gap-[18px]'>
          <img src={active ? MalePink : MaleBlack} alt="" />
          <p className={`text-[18px] font-bold ${active ? 'text-[#FC3367]' : 'text-black'}`}>남자</p>
        </div>
      </GenderButton>
    );
  }
);

const FemaleButton = forwardRef<HTMLButtonElement, GenderButtonProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <GenderButton ref={ref} className={className} active={active} {...props}>
        <div className='flex flex-col items-center gap-[14px]'>
          <img src={active ? FemalePink : FemaleBlack} alt="" />
          <p className={`text-[18px] font-bold ${active ? 'text-[#FC3367]' : 'text-black'}`}>여자</p>
        </div>
      </GenderButton>
    );
  }
);

export { MaleButton, FemaleButton };