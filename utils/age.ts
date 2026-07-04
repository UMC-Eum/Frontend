// 생년월일(ISO 문자열)로 만 나이 계산. 유효하지 않으면 null.
export function getAgeFromBirthdate(birthdate?: string | null): number | null {
  if (!birthdate) return null;

  const birthday = new Date(birthdate);
  if (Number.isNaN(birthday.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const birthdayThisYear = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate(),
  );
  if (today < birthdayThisYear) age -= 1;

  return age >= 0 ? age : null;
}
