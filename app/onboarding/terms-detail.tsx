import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TermType = "service" | "privacy" | "marketing";

type TermSection = {
  heading?: string;
  articles: {
    title: string;
    content: string;
  }[];
};

const TERM_DETAIL: Record<
  TermType,
  {
    title: string;
    sections: TermSection[];
  }
> = {
  service: {
    title: "서비스이용약관",
    sections: [
      {
        heading: "제 1 장 총칙",
        articles: [
          {
            title: "제 1 조 (목적)",
            content:
              '본 약관은 이음(음)(이하 "회사"라 한다)가 제공하는 음성 기반 매칭 및 커뮤니케이션 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 한다.',
          },
          {
            title: "제 2 조 (용어의 정의)",
            content:
              '1. "서비스"란 회사가 제공하는 음성 기반 프로필 등록, 이상형 매칭, 음성 메시지 대화, 추천 기능 등 이와 관련된 제반 서비스를 의미한다.\n2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원을 말한다.\n3. "회원"이란 서비스 이용을 위해 본 약관 및 개인정보처리방침에 동의하고 회원가입을 완료한 자를 말한다.\n4. "아이디(ID)"란 회원 식별과 서비스 이용을 위해 회원이 설정한 닉네임을 의미한다.\n5. "음성 데이터"란 이용자가 서비스 이용 과정에서 녹음·전송하는 음성 파일 및 해당 음성을 변환·분석하여 생성된 텍스트, 키워드 등 파생 정보를 의미한다.\n6. "매칭"이란 이용자의 음성 정보 및 선호 정보를 바탕으로 다른 이용자를 추천하는 과정을 의미한다.',
          },
          {
            title: "제 3 조 (약관의 게시 및 변경)",
            content:
              "1. 본 약관은 서비스 초기 화면 또는 회원가입 화면에 게시하여 이용자가 확인할 수 있도록 한다.\n2. 회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경 내용을 서비스 내 공지사항을 통해 사전에 공지한다.\n3. 변경된 약관은 공지한 적용일로부터 효력이 발생한다.",
          },
          {
            title: "제 4 조 (약관 외 준칙)",
            content:
              "본 약관에 명시되지 않은 사항은 전자상거래 등에서의 소비자 보호에 관한 법률, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보 보호법 등 관계 법령 및 회사가 정한 운영 정책에 따른다.",
          },
        ],
      },
      {
        heading: "제 2 장 이용계약",
        articles: [
          {
            title: "제 5 조 (이용신청)",
            content:
              "1. 이용자는 회원가입 화면에서 본 약관과 개인정보처리방침에 동의함으로써 이용신청을 할 수 있다.\n2. 서비스는 만 50세 이상 이용자를 주요 대상으로 설계되었으며, 회사는 서비스 특성상 연령 확인을 요청할 수 있다.",
          },
        ],
      },
    ],
  },
  privacy: {
    title: "개인정보처리방침",
    sections: [
      {
        heading: "제 1 장 개인정보 처리",
        articles: [
          {
            title: "제 1 조 (개인정보의 처리 목적)",
            content:
              "회사는 회원가입, 본인 확인, 서비스 제공, 이용자 상담, 맞춤형 매칭 및 서비스 개선을 위해 필요한 범위에서 개인정보를 처리한다.",
          },
          {
            title: "제 2 조 (처리하는 개인정보 항목)",
            content:
              "회사는 서비스 제공을 위해 이름, 생년월일, 성별, 연락처, 프로필 정보, 음성 데이터, 서비스 이용 기록 등 필요한 정보를 수집할 수 있다.",
          },
          {
            title: "제 3 조 (개인정보의 보유 및 이용기간)",
            content:
              "회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기한다. 단, 관계 법령에 따라 보관이 필요한 정보는 정해진 기간 동안 보관할 수 있다.",
          },
        ],
      },
    ],
  },
  marketing: {
    title: "마케팅 정보 수신",
    sections: [
      {
        articles: [
          {
            title: "마케팅 정보 수신 동의",
            content:
              "회사는 이벤트, 혜택, 신규 기능 안내 등 서비스 관련 마케팅 정보를 앱 알림, 문자, 이메일 등의 방법으로 발송할 수 있다.",
          },
          {
            title: "수신 동의 철회",
            content:
              "이용자는 언제든지 마케팅 정보 수신 동의를 철회할 수 있으며, 동의 철회 후에도 서비스 이용에는 제한이 없다.",
          },
        ],
      },
    ],
  },
};

/**
 * 약관 상세 페이지
 * - 뒤로가기 + 제목
 * - 선택한 약관 타입에 맞는 전문 스크롤
 */
export default function TermsDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type?: TermType }>();
  const termDetail = TERM_DETAIL[type ?? "service"] ?? TERM_DETAIL.service;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>{termDetail.title}</Text>
      </View>

      {/* 약관 내용 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {termDetail.sections.map((section, sectionIndex) => (
          <View key={`${termDetail.title}-${sectionIndex}`}>
            {section.heading ? (
              <Text style={styles.chapterTitle}>{section.heading}</Text>
            ) : null}
            {section.articles.map((article) => (
              <View key={article.title}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleContent}>{article.content}</Text>
              </View>
            ))}
          </View>
        ))}
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
    height: 45,
    paddingHorizontal: 20,
    gap: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    lineHeight: 29,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  chapterTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#585858",
    lineHeight: 22,
    marginTop: 20,
    marginBottom: 12,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#585858",
    lineHeight: 18,
    marginTop: 16,
    marginBottom: 6,
  },
  articleContent: {
    fontSize: 14,
    fontWeight: "400",
    color: "#585858",
    lineHeight: 18,
  },
});
