import { INotification } from "../../types/api/notifications/notificationsDTO";
import { getRelativeTime } from "../../utils/getRelativeTime";
import avata_placeholder from "../../assets/avatar_placeholder.svg";

interface NotificationLabelProps {
  notification: INotification;
  onClick: (id: number) => void;
}

const NotificationLabel = ({
  notification,
  onClick,
}: NotificationLabelProps) => {
  // notification 객체에서 필요한 값들을 추출합니다.
  const { notificationId, body, isRead, createdAt, sender } = notification;

  // 상대 시간 계산 (예: 5분 전)
  const displayTime = getRelativeTime(createdAt);

  // sender가 아예 없거나 profileImageUrl이 없을 때를 모두 대비합니다.
  const profileImg = sender?.profileImageUrl || avata_placeholder;
  const senderNickname = sender?.nickname || "알 수 없는 사용자";

  return (
    <div
      onClick={() => onClick(notificationId)}
      className={`w-full h-[89px] flex items-center px-[20px] gap-[12px] transition-colors cursor-pointer ${
        isRead ? "bg-white" : "bg-[#FFF2F5]"
      } border-b border-[#F1F3F5]`}
    >
      {/* 프로필 이미지 영역 */}
      <div className="relative shrink-0">
        <img
          src={profileImg}
          alt={senderNickname}
          className="w-[50px] h-[50px] rounded-full object-cover border border-[#E9ECEF]"
          // 혹시나 이미지 URL은 있는데 서버에서 404가 뜰 경우를 위한 대비
          onError={(e) => {
            e.currentTarget.src = avata_placeholder;
          }}
        />
      </div>

      {/* 텍스트 정보 영역 */}
      <div className="flex flex-col flex-1 gap-[4px] overflow-hidden">
        <div className="flex justify-between items-center w-full">
          {/* 닉네임 표시 (없으면 '알 수 없는 사용자') */}
          <span className="text-[14px] font-medium text-[#868E96]">
            {senderNickname}
          </span>
          <span className="text-[12px] text-[#ADB5BD]">{displayTime}</span>
        </div>

        {/* 알림 본문 (길어지면 말줄임표 처리) */}
        <p className="text-[16px] font-semibold text-[#212529] truncate">
          {body}
        </p>
      </div>
    </div>
  );
};

export default NotificationLabel;
