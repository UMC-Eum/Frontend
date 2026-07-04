export function uniqueBy<T>(
  items: T[],
  getKey: (item: T) => string | number | null | undefined,
) {
  const seen = new Set<string | number>();

  return items.filter((item) => {
    const key = getKey(item);

    if (key == null || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
