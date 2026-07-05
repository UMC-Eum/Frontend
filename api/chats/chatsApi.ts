import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/chats/chatsDTO";
import api from "../axiosInstance";
import * as FileSystem from "expo-file-system/legacy";
import { normalizeS3ObjectRef } from "@/utils/s3ObjectRef";

type ChatUploadFile = {
  name: string;
  type: string;
  size: number;
};

export class ChatS3UploadError extends Error {
  readonly status: number;
  readonly code: string;
  readonly responseText: string;
  readonly urlPreview: string;

  constructor({
    label,
    status,
    responseText,
    uploadUrl,
  }: {
    label: string;
    status: number;
    responseText: string;
    uploadUrl: string;
  }) {
    const code = parseS3ErrorCode(responseText);
    const urlPreview = getUrlPreview(uploadUrl);

    super(
      `${label} 실패: ${status}${code ? ` ${code}` : ""} ${urlPreview}`,
    );
    this.name = "ChatS3UploadError";
    this.status = status;
    this.code = code;
    this.responseText = responseText;
    this.urlPreview = urlPreview;
  }
}

export const isChatS3UploadError = (
  error: unknown,
): error is ChatS3UploadError => error instanceof ChatS3UploadError;

export const createChatRoom = async (body: DTO.IChatsRoomsPostRequest) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomsPostResponse>
  >("/v1/chats/rooms", body);
  return data.success.data;
};

export const getChatRooms = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomsGetResponse>
  >("/v1/chats/rooms", { params });
  return data.success.data;
};

export const getChatRoomDetail = async (chatRoomId: number) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomIdGetResponse>
  >(`/v1/chats/rooms/${chatRoomId}`);
  return data.success.data;
};

export const getChatMessages = async (
  chatRoomId: number,
  params: { cursor?: string | null; size?: number } = {},
) => {
  const requestParams = { size: 30, ...params };
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomIdMessagesGetResponse>
  >(`/v1/chats/rooms/${chatRoomId}/messages`, { params: requestParams });
  return data.success.data;
};

/** 미디어 업로드 URL 발급 */
export const postChatMediaPresign = async (
  chatRoomId: number,
  file: ChatUploadFile,
) => {
  // 조건분기
  let mediaType = "PHOTO";
  if (file.type.startsWith("audio")) {
    mediaType = "AUDIO";
  } else if (file.type.startsWith("video")) {
    mediaType = "VIDEO";
  }

  const payload = {
    type: mediaType,
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  };

  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomIdMediaPresignPostResponse>
  >(`/v1/chats/rooms/${chatRoomId}/media/presign`, payload);
  return data.success.data;
};

/** S3 실제 업로드 */
export const uploadChatFileToS3 = async (
  presignData: DTO.IChatsRoomIdMediaPresignPostResponse,
  file: Blob,
  contentType?: string,
) => {
  if (!presignData.uploadUrl) {
    throw new Error("S3 uploadUrl is empty.");
  }

  const requiredHeaders = presignData.requiredHeaders ?? {};
  const resolvedContentType =
    getHeaderValue(requiredHeaders, "Content-Type") || contentType || file.type;
  const headers = {
    ...requiredHeaders,
    ...(!hasHeader(requiredHeaders, "Content-Type")
      ? { "Content-Type": resolvedContentType }
      : {}),
  };

  await uploadBlobToPresignedUrl(presignData.uploadUrl, file, headers);
};

export const uploadChatFileUriToS3 = async (
  presignData: DTO.IChatsRoomIdMediaPresignPostResponse,
  fileUri: string,
  contentType?: string,
) => {
  if (!presignData.uploadUrl) {
    throw new Error("S3 uploadUrl is empty.");
  }

  const headers = getPresignedUploadHeaders(presignData, contentType);
  const response = await FileSystem.uploadAsync(presignData.uploadUrl, fileUri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    sessionType: FileSystem.FileSystemSessionType.FOREGROUND,
    headers,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new ChatS3UploadError({
      label: "S3 네이티브 업로드",
      status: response.status,
      responseText: response.body ?? "",
      uploadUrl: presignData.uploadUrl,
    });
  }

  return response;
};

function getPresignedUploadHeaders(
  presignData: DTO.IChatsRoomIdMediaPresignPostResponse,
  contentType?: string,
) {
  const requiredHeaders = presignData.requiredHeaders ?? {};
  const resolvedContentType =
    getHeaderValue(requiredHeaders, "Content-Type") || contentType;

  return {
    ...requiredHeaders,
    ...(!hasHeader(requiredHeaders, "Content-Type") && resolvedContentType
      ? { "Content-Type": resolvedContentType }
      : {}),
  };
}

function uploadBlobToPresignedUrl(
  uploadUrl: string,
  blob: Blob,
  headers: Record<string, string>,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 30000;

    xhr.open("PUT", uploadUrl);
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(
        new ChatS3UploadError({
          label: "S3 업로드",
          status: xhr.status,
          responseText: xhr.responseText ?? "",
          uploadUrl,
        }),
      );
    };
    xhr.onerror = () => {
      reject(new Error(`S3 업로드 네트워크 실패: ${getUrlPreview(uploadUrl)}`));
    };
    xhr.ontimeout = () => {
      reject(
        new Error(`S3 업로드 시간이 초과되었습니다: ${getUrlPreview(uploadUrl)}`),
      );
    };
    xhr.onabort = () => {
      reject(new Error(`S3 업로드가 취소되었습니다: ${getUrlPreview(uploadUrl)}`));
    };
    xhr.send(blob);
  });
}

function getHeaderValue(headers: Record<string, string>, targetName: string) {
  const matchedHeader = Object.entries(headers).find(
    ([name]) => name.toLowerCase() === targetName.toLowerCase(),
  );

  return matchedHeader?.[1];
}

function hasHeader(headers: Record<string, string>, targetName: string) {
  return Object.keys(headers).some(
    (name) => name.toLowerCase() === targetName.toLowerCase(),
  );
}

function getUrlPreview(url: string) {
  const match = /^(https?:\/\/[^/?#]+\/[^?]*)/i.exec(url);
  const baseUrl = match?.[1] ?? url.slice(0, 80);

  return baseUrl.length > 120 ? `${baseUrl.slice(0, 120)}...` : baseUrl;
}

function parseS3ErrorCode(responseText: string) {
  const match = /<Code>([^<]+)<\/Code>/i.exec(responseText);

  return match?.[1] ?? "";
}

export const sendChatMessage = async (
  chatRoomId: number,
  body: DTO.IChatsRoomIdMessagesPostRequset,
) => {
  const requestBody = {
    ...body,
    mediaUrl: body.mediaUrl
      ? normalizeS3ObjectRef(body.mediaUrl)
      : body.mediaUrl,
  };
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomIdMessagesPostResponse>
  >(`/v1/chats/rooms/${chatRoomId}/messages`, requestBody);
  return data.success.data;
};

export const readChatMessage = async (messageId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/chats/messages/${messageId}/read`,
  );
  return data.success.data;
};

export const patchChatMessage = async (messageId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/chats/messages/${messageId}`,
  );
  return data.success.data;
};

export const patchChatRoomLeave = async (chatRoomId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/chats/rooms/${chatRoomId}/leave`,
  );
  return data.success.data;
};
