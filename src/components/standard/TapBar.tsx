import { IChatsRoomItem } from "../../types/api/chats/chatsDTO";
interface ChatRoomItemProps {
  room: IChatsRoomItem;
  onClick: (id: number) => void;
  formatTime: (time: string) => string;
}

const ChatRoomItem = ({ room, onClick, formatTime }: ChatRoomItemProps) => {
  return (
    <div
      onClick={() => onClick(room.chatRoomId)}
      className="
      px-5 py-[18px]
      flex items-center
      w-full h-[112px]
      bg-white
      border-[1.5px] border-[#E9ECED]
      gap-5
       "
    >
      <div
        className="
        relative 
        shrink-0 w-[76px] h-[76px]
        bg-gray-200
        rounded-full 
        overflow-hidden 
        "
      >
        <img
          src={room.peer.profileImageUrl}
          alt={room.peer.nickname}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className={`
        flex-1 min-w-0 
        flex flex-col gap-1
        `}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[18px] text-[#202020] font-semibold truncate">
            {room.peer.nickname}
          </span>
          <span className="text-[14px] text-[#636970]">
            성수동 ·{" "}
            {room.lastMessage?.sentAt
              ? formatTime(room.lastMessage.sentAt)
              : ""}
          </span>
        </div>

        <div className="text-[16px] text-[#636970] font-medium truncate">
          {!room.lastMessage
            ? "대화를 시작해보세요!"
            : room.lastMessage.type === "AUDIO"
              ? "음성메시지를 보냈어요."
              : room.lastMessage.textPreview}
        </div>
      </div>

      {room.unreadCount > 0 && (
        <div
          className="
        flex items-center justify-center
        shrink-0 w-6 h-6 
        bg-[#FC3367]
        rounded-full 
        "
        >
          <span className="text-[14px] text-white font-medium">
            {room.unreadCount > 99 ? "99+" : room.unreadCount}
          </span>
        </div>
      )}
    </div>
  );
};

interface AlarmItemProps {
  profileImageUrl: string;
  typeText: string;
  timeText: string;
  content: string;
  onClick?: () => void;
}

const AlarmItem = ({
  profileImageUrl,
  typeText,
  timeText,
  content,
  onClick,
}: AlarmItemProps) => {
  return (
    <div
      onClick={onClick}
      className="
      pl-5 pr-[18px] py-5
      flex items-center
      w-full h-[111px]
      bg-white
      border-b-[1px] border-[#E9ECED]
      gap-[17px]
      "
    >
      <div
        className="
        relative 
        shrink-0 w-[62px] h-[62px] 
        bg-gray-200 
        rounded-full 
        overflow-hidden"
      >
        <img
          src={profileImageUrl}
          alt="profile"
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className="
        flex-1 min-w-0 
        h-[71px]
        flex flex-col gap-2 
        "
      >
        <div className="flex justify-between">
          <span className="text-[16px] text-[#636970] font-medium">
            {typeText}
          </span>
          <span className="text-[14px] text-[#A6AFB6] font-medium">
            {timeText}
          </span>
        </div>
        <p
          className="
            mr-[9px]
            text-[16px] font-medium leading-[1.2] line-clamp-2 break-all"
        >
          {content}
        </p>
      </div>
    </div>
  );
};

export { ChatRoomItem, AlarmItem };
