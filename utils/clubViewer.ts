/**
 * 동호회 상세 화면의 "보는 사람" 역할과 그에 따른 화면 권한을 한 곳에서 계산한다.
 * - 게스트: 가입 전 일반 유저 (가입 CTA 노출, 관리/참석 액션 없음)
 * - 멤버: 가입한 일반 유저 (채팅/참석/게시 가능, 관리 없음)
 * - 호스트: 동호회장 (설정·모임 생성·가입 승인 등 관리 권한)
 *
 * detail.tsx 곳곳에 isHost/isJoined 조건을 흩뿌리는 대신 이 클래스를 통해 분기한다.
 */
export type ClubViewerRole = "guest" | "member" | "host";

type ClubViewerInput = {
  /** 현재 활동 중인(가입 확정) 멤버인지 */
  isJoined: boolean;
  /** 동호회장(HOST 권한) 인지 */
  isHost: boolean;
};

export class ClubViewer {
  readonly role: ClubViewerRole;

  constructor({ isJoined, isHost }: ClubViewerInput) {
    // 호스트는 서버에서 isJoined=false로 내려올 수 있어 우선 판정한다.
    if (isHost) {
      this.role = "host";
    } else if (isJoined) {
      this.role = "member";
    } else {
      this.role = "guest";
    }
  }

  get isGuest() {
    return this.role === "guest";
  }

  get isMember() {
    return this.role === "member";
  }

  get isHost() {
    return this.role === "host";
  }

  /** 가입한 사람(멤버 또는 호스트) */
  get isParticipant() {
    return this.role !== "guest";
  }

  /** 헤더 우측 아이콘: 호스트는 설정(너트), 그 외는 더보기(⋮) */
  get showSettingsIcon() {
    return this.role === "host";
  }

  /** 하단 가입 CTA(하트 + 가입) — 가입 전 게스트만 */
  get showJoinCta() {
    return this.role === "guest";
  }

  /** 가입 대기중인 멤버 배너 — 호스트만 */
  get showPendingMemberBanner() {
    return this.role === "host";
  }

  /** "정기모임 만들기" 버튼 — 호스트만 */
  get canCreateMeeting() {
    return this.role === "host";
  }

  /** 정기모임 카드/시트의 참석 액션 — 가입한 사람만 */
  get canActOnMeeting() {
    return this.role !== "guest";
  }

  /** 정기모임 관리(호스트) vs 참석(멤버) */
  get canManageMeeting() {
    return this.role === "host";
  }

  /** 채팅 사용 가능 여부 — 가입한 사람만 */
  get canUseChat() {
    return this.role !== "guest";
  }

  /** 게시판 글쓰기 FAB — 가입한 사람만 */
  get canWritePost() {
    return this.role !== "guest";
  }
}

export function getClubViewer(input: ClubViewerInput) {
  return new ClubViewer(input);
}
