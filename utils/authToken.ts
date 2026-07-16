export type AuthProvider = "APPLE" | "KAKAO" | "LOCAL" | (string & {});

type AuthTokenPayload = {
  provider?: string;
};

const BASE64_URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function decodeBase64Url(input: string) {
  let buffer = 0;
  let bits = 0;
  let output = "";

  for (const char of input.replace(/=+$/, "")) {
    const value = BASE64_URL_ALPHABET.indexOf(char);
    if (value < 0) continue;

    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

export function getAuthProviderFromToken(token: string | null) {
  if (!token) return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as AuthTokenPayload;
    const provider = parsed.provider?.toUpperCase() as
      | AuthProvider
      | undefined;
    return provider ?? null;
  } catch {
    return null;
  }
}
