import { markChatRoomRead } from "@/api/chats/chatsApi";

/**
 * 채팅방 전체를 읽음 처리한다.
 * 백엔드 변경으로 메시지 단위 읽음 API가 폐지되고 방 단위 읽음 커서(`PATCH /rooms/:id/read`)로
 * 통합되었기 때문에, 한 번의 호출로 방의 모든 메시지를 읽음 처리한다.
 * 반환값(1/0)은 성공 여부를 뜻한다(기존 호출부의 count 인터페이스 호환용).
 */
export async function readUnreadMessagesInChatRoom(
  chatRoomId: number,
): Promise<number> {
  try {
    await markChatRoomRead(chatRoomId);
    return 1;
  } catch {
    return 0;
  }
}
