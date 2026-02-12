import React, { forwardRef } from "react";

import CheckCircleGray from "../../assets/CheckCircleGray.svg";
import CheckCirclePink from "../../assets/CheckCirclePink.svg";
import SimpleCheckGray from "../../assets/SimpleCheckGray.svg";
import SimpleCheckPink from "../../assets/SimpleCheckPink.svg";

interface CheckProps extends React.ComponentPropsWithoutRef<"button"> {
  active: boolean;
}

const CheckCircle = forwardRef<HTMLButtonElement, CheckProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            ${className}`}
        {...props}
      >
        <img src={active ? CheckCirclePink : CheckCircleGray} alt="check" />
      </button>
    );
  },
);

const SimpleCheck = forwardRef<HTMLButtonElement, CheckProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
            ${className}`}
        {...props}
      >
        <img src={active ? SimpleCheckPink : SimpleCheckGray} alt="check" />
      </button>
    );
  },
);

export { CheckCircle, SimpleCheck };
