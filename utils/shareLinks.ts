import * as Linking from "expo-linking";
import { Alert, Platform, Share } from "react-native";

// 동호회/게시글/프로필 공유 링크를 만들어 OS 공유 시트를 연다.
// 유니버설 링크(웹 도메인)가 없어 받은 사람이 어디서든 열 수 있는 https 링크는 스토어 링크뿐이다.
// 메시지에 딥링크(앱 설치자용)와 스토어 링크(미설치자용)를 함께 담는다.
// ponytail: 운영 웹 도메인/유니버설 링크가 생기면 STORE_URL 자리를 그 도메인 링크로 교체
const STORE_URL =
  Platform.OS === "android"
    ? "https://play.google.com/store/apps/details?id=com.eumdating.app"
    : "https://apps.apple.com/app/id6785847778";

async function share(
  title: string,
  path: string,
  queryParams: Record<string, string>,
  failMessage: string,
) {
  const deepLink = Linking.createURL(path, { queryParams });

  try {
    await Share.share({
      title,
      message: `${title}\n앱에서 열기: ${deepLink}\n앱 설치: ${STORE_URL}`,
      url: STORE_URL,
    });
  } catch {
    Alert.alert("공유 실패", failMessage);
  }
}

export async function shareClub(clubId: number, clubName?: string | null) {
  if (!Number.isFinite(clubId)) {
    Alert.alert("공유 실패", "동호회 정보를 불러오지 못했어요.");
    return;
  }

  await share(
    clubName || "동호회",
    "/club/detail",
    { clubId: String(clubId) },
    "동호회를 공유하지 못했어요.",
  );
}

export async function sharePost(
  clubId: number,
  postId: number,
  postTitle?: string | null,
) {
  if (!Number.isFinite(clubId) || !Number.isFinite(postId)) {
    Alert.alert("공유 실패", "게시글 정보를 불러오지 못했어요.");
    return;
  }

  await share(
    postTitle || "게시글",
    "/club/post-detail",
    { clubId: String(clubId), postId: String(postId) },
    "게시글을 공유하지 못했어요.",
  );
}

export async function shareProfile(userId: number, name?: string | null) {
  if (!Number.isFinite(userId)) {
    Alert.alert("공유 실패", "프로필 정보를 불러오지 못했어요.");
    return;
  }

  await share(
    name ? `${name}님의 프로필` : "프로필",
    "/profile-detail",
    { userId: String(userId) },
    "프로필을 공유하지 못했어요.",
  );
}
