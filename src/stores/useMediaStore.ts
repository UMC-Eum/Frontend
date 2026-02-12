import { create } from "zustand";

interface MediaStore {
  stream: MediaStream | null;
  permission: PermissionState | "unknown" | "prompt";
  error: any;

  isVideoEnabled: boolean;
  isAudioEnabled: boolean;

  checkPermission: () => Promise<void>;
  requestStream: () => Promise<void>;
  stopStream: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  stream: null,
  permission: "unknown",
  error: null,
  isVideoEnabled: true,
  isAudioEnabled: true,

  checkPermission: async () => {
    try {
      if (!navigator.permissions || !navigator.permissions.query) return;

      const result = await navigator.permissions.query({
        name: "camera" as any,
      });
      set({ permission: result.state });

      if (result.state === "granted") {
        await get().requestStream();
      }

      result.onchange = () => {
        set({ permission: result.state });
        if (result.state === "denied") {
          get().stopStream();
        }
      };
    } catch (err) {
      console.error("권한 확인 오류:", err);
    }
  },

  requestStream: async () => {
    try {
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
      get().stopStream();
    }
  },

  stopStream: () => {
    const { stream } = get();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    set({ stream: null });
  },

  toggleVideo: () => {
    const { stream, isVideoEnabled } = get();
    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoEnabled));
      set({ isVideoEnabled: !isVideoEnabled });
    }
  },

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
