import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
  detailType: "service" | "privacy" | "marketing";
  type: AgreementType;
  agreementId: number;
}

const SHEET_HEIGHT = 394;
const SHEET_HIDDEN_OFFSET = SHEET_HEIGHT;

/**
 * 이용약관 동의 바텀시트
 * - 개별 체크 / 전체 동의 체크
 * - 필수 항목 모두 체크 시 확인 버튼 활성화
 * - 하단에서 위로 올라오는 전환 애니메이션
 */
const TermsBottomSheet = ({
  visible,
  onConfirm,
  onClose,
}: TermsBottomSheetProps) => {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(SHEET_HIDDEN_OFFSET),
  ).current;
  const agreementsQuery = useAgreementsQuery();
  const updateMarketingMutation = useUpdateMarketingAgreementsMutation();

  const terms = useMemo<TermItem[]>(
    () =>
      agreementsQuery.data?.flatMap((item) => {
        const agreementId = Number(item.agreementId);
        const type = item.type ?? getAgreementTypeById(agreementId);
        const detailType = getAgreementDetailType(type);

        if (!type || !detailType || !Number.isFinite(agreementId)) {
          return [];
        }

        return [
          {
            id: String(item.agreementId),
            title: getAgreementTitle(type),
            required: type !== "MARKETING",
            detailType,
            type,
            agreementId,
          },
        ];
      }) ?? [],
    [agreementsQuery.data],
  );

  const isAgreementsReady = agreementsQuery.isSuccess && terms.length > 0;
  const isAgreementsEmpty = agreementsQuery.isSuccess && terms.length === 0;

  // visible 상태에 맞춰 오버레이와 시트를 자연스럽게 열고 닫는다.
  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(SHEET_HIDDEN_OFFSET);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 22,
          stiffness: 220,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_HIDDEN_OFFSET,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  }, [overlayOpacity, sheetTranslateY, visible]);

  // 전체 동의 여부
  const isAllChecked = useMemo(
    () => terms.length > 0 && terms.every((item) => checkedItems[item.id]),
    [checkedItems, terms],
  );

  // 필수 항목 모두 체크 여부
  const isRequiredAllChecked = useMemo(
    () =>
      terms
        .filter((item) => item.required)
        .every((item) => checkedItems[item.id]),
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
      return;
    }

    const allChecked: Record<string, boolean> = {};
    terms.forEach((item) => {
      allChecked[item.id] = true;
    });
    setCheckedItems(allChecked);
  }, [isAllChecked, terms]);

  // 상세 보기
  const onDetailPress = (id: string) => {
    const term = terms.find((item) => item.id === id);
    if (!term) return;

    router.push({
      pathname: "/onboarding/terms-detail",
      params: {
        type: term.detailType,
        agreementId: String(term.agreementId),
      },
    } as any);
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

  if (!isMounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 10 }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.overlayBackground, { opacity: overlayOpacity }]}
      />
      <Pressable style={styles.overlayTouchArea} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <Pressable onPress={() => {}}>
            {/* 제목 */}
            <Text style={styles.title}>
              서비스 이용을 위해{"\n"}이용약관 동의가 필요합니다.
            </Text>

            {/* 체크리스트 */}
            <View style={styles.listContainer}>
              {agreementsQuery.isLoading ? (
                <View style={styles.statusRow}>
                  <ActivityIndicator color="#FF1B4D" />
                  <Text style={styles.statusText}>
                    약관을 불러오는 중입니다.
                  </Text>
                </View>
              ) : isAgreementsEmpty ? (
                <Text style={styles.errorText}>
                  등록된 약관이 없습니다. 관리자에게 문의해주세요.
                </Text>
              ) : agreementsQuery.isError ? (
                <Text style={styles.errorText}>
                  약관을 불러오지 못했습니다. 다시 시도해주세요.
                </Text>
              ) : (
                <View style={styles.termGroup}>
                  {terms.map((item) => (
                    <View key={item.id} style={styles.listItem}>
                      <Pressable
                        style={styles.checkboxRow}
                        onPress={() => toggleItem(item.id)}
                        hitSlop={8}
                      >
                        <View style={styles.checkboxWrapper}>
                          <View
                            style={[
                              styles.checkbox,
                              checkedItems[item.id] && styles.checkboxActive,
                            ]}
                          >
                            {checkedItems[item.id] ? (
                              <Ionicons
                                name="checkmark"
                                size={19}
                                color="#FFFFFF"
                              />
                            ) : null}
                          </View>
                        </View>
                        <Text style={styles.itemTitle}>
                          <Text style={styles.itemTitleHighlight}>
                            {item.title}
                          </Text>{" "}
                          동의
                        </Text>
                        <Text style={styles.itemBadge}>
                          {item.required ? "(필수)" : "(선택)"}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.chevronButton}
                        onPress={() => onDetailPress(item.id)}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#A6AFB6"
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* 구분선 */}
              <View style={styles.separator} />

              {/* 전체 동의 */}
              <Pressable
                style={styles.allAgreeRow}
                onPress={toggleAll}
                hitSlop={8}
              >
                <View style={styles.checkboxWrapper}>
                  <View
                    style={[
                      styles.checkbox,
                      isAllChecked && styles.checkboxActive,
                    ]}
                  >
                    {isAllChecked ? (
                      <Ionicons name="checkmark" size={19} color="#FFFFFF" />
                    ) : null}
                  </View>
                </View>
                <Text style={styles.allAgreeText}>
                  모든 이용약관에 동의합니다.
                </Text>
              </Pressable>
            </View>

            {/* 확인 버튼 */}
            <Pressable
              style={[
                styles.confirmButton,
                !canConfirm && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!canConfirm}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  !canConfirm && styles.confirmButtonTextDisabled,
                ]}
              >
                확인
              </Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </View>
  );
};

function getAgreementTitle(type: AgreementType): string {
  if (type === "POLICY") return "서비스이용약관";
  if (type === "PERSONAL_INFORMATION") return "개인정보처리방침";
  if (type === "MARKETING") return "마케팅정보수신";

  return "이용약관";
}

function getAgreementTypeById(agreementId: number): AgreementType | undefined {
  if (agreementId === 1) return "POLICY";
  if (agreementId === 2) return "PERSONAL_INFORMATION";
  if (agreementId === 3) return "MARKETING";
  return undefined;
}

function getAgreementDetailType(type: AgreementType | undefined) {
  if (type === "POLICY") return "service";
  if (type === "PERSONAL_INFORMATION") return "privacy";
  if (type === "MARKETING") return "marketing";
  return undefined;
}

const styles = StyleSheet.create({
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  overlayTouchArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    width: "100%",
    height: 60,
    fontSize: 24,
    fontWeight: "600",
    color: "#202020",
    lineHeight: 30,
  },
  listContainer: {
    height: 232,
  },
  termGroup: {
    height: 168,
    paddingVertical: 12,
  },
  statusRow: {
    minHeight: 168,
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
    minHeight: 168,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#EF4444",
    fontWeight: "600",
  },
  listItem: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  checkboxWrapper: {
    width: 34,
    paddingLeft: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E9ECED",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#FF3E70",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#202020",
    lineHeight: 24,
  },
  itemTitleHighlight: {
    color: "#FF3E70",
  },
  itemBadge: {
    fontSize: 14,
    fontWeight: "500",
    color: "#A6AFB6",
    lineHeight: 20,
  },
  chevronButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#E9ECED",
  },
  allAgreeRow: {
    height: 63,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 8,
    gap: 8,
  },
  allAgreeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#202020",
    lineHeight: 23,
  },
  confirmButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FF3E70",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  confirmButtonDisabled: {
    backgroundColor: "#E9ECED",
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 23,
  },
  confirmButtonTextDisabled: {
    color: "#A6AFB6",
  },
});

export default TermsBottomSheet;
