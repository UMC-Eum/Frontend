export function normalizeS3ObjectRef(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("s3://")) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return trimmed;

    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (!key) return trimmed;

    const hostParts = url.hostname.split(".");

    if (hostParts.length >= 3 && hostParts[1] === "s3") {
      return `s3://${hostParts[0]}/${key}`;
    }

    if (hostParts.length >= 3 && hostParts[0] === "s3") {
      const separatorIndex = key.indexOf("/");
      if (separatorIndex <= 0 || separatorIndex === key.length - 1) {
        return trimmed;
      }

      return `s3://${key.slice(0, separatorIndex)}/${key.slice(separatorIndex + 1)}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export function normalizeS3ObjectRefs(values?: string[]) {
  return values?.map(normalizeS3ObjectRef);
}
