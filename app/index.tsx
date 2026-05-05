import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    gap: 16,
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
});