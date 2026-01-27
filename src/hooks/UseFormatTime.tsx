export function formatTime(isoString: string | null | undefined) {
  // 1. 값이 없으면 빈 문자열
  if (!isoString) return "";

  if (isoString.includes("오전") || isoString.includes("오후")) {
    return isoString;
  }

  const date = new Date(isoString);

  // 변환 실패(Invalid Date) 체크
  if (isNaN(date.getTime())) {
    return ""; 
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? '오후' : '오전';
  const formattedHour = hours % 12 || 12; 
  const formattedMinute = minutes.toString().padStart(2, '0');

  return `${ampm} ${formattedHour}:${formattedMinute}`;
}