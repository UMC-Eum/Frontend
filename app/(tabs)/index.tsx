import { Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Feat/#2basicComponent 컴포넌트 ---
import CheckList from "@/components/CheckList";
import NotificationItem from "@/components/NotificationItem";

// ⚠️ 주의: TabBar 경로가 브랜치마다 달랐습니다. 
// 프로젝트 구조에 맞는 경로 하나만 남겨주세요!
import TabBar from "@/components/TabBar"; 
// import TabBar from "../(tabs)/TabBar"; 

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* --- dev 브랜치: 테스트 페이지 이동 버튼 --- */}
        <View style={styles.testBtnWrapper}>
          <Link href="/test" asChild>
            <Pressable style={styles.testBtn}>
              <Text style={styles.testBtnText}>
                컴포넌트 테스트 페이지 열기 👉
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* --- Feat/#2basicComponent 브랜치: 추가된 UI --- */}
        <TabBar />
        
        <NotificationItem
          userId="user123"
          userName="John Doe"
          notificationContent="You have a new message!"
          timestamp={new Date()}
        />
        
        <CheckList
          title="할 일 목록"
          subTitle="오늘 해야 할 일들을 확인하세요"
          large={false}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
  },
  // 테스트 버튼용 스타일 (dev 브랜치 코드 변환)
  testBtnWrapper: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  testBtn: {
    backgroundColor: "#FC3367",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
  },
  testBtnText: {
    color: "white",
    fontWeight: "bold",
    overflow: "hidden",
  },
});