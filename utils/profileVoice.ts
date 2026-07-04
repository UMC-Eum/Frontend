export function resolveBirthDate(
  birthDate?: string | null,
  age?: number | null,
) {
  if (birthDate) return birthDate;

  const fallbackAge = age ?? 53;
  const fallbackYear = new Date().getFullYear() - fallbackAge;

  return `${fallbackYear}-01-01`;
}
