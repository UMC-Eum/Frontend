export const ERROR_SITUATION_MAP: Record<string, string> = {
  // AUTH
  "AUTH-001": "로그인 필요",
  "AUTH-002": "세션 만료",
  "AUTH-003": "가입된 이메일",
  "AUTH-004": "유효하지 않은 인증정보",
  "AUTH-005": "인증정보 가져오기 실패",
  "AUTH-006": "인증정보 만료",
  "AUTH-007": "프로필 가져오기 실패",
  "AUTH-008": "신고 누적된 회원 로그인 차단",

  // VALID
  "VALID-001": "입력 형식 오류",
  "VALID-002": "필수 입력 누락",

  // VOICE
  "VOICE-001": "음성 녹음 실패",
  "VOICE-002": "음성이 너무 짧음",
  "VOICE-003": "음성 인식 실패",

  // MATCH
  "MATCH-001": "매칭 결과 없음",
  "MATCH-002": "음성 분석 지연",

  // PROF
  "PROF-001": "이상형 미등록",

  // CHAT
  "CHAT-001": "메시지 전송 실패",
  "CHAT-002": "채팅방 접근 실패",

  // SYSTEM
  "SYS-001": "일시적 서버 오류",
  "SYS-002": "네트워크 연결 실패",

  // ETC
  "AGREE-001": "존재하지 않는 약관",
  "NOTI-001": "존재하지 않는 알림",

  // CUSTOM / FALLBACK in ErrorPage
  "NOT_FOUND": "페이지 없음",
  "UNKNOWN": "알 수 없는 오류"
};
