export const getFormattedDate = (dateString: string) => {
  const date = new window.Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};
