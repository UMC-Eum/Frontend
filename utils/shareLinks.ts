import * as Linking from "expo-linking";
import { Alert, Share } from "react-native";

// 동호회/게시글 공유 링크를 앱 스킴 딥링크로 만들어 OS 공유 시트를 연다.
// 카카오 SDK/클립보드 의존성이 없어 세 버튼(카카오톡·링크 복사·외부 공유) 모두
// 동일하게 OS 공유 시트를 사용한다.

async function share(message: string, url: string, failMessage: string) {
  try {
    await Share.share({ message: `${message}\n${url}`, url });
  } catch {
    Alert.alert("공유 실패", failMessage);
  }
}

export async function shareClub(clubId: number, clubName?: string | null) {
  if (!Number.isFinite(clubId)) {
    Alert.alert("공유 실패", "동호회 정보를 불러오지 못했어요.");
    return;
  }

  const url = Linking.createURL("/club/detail", {
    queryParams: { clubId: String(clubId) },
  });

  await share(clubName || "동호회", url, "동호회를 공유하지 못했어요.");
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

  const url = Linking.createURL("/club/post-detail", {
    queryParams: { clubId: String(clubId), postId: String(postId) },
  });

  await share(postTitle || "게시글", url, "게시글을 공유하지 못했어요.");
}
