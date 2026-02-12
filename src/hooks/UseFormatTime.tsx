export function formatTime(isoString: string | null | undefined) {
  if (!isoString) return "";

  if (isoString.includes("오전") || isoString.includes("오후")) {
    return isoString;
  }

  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    return "";
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "오후" : "오전";
  const formattedHour = hours % 12 || 12;
  const formattedMinute = minutes.toString().padStart(2, "0");

  return `${ampm} ${formattedHour}:${formattedMinute}`;
}
