export function getAgeFromBirthdate(birthdate?: string | null) {
  if (!birthdate) return null;

  const parsedBirthdate = new Date(birthdate);
  if (Number.isNaN(parsedBirthdate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - parsedBirthdate.getFullYear();
  const birthdayThisYear = new Date(
    today.getFullYear(),
    parsedBirthdate.getMonth(),
    parsedBirthdate.getDate(),
  );

  if (today < birthdayThisYear) {
    age -= 1;
  }

  return age > 0 ? age : null;
}
