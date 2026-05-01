import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProfileStepLayout from "@/components/profile/ProfileStepLayout";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CIRCLE_SIZE = SCREEN_WIDTH * 0.75;

/**
 * 사진 등록 화면
 * - 프로필 사진 placeholder + 카메라 아이콘
 * - 탭하면 하단 액션시트 모달
 * - 이미지 선택 → 원형 크롭 프리뷰 화면
 * - 확정 후 다음 버튼 활성화
 */
export default function PhotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handlePhotoPick = () => {
    setShowActionSheet(true);
  };

  const [pendingAction, setPendingAction] = useState<'gallery' | null>(null);

  const handlePickFromGallery = () => {
    setPendingAction('gallery');
    setShowActionSheet(false);
  };

  const onModalDismiss = async () => {
    if (pendingAction === 'gallery') {
      setPendingAction(null);
      
      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.status !== 'granted') {
          alert("갤러리 접근 권한이 필요합니다.");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setPreviewUri(result.assets[0].uri);
        }
      } catch (error) {
        console.error("Gallery Error:", error);
      }
    }
  };

  const handleDefaultProfile = () => {
    setShowActionSheet(false);
    setPhotoUri("default");
  };

  const handleCancelAction = () => {
    setShowActionSheet(false);
  };

  // 원형 크롭 프리뷰: 확정
  const handleCropConfirm = () => {
    if (previewUri) {
      setPhotoUri(previewUri);
    }
    setPreviewUri(null);
  };

  // 원형 크롭 프리뷰: 취소
  const handleCropCancel = () => {
    setPreviewUri(null);
  };

  const handleNext = () => {
    router.push("/profile/welcome" as any);
  };

  // 원형 크롭 프리뷰 화면
  if (previewUri) {
    return (
      <View style={styles.cropContainer}>
        {/* 풀스크린 이미지 */}
        <Image
          source={{ uri: previewUri }}
          style={styles.cropImage}
          contentFit="cover"
        />

        {/* 원형 가이드 오버레이 */}
        <View style={styles.cropOverlay} pointerEvents="none">
          {/* 상단 어둡게 */}
          <View style={styles.cropDarkTop} />
          {/* 중간: 좌 어둡게 | 원형 투명 | 우 어둡게 */}
          <View style={styles.cropMiddleRow}>
            <View style={styles.cropDarkSide} />
            <View style={styles.cropCircleHole}>
              <View style={styles.cropCircleBorder} />
            </View>
            <View style={styles.cropDarkSide} />
          </View>
          {/* 하단 어둡게 */}
          <View style={styles.cropDarkBottom} />
        </View>

        {/* 상단 헤더: 취소 / 다음 */}
        <View style={[styles.cropHeader, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={handleCropCancel} hitSlop={12}>
            <Text style={styles.cropHeaderText}>취소</Text>
          </Pressable>
          <Pressable onPress={handleCropConfirm} hitSlop={12}>
            <Text style={styles.cropHeaderText}>다음</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ProfileStepLayout
      title="사진을 등록해주세요."
      subtitle="따뜻한 미소가 담긴 사진은 매칭에 큰 도움이 됩니다."
      buttonEnabled={photoUri !== null}
      onNext={handleNext}
    >
      <View style={styles.photoArea}>
        {/* 원형 + 뱃지를 감싸는 컨테이너 */}
        <View style={styles.photoContainer}>
          <Pressable style={styles.photoCircle} onPress={handlePhotoPick}>
            {photoUri && photoUri !== "default" ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.photoImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.placeholderInner}>
                <Ionicons name="person" size={80} color="#D1D5DB" />
              </View>
            )}
          </Pressable>
          {/* 카메라 뱃지 (원형 바깥) */}
          <Pressable style={styles.cameraBadge} onPress={handlePhotoPick}>
            <Ionicons name="camera" size={18} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      {/* 하단 액션시트 모달 */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="slide"
        onRequestClose={handleCancelAction}
        onDismiss={onModalDismiss}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancelAction}>
          <View
            style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}
          >
            <View style={styles.modalGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalOption,
                  pressed && styles.modalOptionPressed,
                ]}
                onPress={handlePickFromGallery}
              >
                <Text style={styles.modalOptionText}>
                  촬영 또는 앨범에서 선택
                </Text>
              </Pressable>
              <View style={styles.modalDivider} />
              <Pressable
                style={({ pressed }) => [
                  styles.modalOption,
                  pressed && styles.modalOptionPressed,
                ]}
                onPress={handleDefaultProfile}
              >
                <Text style={styles.modalOptionText}>기본 프로필 선택</Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.modalCancel,
                pressed && styles.modalOptionPressed,
              ]}
              onPress={handleCancelAction}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ProfileStepLayout>
  );
}

const styles = StyleSheet.create({
  // === 메인 화면 ===
  photoArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photoContainer: {
    width: 180,
    height: 180,
  },
  photoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholderInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  // === 액션시트 모달 ===
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  modalGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
  },
  modalOption: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOptionPressed: {
    backgroundColor: "#F3F4F6",
  },
  modalOptionText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#1F2937",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  modalCancel: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
  },

  // === 원형 크롭 프리뷰 ===
  cropContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  cropImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cropOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cropDarkTop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  cropMiddleRow: {
    flexDirection: "row",
    height: CIRCLE_SIZE,
  },
  cropDarkSide: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  cropCircleHole: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  cropCircleBorder: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  cropDarkBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  cropHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cropHeaderText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
