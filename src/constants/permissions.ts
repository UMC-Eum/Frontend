export const PERMISSION_CONFIG: Record<
  string,
  { label: string; desc: string }
> = {
  camera: {
    label: "카메라",
    desc: "영상 통화를 위해 카메라 접근이 필요해요.",
  },
  microphone: {
    label: "마이크",
    desc: "목소리 전달을 위해 마이크 접근이 필요해요.",
  },
  notification: {
    label: "알림",
    desc: "매칭 성공 및 채팅 알림을 받아보세요.",
  },
};
