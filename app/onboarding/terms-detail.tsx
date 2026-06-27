import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAgreementsQuery } from "@/hooks/api/useAgreements";
import { AgreementType } from "@/types/api/agreements/agreementsDTO";

type TermType = "service" | "privacy" | "marketing";

/**
 * 약관 상세 페이지
 * - /v1/agreements 응답에서 선택한 agreementId의 body를 표시합니다.
 */
export default function TermsDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { agreementId, type } = useLocalSearchParams<{
    agreementId?: string;
    type?: TermType;
  }>();
  const agreementsQuery = useAgreementsQuery();

  const selectedAgreement = useMemo(() => {
    const agreements = agreementsQuery.data ?? [];

    if (agreementId) {
      const agreementById = agreements.find(
        (item) => String(item.agreementId) === agreementId,
      );
      if (agreementById) return agreementById;
    }

    return agreements.find((item) => {
      const itemType = item.type ?? getAgreementTypeById(Number(item.agreementId));
      return getAgreementDetailType(itemType) === type;
    });
  }, [agreementId, agreementsQuery.data, type]);

  const selectedType =
    selectedAgreement?.type ??
    getAgreementTypeById(Number(selectedAgreement?.agreementId)) ??
    getAgreementTypeByDetailType(type);
  const title = getAgreementTitle(selectedType);
  const body = selectedAgreement?.body?.trim();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {agreementsQuery.isLoading ? (
          <View style={styles.statusBox}>
            <ActivityIndicator color="#FF3E70" />
            <Text style={styles.statusText}>약관을 불러오는 중입니다.</Text>
          </View>
        ) : agreementsQuery.isError ? (
          <Text style={styles.errorText}>
            약관을 불러오지 못했습니다. 다시 시도해주세요.
          </Text>
        ) : body ? (
          <Text style={styles.articleContent}>{body}</Text>
        ) : (
          <Text style={styles.errorText}>약관 내용을 찾을 수 없습니다.</Text>
        )}
      </ScrollView>
    </View>
  );
}

function getAgreementTitle(type: AgreementType | undefined): string {
  if (type === "POLICY") return "서비스이용약관";
  if (type === "PERSONAL_INFORMATION") return "개인정보처리방침";
  if (type === "MARKETING") return "마케팅 정보 수신";
  return "이용약관";
}

function getAgreementTypeById(agreementId: number): AgreementType | undefined {
  if (agreementId === 1) return "POLICY";
  if (agreementId === 2) return "PERSONAL_INFORMATION";
  if (agreementId === 3) return "MARKETING";
  return undefined;
}

function getAgreementTypeByDetailType(
  type: TermType | undefined,
): AgreementType | undefined {
  if (type === "service") return "POLICY";
  if (type === "privacy") return "PERSONAL_INFORMATION";
  if (type === "marketing") return "MARKETING";
  return undefined;
}

function getAgreementDetailType(type: AgreementType | undefined) {
  if (type === "POLICY") return "service";
  if (type === "PERSONAL_INFORMATION") return "privacy";
  if (type === "MARKETING") return "marketing";
  return undefined;
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
    flex: 1,
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
    paddingTop: 30,
    paddingBottom: 40,
  },
  statusBox: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    lineHeight: 20,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    lineHeight: 20,
    textAlign: "center",
  },
  articleContent: {
    fontSize: 14,
    fontWeight: "400",
    color: "#585858",
    lineHeight: 22,
  },
});
