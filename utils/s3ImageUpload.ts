import * as FileSystem from "expo-file-system/legacy";

/**
 * 이미지 URI의 확장자/프리픽스로 Content-Type을 추론합니다.
 */
export function resolveImageContentType(uri: string) {
  const lowerUri = uri.toLowerCase();

  if (lowerUri.startsWith("data:image/png") || lowerUri.endsWith(".png")) {
    return "image/png";
  }

  if (lowerUri.startsWith("data:image/webp") || lowerUri.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

export function contentTypeToImageExtension(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";

  return "jpg";
}

/**
 * 로컬 이미지 파일을 presigned URL로 직접 업로드합니다.
 * RN fetch + Blob PUT은 실패가 잦아 네이티브 업로드(FileSystem.uploadAsync)를 사용합니다.
 */
export async function uploadImageUriToS3(
  uploadUrl: string,
  fileUri: string,
  contentType: string,
) {
  if (!uploadUrl) {
    throw new Error("S3 uploadUrl이 비어 있습니다.");
  }

  const response = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    sessionType: FileSystem.FileSystemSessionType.FOREGROUND,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (__DEV__) {
    console.log("[S3 Upload]", response.status, getUrlPreview(uploadUrl));
  }

  if (response.status < 200 || response.status >= 300) {
    const bodyPreview = (response.body ?? "").slice(0, 300);
    throw new Error(`S3 이미지 업로드 실패: ${response.status} ${bodyPreview}`);
  }
}

function getUrlPreview(url: string) {
  try {
    const { host, pathname } = new URL(url);
    return `${host}${pathname}`;
  } catch {
    return url.slice(0, 80);
  }
}
