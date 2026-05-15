import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useAgreementsQuery,
  useUpdateMarketingAgreementsMutation,
} from "@/hooks/api/useAgreements";
import { AgreementType } from "@/types/api/agreements/agreementsDTO";

interface TermsBottomSheetProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

interface TermItem {
  id: string;
  title: string;
  required: boolean;
  type?: AgreementType;
  agreementId?: number;
}

/**
 * 이용약관 동의 바텀시트
 * - 개별 체크 / 전체 동의 체크
 * - 필수 항목 모두 체크 시 확인 버튼 활성화
 */
const TermsBottomSheet = ({
  visible,
  onConfirm,
  onClose,
}: TermsBottomSheetProps) => {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const agreementsQuery = useAgreementsQuery();
  const updateMarketingMutation = useUpdateMarketingAgreementsMutation();
  const terms = useMemo<TermItem[]>(
    () =>
      agreementsQuery.data?.map((item) => ({
        id: String(item.agreementId),
        title: getAgreementTitle(item.type, item.body),
        required: item.type !== "MARKETING",
        type: item.type,
        agreementId: item.agreementId,
      })) ?? [],
    [agreementsQuery.data],
  );
  const isAgreementsReady = agreementsQuery.isSuccess && terms.length > 0;

  // 전체 동의 여부
  const isAllChecked = useMemo(
    () => terms.every((item) => checkedItems[item.id]),
    [checkedItems, terms],
  );

  // 필수 항목 모두 체크 여부
  const isRequiredAllChecked = useMemo(
    () =>
      terms.filter((item) => item.required).every(
        (item) => checkedItems[item.id],
    ),
    [checkedItems, terms],
  );
  const canConfirm =
    isAgreementsReady &&
    isRequiredAllChecked &&
    !updateMarketingMutation.isPending;

  // 개별 항목 토글
  const toggleItem = useCallback((id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // 전체 동의 토글
  const toggleAll = useCallback(() => {
    if (isAllChecked) {
      setCheckedItems({});
    } else {
      const allChecked: Record<string, boolean> = {};
      terms.forEach((item) => {
        allChecked[item.id] = true;
      });
      setCheckedItems(allChecked);
    }
  }, [isAllChecked, terms]);

  // 상세 보기
  const onDetailPress = (id: string) => {
    router.push("/onboarding/terms-detail" as any);
  };

  // 선택 약관인 마케팅 동의 여부만 서버 API에 반영합니다.
  const handleConfirm = () => {
    if (!isAgreementsReady) {
      Alert.alert("약관을 불러오지 못했습니다", "잠시 후 다시 시도해주세요.");
      return;
    }

    const marketingAgreements = terms
      .filter(
        (item): item is TermItem & { agreementId: number } =>
          item.type === "MARKETING" && typeof item.agreementId === "number",
      )
      .map((item) => ({
        marketingAgreementId: item.agreementId,
        isAgreed: !!checkedItems[item.id],
      }));

    if (marketingAgreements.length === 0) {
      onConfirm();
      return;
    }

    updateMarketingMutation.mutate(marketingAgreements, {
      onSuccess: onConfirm,
      onError: () => {
        Alert.alert(
          "동의 저장 실패",
          "마케팅 수신 동의를 저장하지 못했습니다. 다시 시도해주세요.",
        );
      },
    });
  };

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 10 }]}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* 제목 */}
          <Text style={styles.title}>
            서비스 이용을 위해{"\n"}이용약관 동의가 필요합니다.
          </Text>

          {/* 체크리스트 */}
          <View style={styles.listContainer}>
            {agreementsQuery.isLoading ? (
              <View style={styles.statusRow}>
                <ActivityIndicator color="#FF1B4D" />
                <Text style={styles.statusText}>약관을 불러오는 중입니다.</Text>
              </View>
            ) : agreementsQuery.isError || terms.length === 0 ? (
              <Text style={styles.errorText}>
                약관을 불러오지 못했습니다. 다시 시도해주세요.
              </Text>
            ) : (
              terms.map((item) => (
                <View key={item.id} style={styles.listItem}>
                  <Pressable
                    style={styles.checkboxRow}
                    onPress={() => toggleItem(item.id)}
                    hitSlop={8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        checkedItems[item.id] && styles.checkboxActive,
                      ]}
                    >
                      {checkedItems[item.id] && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.itemTitle}>
                      <Text style={styles.itemTitleLink}>{item.title}</Text>{" "}
                      동의
                    </Text>
                    <Text style={styles.itemBadge}>
                      {item.required ? "(필수)" : "(선택)"}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => onDetailPress(item.id)} hitSlop={8}>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CBD5E1"
                    />
                  </Pressable>
                </View>
              ))
            )}
          </View>

          {/* 구분선 */}
          <View style={styles.separator} />

          {/* 전체 동의 */}
          <Pressable style={styles.allAgreeRow} onPress={toggleAll} hitSlop={8}>
            <View
              style={[
                styles.checkbox,
                styles.checkboxLarge,
                isAllChecked && styles.checkboxActive,
              ]}
            >
              {isAllChecked && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.allAgreeText}>모든 이용약관에 동의합니다.</Text>
          </Pressable>

          {/* 확인 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              canConfirm
                ? styles.confirmButtonActive
                : styles.confirmButtonDisabled,
              pressed && canConfirm && styles.confirmButtonPressed,
            ]}
            onPress={canConfirm ? handleConfirm : undefined}
            disabled={!canConfirm}
          >
            <Text
              style={[
                styles.confirmButtonText,
                canConfirm
                  ? styles.confirmButtonTextActive
                  : styles.confirmButtonTextDisabled,
              ]}
            >
              확인
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </View>
  );
};

function getAgreementTitle(type: AgreementType | undefined, body: string) {
  if (type === "POLICY") return "서비스이용약관";
  if (type === "PERSONAL_INFORMATION") return "개인정보처리방침";
  if (type === "MARKETING") return "마케팅정보수신";

  return body.slice(0, 18) || "이용약관";
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 32,
    marginBottom: 28,
  },
  listContainer: {
    gap: 4,
  },
  statusRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    fontWeight: "600",
  },
  errorText: {
    minHeight: 72,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#EF4444",
    fontWeight: "600",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxLarge: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  checkboxActive: {
    backgroundColor: "#FF3E70",
    borderColor: "#FF3E70",
  },
  itemTitle: {
    fontSize: 15,
    color: "#1F2937",
  },
  itemTitleLink: {
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  itemBadge: {
    fontSize: 13,
    color: "#9CA3AF",
    marginLeft: 6,
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },
  allAgreeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 20,
  },
  allAgreeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  confirmButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonActive: {
    backgroundColor: "#FF3E70",
  },
  confirmButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  confirmButtonPressed: {
    opacity: 0.85,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonTextActive: {
    color: "#FFFFFF",
  },
  confirmButtonTextDisabled: {
    color: "#9CA3AF",
  },
});

export default TermsBottomSheet;
