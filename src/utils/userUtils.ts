export const getSortedKeywords = (
  myKeywords: string[] = [],
  partnerKeywords: string[] = [],
): { sorted: string[]; common: string[] } => {
  if (!partnerKeywords.length) return { sorted: [], common: [] };
  const common = partnerKeywords.filter((k) => myKeywords.includes(k));
  const others = partnerKeywords.filter((k) => !myKeywords.includes(k));
  return {
    sorted: [...common, ...others],
    common,
  };
};
export const getCommonKeywords = (
  myKeywords: string[] = [],
  partnerKeywords: string[] = [],
): string[] => {
  if (!myKeywords.length || !partnerKeywords.length) return [];
  return partnerKeywords.filter((keyword) => myKeywords.includes(keyword));
};
