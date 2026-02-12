export const getFormattedDate = (dateString: string) => {
  const date = new window.Date(dateString); // window.Date로 명시 (충돌 방지)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};