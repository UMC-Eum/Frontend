//active는 어떻게 쓰이는지 몰라서 일단 구현 안했어요 
// 필요하면 수정해주세요

import { IChatsRoomItem } from "../../types/api/chats/chatsDTO";

/******************************
 * 채팅방 전용
 * ChatRoomItem
 * *****************************/

//BE에게 말해서 위치 정보 받아야 합니다.
//현재 코드에서는 성수동으로 고정
interface ChatRoomItemProps {
  room: IChatsRoomItem;
  onClick: (id: number) => void;
  formatTime: (time: string) => string;
}

//전체 박스
//가로 : w-full
//세로 : 픽셀 고정

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
       {/* 프로필 사진 */}
      <div className="
        relative 
        shrink-0 w-[76px] h-[76px]
        bg-gray-200
        rounded-full 
        overflow-hidden 
        ">
        <img
          src={room.peer.profileImageUrl}
          alt={room.peer.nickname}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 텍스트 */}
      {/* 좌 우 두 요소가 너비를 확보해서 가운데 텍스트는 가변 너비로 대응했습니다. & 말줄임 문제 대응 */}
      <div className={`
        flex-1 min-w-0 
        flex flex-col gap-1
        `}
        >
        {/* {김성수} {성수동} · {3시간} */}
        <div className="flex items-center gap-1.5">
          <span className="text-[18px] text-[#202020] font-semibold truncate">
            {room.peer.nickname}
          </span>
          <span className="text-[14px] text-[#636970]">
            성수동 · {room.lastMessage?.sentAt ? formatTime(room.lastMessage.sentAt) : ""}
          </span>
        </div>

        <div className="text-[16px] text-[#636970] font-medium truncate">
          {!room.lastMessage ? (
            "대화를 시작해보세요!"
          ) : room.lastMessage.type === "AUDIO" ? (
            "음성메시지를 보냈어요."
          ) : (
            room.lastMessage.textPreview
          )}
        </div>
      </div>

      {room.unreadCount > 0 && (
        <div className="
        flex items-center justify-center
        shrink-0 w-6 h-6 
        bg-[#FC3367]
        rounded-full 
        ">
          <span className="text-[14px] text-white font-medium">
            {room.unreadCount > 99 ? "99+" : room.unreadCount}
          </span>
        </div>
      )}
    </div>
  );
};

/******************************
 * 알람 페이지 전용
 * AlarmItem
 * *****************************/

//props는 임시입니다.
//필요하면 수정해주세요
interface AlarmItemProps {
  profileImageUrl: string;
  typeText: string;
  timeText: string;
  content: string;
  onClick?: () => void;
}

//전체 박스
//가로 : w-full
//세로 : 픽셀 고정

const AlarmItem = ({ profileImageUrl, typeText, timeText, content, onClick }: AlarmItemProps) => {
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
      {/* 프로필 사진 */}
      <div className="
        relative 
        shrink-0 w-[62px] h-[62px] 
        bg-gray-200 
        rounded-full 
        overflow-hidden">
        <img
          src={profileImageUrl}
          alt="profile"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 텍스트 */}
      {/* 가변 너비 & 말줄임 문제 대응*/}
      <div className="
        flex-1 min-w-0 
        h-[71px]
        flex flex-col gap-2 
        ">
        {/* 상단 */}
        <div className="flex justify-between">
          <span className="text-[16px] text-[#636970] font-medium">
            {typeText}
          </span>
          <span className="text-[14px] text-[#A6AFB6] font-medium">
            {timeText}  
          </span>
        </div>
        {/* 하단 */}
        <p className="
            mr-[9px]
            text-[16px] font-medium leading-[1.2] line-clamp-2 break-all">
          {content}
        </p>
      </div>
    </div>
  );
};

export {ChatRoomItem, AlarmItem};
