import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import CircleImageCropper, {
  CircleCropAsset,
  CircleCropResult,
} from "@/components/profile/CircleImageCropper";
import ProfileStepLayout from "@/components/profile/ProfileStepLayout";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

const PROFILE_IMAGE_SIZE = 200;
const DEFAULT_PROFILE_IMAGE_URL =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=1200&auto=format&fit=crop";

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
  const draftProfileImageUri = useOnboardingDraftStore(
    (state) => state.profileImageUri,
  );
  const setDraftProfileImageUri = useOnboardingDraftStore(
    (state) => state.setProfileImageUri,
  );
  const [photoUri, setPhotoUri] = useState<string | null>(draftProfileImageUri);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<CircleCropAsset | null>(null);

  const handlePhotoPick = () => {
    setShowActionSheet(true);
  };

  const [pendingAction, setPendingAction] = useState<"gallery" | null>(null);

  const handlePickFromGallery = () => {
    setPendingAction("gallery");
    setShowActionSheet(false);
  };

  const onModalDismiss = async () => {
    if (pendingAction === "gallery") {
      setPendingAction(null);

      try {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.status !== "granted") {
          alert("갤러리 접근 권한이 필요합니다.");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setPreviewAsset({
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
          });
        }
      } catch (error) {
        console.error("Gallery Error:", error);
      }
    }
  };

  const handleDefaultProfile = () => {
    setShowActionSheet(false);
    setPhotoUri(DEFAULT_PROFILE_IMAGE_URL);
    setDraftProfileImageUri(DEFAULT_PROFILE_IMAGE_URL);
  };

  const handleCancelAction = () => {
    setShowActionSheet(false);
  };

  // 원형 크롭 프리뷰: 확정
  const handleCropConfirm = (croppedImage: CircleCropResult) => {
    setPhotoUri(croppedImage.uri);
    setDraftProfileImageUri(croppedImage.uri);
    setPreviewAsset(null);
  };

  const handleCropError = (error: unknown) => {
    console.error("Crop Error:", error);
    Alert.alert("사진 설정 실패", "사진을 다시 선택해주세요.");
  };

  // 원형 크롭 프리뷰: 취소
  const handleCropCancel = () => {
    setPreviewAsset(null);
  };

  const handleNext = () => {
    setDraftProfileImageUri(photoUri);
    router.push("/profile/welcome" as any);
  };

  // 원형 크롭 프리뷰 화면
  if (previewAsset) {
    return (
      <CircleImageCropper
        asset={previewAsset}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
        onError={handleCropError}
      />
    );
  }

  return (
    <ProfileStepLayout
      title="사진을 등록해주세요."
      subtitle="따뜻한 미소가 담긴 사진은 매칭에 큰 도움이 됩니다."
      step={2}
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
              <ProfilePlaceholder />
            )}
          </Pressable>
          {/* 카메라 뱃지 (원형 바깥) */}
          <Pressable style={styles.cameraBadge} onPress={handlePhotoPick}>
            <Ionicons name="camera" size={24} color="#FFFFFF" />
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

function ProfilePlaceholder() {
  return (
    <Svg
      width={PROFILE_IMAGE_SIZE}
      height={PROFILE_IMAGE_SIZE}
      viewBox="0 0 200 200"
    >
      <Circle cx="100" cy="100" r="100" fill="#DEE3E5" />
      <Circle cx="100" cy="81" r="30" fill="#F8FAFB" />
      <Path
        d="M36 178C46 136 70 124 100 124C130 124 154 136 164 178C147 192 125 200 100 200C75 200 53 192 36 178Z"
        fill="#F8FAFB"
      />
    </Svg>
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
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
  },
  photoCircle: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    backgroundColor: "#DEE3E5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#A6AFB6",
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

});
