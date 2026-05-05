import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface DevBackHeaderProps {
  /** 헤더에 표시할 제목 */
  title?: string;
}

/**
 * 개발용 뒤로가기 헤더
 * - 왼쪽: 뒤로가기 버튼 (개발 메뉴로 돌아감)
 * - 중앙: 페이지 제목
 * - 재사용: 테스트 페이지, 탭 화면 등 어디서든 import 해서 사용
 */
const DevBackHeader = ({ title = "" }: DevBackHeaderProps) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
        hitSlop={12}
      >
        <Ionicons name="chevron-back" size={26} color="#A6AFB6" />
        <Text style={styles.backText}>{title}</Text>
      </Pressable>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {/* 오른쪽 빈 공간 (중앙 정렬용) */}
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 90,
  },
  backText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  spacer: {
    minWidth: 90,
  },
});

export default DevBackHeader;
