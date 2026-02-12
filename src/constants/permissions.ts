export const PERMISSION_CONFIG: Record<
  string,
  { label: string; desc: string }
> = {
  camera: {
    label: "카메라",
    desc: "사진으로 일정을 간편하게 등록",
  },
  microphone: {
    label: "마이크",
    desc: "녹음한 음성은 매칭에만 사용돼요",
  },
  notification: {
    label: "알림",
    desc: "새 인연 소식을 받아보세요",
  },
};
