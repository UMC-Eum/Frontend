import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>🛠 개발 메뉴</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/onboarding/splash")}
      >
        <Text style={styles.buttonText}>🚀 온보딩 플로우 시작하기</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.testButton]}
        onPress={() => router.push("/test")}
      >
        <Text style={[styles.buttonText, styles.testButtonText]}>
          🧪 컴포넌트 테스트 페이지
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.tabButton]}
        onPress={() => router.push("/(tabs)")}
      >
        <Text style={[styles.buttonText, styles.tabButtonText]}>
          📱 메인 탭 화면 열기
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.homeButton]}
        onPress={() => router.push("/home" as any)}
      >
        <Text style={[styles.buttonText, styles.homeButtonText]}>
          🏠 홈페이지 확인하기
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.recordingButton]}
        onPress={() => router.push("/ideal-recording" as any)}
      >
        <Text style={[styles.buttonText, styles.recordingButtonText]}>
          🎙 이상형 녹음 페이지 확인하기
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.searchButton]}
        onPress={() => router.push("/search" as any)}
      >
        <Text style={[styles.buttonText, styles.searchButtonText]}>
          🔎 검색 화면 확인하기
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.profileButton]}
        onPress={() => router.push("/profile/name" as any)}
      >
        <Text style={[styles.buttonText, styles.profileButtonText]}>
          👤 프로필 설정 테스트
        </Text>
      </Pressable>

      {/* 권한 허용 화면 확인 버튼입니다. */}
      <Pressable
        style={[styles.button, styles.permissionButton]}
        onPress={() => router.push("/onboarding/permissions" as any)}
      >
        <Text style={[styles.buttonText, styles.permissionButtonText]}>
          🔐 권한 허용 테스트
        </Text>
      </Pressable>

      {/* 👇 새로 추가된 채팅방 이동 버튼 👇 */}
      <Pressable
        style={[styles.button, styles.chatButton]}
        onPress={() => router.push("/chat" as any)}
      >
        <Text style={[styles.buttonText, styles.chatButtonText]}>
          💬 채팅방 리스트 뷰 확인하기
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.chatButton]}
        onPress={() => router.push("/heart" as any)}
      >
        <Text style={[styles.buttonText, styles.chatButtonText]}>
          ❤️ 마음 페이지확인하기
        </Text>
      </Pressable>

      {/* 👇 프로필 상세 테스트 버튼 👇 */}
      <Pressable
        style={[styles.button, styles.profileDetailButton]}
        onPress={() => router.push("/profile-detail")}
      >
        <Text style={[styles.buttonText, styles.profileDetailButtonText]}>
          💬 프로필 상세 테스트
        </Text>
      </Pressable>

      {/* 구독 결제 플로우 확인 버튼입니다. */}
      <Pressable
        style={[styles.button, styles.paymentButton]}
        onPress={() => router.push("/payment" as any)}
      >
        <Text style={[styles.buttonText, styles.paymentButtonText]}>
          💳 구독 결제 플로우 테스트
        </Text>
      </Pressable>

      {/* 동호회 생성 플로우 확인 버튼입니다. */}
      <Pressable
        style={[styles.button, styles.clubCreateButton]}
        onPress={() => router.push("/club/create" as any)}
      >
        <Text style={[styles.buttonText, styles.clubCreateButtonText]}>
          🏃 동호회 생성 테스트
        </Text>
      </Pressable>

      {/* 정기모임 생성 플로우 확인 버튼입니다. */}
      <Pressable
        style={[styles.button, styles.meetingCreateButton]}
        onPress={() =>
          router.push({
            pathname: "/meeting-create",
            params: { clubId: "1" },
          } as any)
        }
      >
        <Text style={[styles.buttonText, styles.meetingCreateButtonText]}>
          📅 정기모임 생성 테스트
        </Text>
      </Pressable>

      {/* 정기모임 생성 완료 화면 단독 확인 버튼입니다. */}
      <Pressable
        style={[styles.button, styles.meetingCompleteButton]}
        onPress={() => router.push("/meeting-create-complete" as any)}
      >
        <Text style={[styles.buttonText, styles.meetingCompleteButtonText]}>
          ✅ 정기모임 생성 완료 테스트
        </Text>
      </Pressable>

      {/* 동호회 홈 화면 확인 버튼입니다. */}
      <Pressable
        style={[styles.button, styles.clubHomeButton]}
        onPress={() => router.push("/club/home" as any)}
      >
        <Text style={[styles.buttonText, styles.clubHomeButtonText]}>
          🏠 동호회 홈 테스트
        </Text>
      </Pressable>

      {/* 동호회 가입 전 상세 화면 확인 버튼입니다. */}
      <Pressable
        style={[styles.button, styles.clubDetailButton]}
        onPress={() => router.push("/club/detail" as any)}
      >
        <Text style={[styles.buttonText, styles.clubDetailButtonText]}>
          🏔 동호회 상세 가입 테스트
        </Text>
      </Pressable>

      {/* 동호회 게시글 작성/상세 플로우 확인 버튼입니다. */}
      <Pressable
        style={[styles.button, styles.clubPostButton]}
        onPress={() =>
          router.push({
            pathname: "/club/post-create",
            params: { clubId: "1" },
          } as any)
        }
      >
        <Text style={[styles.buttonText, styles.clubPostButtonText]}>
          ✍️ 동호회 글쓰기 테스트
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.clubPostDetailButton]}
        onPress={() =>
          router.push({
            pathname: "/club/post-detail",
            params: { postId: "1" },
          } as any)
        }
      >
        <Text style={[styles.buttonText, styles.clubPostDetailButtonText]}>
          📝 게시글 상세 테스트
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.clubPostGuestButton]}
        onPress={() =>
          router.push({
            pathname: "/club/post-detail",
            params: { postId: "1", mode: "guest" },
          } as any)
        }
      >
        <Text style={[styles.buttonText, styles.clubPostGuestButtonText]}>
          🚨 게시글 신고 메뉴 테스트
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // contentContainerStyle for ScrollView
  container: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  // ScrollView style to fill available space
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1F2937",
  },
  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#FF3E70",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  testButton: {
    backgroundColor: "#F3F4F6",
  },
  testButtonText: {
    color: "#4B5563",
  },
  tabButton: {
    backgroundColor: "#E0E7FF",
  },
  tabButtonText: {
    color: "#4338CA",
  },
  homeButton: {
    backgroundColor: "#EEF2FF",
  },
  homeButtonText: {
    color: "#3730A3",
  },
  recordingButton: {
    backgroundColor: "#FFF7ED",
  },
  recordingButtonText: {
    color: "#C2410C",
  },
  searchButton: {
    backgroundColor: "#F1F5F9",
  },
  searchButtonText: {
    color: "#334155",
  },
  profileButton: {
    backgroundColor: "#FFF1F4",
  },
  profileButtonText: {
    color: "#FF3E70",
  },
  permissionButton: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  permissionButtonText: {
    color: "#2563EB",
  },
  // 👇 새로 추가된 채팅방 버튼 스타일 👇
  chatButton: {
    backgroundColor: "#ECFDF5", // 연한 초록색 배경
  },
  chatButtonText: {
    color: "#059669", // 진한 초록색 글씨
  },
  // 👇 프로필 상세 버튼 스타일 👇
  profileDetailButton: {
    backgroundColor: "#F0FDF4",
  },
  profileDetailButtonText: {
    color: "#16A34A",
  },
  paymentButton: {
    backgroundColor: "#FFF1F4",
    borderWidth: 1,
    borderColor: "#FFB8C8",
  },
  paymentButtonText: {
    color: "#FC3367",
  },
  clubCreateButton: {
    backgroundColor: "#FFF1F4",
  },
  clubCreateButtonText: {
    color: "#FC3367",
  },
  meetingCreateButton: {
    backgroundColor: "#FFF0F2",
  },
  meetingCreateButtonText: {
    color: "#FF3E70",
  },
  meetingCompleteButton: {
    backgroundColor: "#F8FAFB",
    borderWidth: 1,
    borderColor: "#DEE3E5",
  },
  meetingCompleteButtonText: {
    color: "#636970",
  },
  clubHomeButton: {
    backgroundColor: "#F1F5F9",
  },
  clubHomeButtonText: {
    color: "#0F172A",
  },
  clubDetailButton: {
    backgroundColor: "#EEF2FF",
  },
  clubDetailButtonText: {
    color: "#3730A3",
  },
  clubPostButton: {
    backgroundColor: "#FFF1F4",
  },
  clubPostButtonText: {
    color: "#FC3367",
  },
  clubPostDetailButton: {
    backgroundColor: "#F8FAFB",
    borderWidth: 1,
    borderColor: "#DEE3E5",
  },
  clubPostDetailButtonText: {
    color: "#202020",
  },
  clubPostGuestButton: {
    backgroundColor: "#FEF2F2",
  },
  clubPostGuestButtonText: {
    color: "#DC2626",
  },
});
