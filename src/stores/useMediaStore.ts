import { create } from "zustand";

interface MediaStore {
  stream: MediaStream | null;
  permission: PermissionState | "unknown" | "prompt";
  error: any;

  // 상태 제어
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;

  // 액션
  checkPermission: () => Promise<void>; // [조용함] 권한 확인 & 자동 연결
  requestStream: () => Promise<void>; // [적극적] 팝업 띄워 요청
  stopStream: () => void; // 연결 종료
  toggleVideo: () => void; // 화면 끄기/켜기
  toggleAudio: () => void; // 마이크 끄기/켜기
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  stream: null,
  permission: "unknown",
  error: null,
  isVideoEnabled: true,
  isAudioEnabled: true,

  // 1. [초기화용] 페이지 로드 시 실행 (팝업 없이 체크)
  checkPermission: async () => {
    try {
      if (!navigator.permissions || !navigator.permissions.query) return;

      // 카메라 권한 조회
      const result = await navigator.permissions.query({
        name: "camera" as any,
      });
      set({ permission: result.state });

      // 핵심: 이미 'granted'라면 바로 연결 시도!
      if (result.state === "granted") {
        await get().requestStream();
      }

      // 사용자가 브라우저 설정에서 권한을 바꾸면 실시간 반영
      result.onchange = () => {
        set({ permission: result.state });
        if (result.state === "denied") {
          get().stopStream();
        }
      };
    } catch (err) {
      console.error("권한 체크 실패:", err);
    }
  },

  // 2. [요청용] 실제 카메라/마이크 켜기
  requestStream: async () => {
    try {
      // 이미 스트림이 있으면 재요청 안 함
      if (get().stream) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      set({
        stream,
        permission: "granted",
        error: null,
        isVideoEnabled: true,
        isAudioEnabled: true,
      });
    } catch (err) {
      console.error("미디어 요청 거부:", err);
      set({ permission: "denied", error: err });
      // 거부되면 스트림 정리
      get().stopStream();
    }
  },

  // 3. [종료용] 스트림 끄기 (페이지 이동이나 로그아웃 시)
  stopStream: () => {
    const { stream } = get();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // 실제 하드웨어 연결 끊기
    }
    set({ stream: null });
  },

  // 4. [제어용] 화면 끄기/켜기 (스트림 유지, 화면만 블랙)
  toggleVideo: () => {
    const { stream, isVideoEnabled } = get();
    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoEnabled));
      set({ isVideoEnabled: !isVideoEnabled });
    }
  },

  // 5. [제어용] 마이크 끄기/켜기
  toggleAudio: () => {
    const { stream, isAudioEnabled } = get();
    if (stream) {
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isAudioEnabled));
      set({ isAudioEnabled: !isAudioEnabled });
    }
  },
}));
