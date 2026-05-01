import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TermsBottomSheetProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

interface TermItem {
  id: string;
  title: string;
  required: boolean;
}

const TERMS_LIST: TermItem[] = [
  { id: "service", title: "서비스이용약관", required: true },
  { id: "privacy", title: "개인정보처리방침", required: true },
  { id: "marketing", title: "마케팅정보수신", required: false },
];

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

  // 전체 동의 여부
  const isAllChecked = useMemo(
    () => TERMS_LIST.every((item) => checkedItems[item.id]),
    [checkedItems],
  );

  // 필수 항목 모두 체크 여부
  const isRequiredAllChecked = useMemo(
    () =>
      TERMS_LIST.filter((item) => item.required).every(
        (item) => checkedItems[item.id],
      ),
    [checkedItems],
  );

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
      TERMS_LIST.forEach((item) => {
        allChecked[item.id] = true;
      });
      setCheckedItems(allChecked);
    }
  }, [isAllChecked]);

  // 상세 보기
  const onDetailPress = (id: string) => {
    router.push("/onboarding/terms-detail" as any);
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
            {TERMS_LIST.map((item) => (
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
                    <Text style={styles.itemTitleLink}>{item.title}</Text> 동의
                  </Text>
                  <Text style={styles.itemBadge}>
                    {item.required ? "(필수)" : "(선택)"}
                  </Text>
                </Pressable>
                <Pressable onPress={() => onDetailPress(item.id)} hitSlop={8}>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </Pressable>
              </View>
            ))}
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
              isRequiredAllChecked
                ? styles.confirmButtonActive
                : styles.confirmButtonDisabled,
              pressed && isRequiredAllChecked && styles.confirmButtonPressed,
            ]}
            onPress={isRequiredAllChecked ? onConfirm : undefined}
            disabled={!isRequiredAllChecked}
          >
            <Text
              style={[
                styles.confirmButtonText,
                isRequiredAllChecked
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
