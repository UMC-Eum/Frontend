/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * 서비스 이용약관 상세 페이지
 * - 뒤로가기 + 제목
 * - 약관 전문 스크롤
 */
export default function TermsDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>서비스 이용약관</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 약관 내용 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.chapterTitle}>제 1 장 총칙</Text>

        <Text style={styles.articleTitle}>제 1 조 (목적)</Text>
        <Text style={styles.articleContent}>
          본 약관은 이음(음)(이하 "회사"라 한다)가 제공하는 음성 기반 매칭 및
          커뮤니케이션 서비스 (이하 "서비스")의 이용과 관련하여 회사와 이용자
          간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로
          한다.
        </Text>

        <Text style={styles.articleTitle}>제 2 조 (용어의 정의)</Text>
        <Text style={styles.articleContent}>
          1. "서비스"란 회사가 제공하는 음성 기반 프로필 등록, 이상형 매칭, 음성
          메시지 대화, 추천 기능 등 이와 관련된 제반 서비스를 의미한다.
          {"\n"}2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는
          회 원을 말한다.
          {"\n"}3. "회원"이란 서비스 이용을 위해 본 약관 및 개인정보처리방침에
          동 의하고 회원가입을 완료한 자를 말한다.
          {"\n"}4. "아이디(ID)"란 회원 식별과 서비스 이용을 위해 회원이 설정한
          닉 네임을 의미한다.
          {"\n"}5. "음성 데이터"란 이용자가 서비스 이용 과정에서 녹음·전송하는
          음 성 파일 및 해당 음성을 변환·분석하여 생성된 텍스트, 키워드 등 파생
          정보를 의미한다.
          {"\n"}6. "매칭"이란 이용자의 음성 정보 및 선호 정보를 바탕으로 다른
          이용 자를 추천하는 과정을 의미한다.
        </Text>

        <Text style={styles.articleTitle}>제 3 조 (약관의 게시 및 변경)</Text>
        <Text style={styles.articleContent}>
          1. 본 약관은 서비스 초기 화면 또는 회원가입 화면에 게시하여 이용자 가
          확인할 수 있도록 한다.
          {"\n"}2. 회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수
          있으며, 변경 시 적용일자 및 변경 내용을 서비스 내 공지사항을 통해
          사전에 공지한다.
          {"\n"}3. 변경된 약관은 공지한 적용일로부터 효력이 발생한다.
        </Text>

        <Text style={styles.articleTitle}>제 4 조 (약관 외 준칙)</Text>
        <Text style={styles.articleContent}>
          본 약관에 명시되지 않은 사항은 「전자상거래 등에서의 소비자 보호에
          관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「개
          인정보 보호법」 등 관계 법령 및 회사가 정한 운영 정책에 따른다.
        </Text>

        <Text style={styles.chapterTitle}>제 2 장 이용계약</Text>

        <Text style={styles.articleTitle}>제 5 조 (이용신청)</Text>
        <Text style={styles.articleContent}>
          1. 이용자는 회원가입 화면에서 본 약관과 개인정보처리방침에 동의의
          함으로써 이용신청을 할 수 있다.
          {"\n"}2. 서비스는 만 50세 이상 이용자를 주요 대상으로 설계되었으며, 회
          사는 서비스 특성상 연령 확인을 요청할 수 있다.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 28,
    marginBottom: 16,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 8,
  },
  articleContent: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
});
