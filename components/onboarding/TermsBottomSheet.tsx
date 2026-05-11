import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

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
    router.push({
      pathname: "/onboarding/terms-detail",
      params: { type: id },
    } as any);
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
              <View style={styles.termGroup}>
                {TERMS_LIST.map((item) => (
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
                          <Ionicons
                            name="checkmark"
                            size={19}
                            color="#FFFFFF"
                          />
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
                    <Ionicons
                      name="checkmark"
                      size={19}
                      color="#FFFFFF"
                    />
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
                !isRequiredAllChecked && styles.confirmButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={!isRequiredAllChecked}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  !isRequiredAllChecked && styles.confirmButtonTextDisabled,
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
