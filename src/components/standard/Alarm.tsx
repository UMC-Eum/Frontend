/******************************
 * Alarm
 * *****************************/

import ActiveBell from "../../assets/ActiveBell.svg";
import Bell from "../../assets/Bell.svg";

interface AlarmProps extends React.ComponentPropsWithoutRef<'button'> {
  active: boolean;
}

const AlarmButton = ({ active, ...props }: AlarmProps) => {
  return (
    <button {...props}>
      <img 
        src={active ? ActiveBell : Bell} 
        alt={active ? "새 알림 있음" : "알림 없음"} 
      />
    </button>

  );
};

export { AlarmButton };