import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Alert, Image as RNImage, Platform } from "react-native";

import {
  isChatS3UploadError,
  postChatMediaPresign,
  uploadChatFileToS3,
  uploadChatFileUriToS3,
} from "@/api/chats/chatsApi";
import { ensurePermission } from "@/utils/permissions";
import { normalizeImageForUpload } from "@/utils/s3ImageUpload";

const DEFAULT_CHAT_GALLERY_IMAGE_URIS = [
  RNImage.resolveAssetSource(require("@/assets/images/default-profile.png")).uri,
  RNImage.resolveAssetSource(
    require("@/assets/images/onboarding-background-image.png"),
  ).uri,
  RNImage.resolveAssetSource(require("@/assets/images/splash-image.png")).uri,
];

let defaultGalleryImageIndex = 0;

export async function pickChatImage(source: "camera" | "gallery") {
  if (Platform.OS === "web" && source === "gallery") {
    return getNextDefaultChatGalleryImage();
  }

  if (source === "gallery") {
    let permissionResult = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (!permissionResult.granted && permissionResult.canAskAgain) {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult.granted) {
      Alert.alert(
        "갤러리 권한 필요",
        "사진을 첨부하려면 갤러리 접근 권한이 필요해요.",
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
    });

    return result.canceled ? null : (result.assets[0] ?? null);
  }

  const hasPermission = await ensurePermission({
    getPermission: ImagePicker.getCameraPermissionsAsync,
    requestPermission: ImagePicker.requestCameraPermissionsAsync,
    title: "카메라 권한 필요",
    message: "설정에서 카메라 접근 권한을 허용해주세요.",
  });
  if (!hasPermission) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.85,
  });

  return result.canceled ? null : (result.assets[0] ?? null);
}

export async function uploadChatPhotoMessage(chatRoomId: number, uri: string) {
  const image = await normalizeImageForUpload(uri);
  const contentType = image.contentType;
  const fileName = `chat-photo-${Date.now()}.${image.extension}`;
  const uploadFile = await getUploadFileInfo(image.uri, contentType);

  const presignData = await postChatMediaPresign(chatRoomId, {
    name: fileName,
    type: contentType,
    size: uploadFile.size,
  });

  if (Platform.OS !== "web" && isLocalFileUri(image.uri)) {
    try {
      await uploadChatFileUriToS3(presignData, image.uri, contentType);
      return presignData.mediaRef;
    } catch (error) {
      if (isTerminalS3UploadError(error)) {
        throw error;
      }
    }
  }

  const blob = uploadFile.blob ?? (await getBlob(image.uri, contentType));
  await uploadChatFileToS3(presignData, blob, contentType);

  return presignData.mediaRef;
}

export async function uploadChatVoiceMessage(chatRoomId: number, uri: string) {
  const contentType = resolveAudioContentType(uri);
  const fileName = `chat-voice-${Date.now()}.${contentTypeToExtension(contentType)}`;
  const uploadFile = await getUploadFileInfo(uri, contentType);

  const presignData = await postChatMediaPresign(chatRoomId, {
    name: fileName,
    type: contentType,
    size: uploadFile.size,
  });

  if (Platform.OS !== "web" && isLocalFileUri(uri)) {
    try {
      await uploadChatFileUriToS3(presignData, uri, contentType);
      return presignData.mediaRef;
    } catch (error) {
      if (isTerminalS3UploadError(error)) {
        throw error;
      }
    }
  }

  const blob = uploadFile.blob ?? (await getBlob(uri, contentType));
  await uploadChatFileToS3(presignData, blob, contentType);

  return presignData.mediaRef;
}

function getNextDefaultChatGalleryImage() {
  const uri =
    DEFAULT_CHAT_GALLERY_IMAGE_URIS[
      defaultGalleryImageIndex % DEFAULT_CHAT_GALLERY_IMAGE_URIS.length
    ];
  defaultGalleryImageIndex += 1;

  return {
    uri,
    width: 512,
    height: 512,
  };
}

async function getUploadFileInfo(uri: string, contentType: string) {
  if (Platform.OS !== "web" && isLocalFileUri(uri)) {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (
      fileInfo.exists &&
      !fileInfo.isDirectory &&
      typeof fileInfo.size === "number" &&
      fileInfo.size > 0
    ) {
      return { size: fileInfo.size, blob: undefined as Blob | undefined };
    }
  }

  const blob = await getBlob(uri, contentType);
  return { size: blob.size, blob };
}

async function getBlob(uri: string, contentType: string) {
  const response = await fetch(uri);
  const blob = await response.blob();
  if (blob.size <= 0) {
    throw new Error("첨부 파일이 비어 있습니다.");
  }

  return blob.type ? blob : new Blob([blob], { type: contentType });
}

function isTerminalS3UploadError(error: unknown) {
  return isChatS3UploadError(error) && error.status >= 400;
}

function isLocalFileUri(uri: string) {
  return uri.startsWith("file://");
}

function resolveAudioContentType(uri: string) {
  if (uri.toLowerCase().endsWith(".webm")) {
    return "audio/webm";
  }

  return "audio/mp4";
}

function contentTypeToExtension(contentType: string) {
  if (contentType === "audio/webm") {
    return "webm";
  }

  return "m4a";
}
