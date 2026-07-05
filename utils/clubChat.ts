import type { IClubDetailResponse } from "@/types/api/club/clubDTO";

/**
 * 동호회(단체) 채팅방의 chatRoomId를 반환한다.
 *
 * 단체 채팅은 1:1 채팅과 동일한 소켓/REST 인프라를 chatRoomId 기반으로 그대로 재사용한다
 * (WebSocket `room.join` 재사용 + `room.type === 'CLUB'` 가드). 다만 현재 백엔드 명세에는
 * 동호회 → chatRoomId 를 내려주는 필드가 아직 없다. 서버가 아래 중 하나로 노출하면
 * 이 함수 한 곳만 고치면 화면 전체가 실제 채팅으로 연결된다:
 *   - 동호회 상세(GET /clubs/{clubId}) 응답에 chatRoomId 추가
 *   - 채팅방 목록(GET /chats/rooms) 응답에 type:"CLUB" + clubId 추가
 *   - GET /clubs/{clubId}/chat-room 전용 엔드포인트 신설
 */
export function getClubChatRoomId(
  detail?: IClubDetailResponse | null,
): number | null {
  // 백엔드가 chatRoomId를 내려주기 시작하면 아래를 그 필드로 교체한다.
  const roomId = (detail as { chatRoomId?: number } | undefined)?.chatRoomId;
  return typeof roomId === "number" && Number.isFinite(roomId) ? roomId : null;
}
