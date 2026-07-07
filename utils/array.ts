export function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }

  return rows;
}

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
