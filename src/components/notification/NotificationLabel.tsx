import { INotification } from "../../types/api/notifications/notificationsDTO";
import { getRelativeTime } from "../../utils/getRelativeTime";
interface NotificationLabelProps {
  notification: INotification;
  onClick: (id: number) => void;
}

const NotificationLabel = ({
  notification,
  onClick,
}: NotificationLabelProps) => {
  const { notificationId, type, body, isRead, createdAt } = notification;

  const displayTime = getRelativeTime(createdAt);

  return (
    <div
      onClick={() => onClick(notificationId)}
      className={`w-full h-[89px] flex items-center px-[20px] gap-[12px] transition-colors ${
        isRead ? "bg-white" : "bg-[#FFF2F5]"
      } border-b border-[#F1F3F5]`}
    >
      <div className="relative shrink-0">
        <img
          src="/default_profile.png"
          alt="profile"
          className="w-[50px] h-[50px] rounded-full object-cover border border-[#E9ECEF]"
        />
      </div>

      <div className="flex flex-col flex-1 gap-[4px] overflow-hidden">
        <div className="flex justify-between items-center w-full">
          <span className="text-[14px] font-medium text-[#868E96]">
            {type === "HEART" ? "마음" : "대화"}
          </span>
          <span className="text-[12px] text-[#ADB5BD]">{displayTime}</span>
        </div>

        <p className="text-[16px] font-semibold text-[#212529] truncate">
          {body}
        </p>
      </div>
    </div>
  );
};
export default NotificationLabel;
