import type { IClubDetailResponse } from "@/types/api/club/clubDTO";
import type { IChatsRoomsGetResponse } from "@/types/api/chats/chatsDTO";

/**
 * 동호회(단체) 채팅방의 chatRoomId를 반환한다.
 *
 * 단체 채팅은 1:1 채팅과 동일한 소켓/REST 인프라를 chatRoomId 기반으로 그대로 재사용한다
 * (WebSocket `room.join` 재사용 + `room.type === 'CLUB'` 가드).
 * 상세 응답이 chatRoomId를 직접 내려주는 경우에는 이 값을 우선 사용하고,
 * 없으면 POST /v1/chats/clubs/{clubId}/room lazy 입장 API로 채팅방을 가져온다.
 */
export function getClubChatRoomId(
  detail?: IClubDetailResponse | null,
): number | null {
  const roomId = (detail as { chatRoomId?: number } | undefined)?.chatRoomId;
  return typeof roomId === "number" && Number.isFinite(roomId) ? roomId : null;
}

export function getClubChatRoomIdFromRooms(
  data: { pages: IChatsRoomsGetResponse[] } | undefined,
  clubId: number,
): number | null {
  const rooms = data?.pages.flatMap((page) => page.items) ?? [];
  const room = rooms.find(
    (item) =>
      item.type === "CLUB" &&
      Number(item.club?.clubId) === clubId &&
      Number.isFinite(item.chatRoomId),
  );

  return room?.chatRoomId ?? null;
}
