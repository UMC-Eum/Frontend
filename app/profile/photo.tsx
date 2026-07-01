import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Mask, Path, Rect } from "react-native-svg";

import ProfileStepLayout from "@/components/profile/ProfileStepLayout";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PROFILE_IMAGE_SIZE = 200;
const CROP_CIRCLE_SIZE = Math.min(SCREEN_WIDTH - 40, 372);
const CROP_CIRCLE_TOP = SCREEN_HEIGHT * 0.306;
const DEFAULT_PROFILE_IMAGE_URL =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=1200&auto=format&fit=crop";

type PreviewAsset = {
  uri: string;
  width: number;
  height: number;
};

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
  const [previewAsset, setPreviewAsset] = useState<PreviewAsset | null>(null);
  const cropTranslate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const cropOffsetRef = useRef({ x: 0, y: 0 });
  const cropStartOffsetRef = useRef({ x: 0, y: 0 });

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
          resetCropOffset();
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

  const cropMetrics = useMemo(() => {
    if (!previewAsset) return null;

    const imageScale = Math.max(
      SCREEN_WIDTH / previewAsset.width,
      SCREEN_HEIGHT / previewAsset.height,
    );
    const displayWidth = previewAsset.width * imageScale;
    const displayHeight = previewAsset.height * imageScale;

    return {
      imageScale,
      displayWidth,
      displayHeight,
      imageLeft: (SCREEN_WIDTH - displayWidth) / 2,
      imageTop: (SCREEN_HEIGHT - displayHeight) / 2,
      circleLeft: (SCREEN_WIDTH - CROP_CIRCLE_SIZE) / 2,
      circleTop: CROP_CIRCLE_TOP,
    };
  }, [previewAsset]);

  const clampCropOffset = useCallback((x: number, y: number) => {
    if (!cropMetrics) return { x: 0, y: 0 };

    const circleRight = cropMetrics.circleLeft + CROP_CIRCLE_SIZE;
    const circleBottom = cropMetrics.circleTop + CROP_CIRCLE_SIZE;
    const minX = circleRight - cropMetrics.imageLeft - cropMetrics.displayWidth;
    const maxX = cropMetrics.circleLeft - cropMetrics.imageLeft;
    const minY = circleBottom - cropMetrics.imageTop - cropMetrics.displayHeight;
    const maxY = cropMetrics.circleTop - cropMetrics.imageTop;

    return {
      x: clamp(x, minX, maxX),
      y: clamp(y, minY, maxY),
    };
  }, [cropMetrics]);

  const cropPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          cropStartOffsetRef.current = cropOffsetRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextOffset = clampCropOffset(
            cropStartOffsetRef.current.x + gestureState.dx,
            cropStartOffsetRef.current.y + gestureState.dy,
          );

          cropOffsetRef.current = nextOffset;
          cropTranslate.setValue(nextOffset);
        },
        onPanResponderRelease: () => {
          cropStartOffsetRef.current = cropOffsetRef.current;
        },
      }),
    [clampCropOffset, cropTranslate],
  );

  const resetCropOffset = () => {
    const offset = { x: 0, y: 0 };
    cropOffsetRef.current = offset;
    cropStartOffsetRef.current = offset;
    cropTranslate.setValue(offset);
  };

  // 원형 크롭 프리뷰: 확정
  const handleCropConfirm = async () => {
    if (!previewAsset || !cropMetrics) return;

    const cropOffset = cropOffsetRef.current;
    const imageScreenLeft = cropMetrics.imageLeft + cropOffset.x;
    const imageScreenTop = cropMetrics.imageTop + cropOffset.y;
    const originX =
      (cropMetrics.circleLeft - imageScreenLeft) / cropMetrics.imageScale;
    const originY =
      (cropMetrics.circleTop - imageScreenTop) / cropMetrics.imageScale;
    const cropSize = CROP_CIRCLE_SIZE / cropMetrics.imageScale;

    try {
      const croppedImage = await ImageManipulator.manipulateAsync(
        previewAsset.uri,
        [
          {
            crop: {
              originX: Math.round(
                clamp(originX, 0, previewAsset.width - cropSize),
              ),
              originY: Math.round(
                clamp(originY, 0, previewAsset.height - cropSize),
              ),
              width: Math.round(Math.min(cropSize, previewAsset.width)),
              height: Math.round(Math.min(cropSize, previewAsset.height)),
            },
          },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );

      setPhotoUri(croppedImage.uri);
      setDraftProfileImageUri(croppedImage.uri);
      setPreviewAsset(null);
      resetCropOffset();
    } catch (error) {
      console.error("Crop Error:", error);
      Alert.alert("사진 설정 실패", "사진을 다시 선택해주세요.");
    }
  };

  // 원형 크롭 프리뷰: 취소
  const handleCropCancel = () => {
    setPreviewAsset(null);
    resetCropOffset();
  };

  const handleNext = () => {
    setDraftProfileImageUri(photoUri);
    router.push("/profile/welcome" as any);
  };

  // 원형 크롭 프리뷰 화면
  if (previewAsset && cropMetrics) {
    return (
      <View style={styles.cropContainer}>
        <View style={styles.cropGestureArea} {...cropPanResponder.panHandlers}>
          {/* 풀스크린 이미지 */}
          <Animated.View
            style={[
              styles.cropImageFrame,
              {
                width: cropMetrics.displayWidth,
                height: cropMetrics.displayHeight,
                left: cropMetrics.imageLeft,
                top: cropMetrics.imageTop,
                transform: [
                  { translateX: cropTranslate.x },
                  { translateY: cropTranslate.y },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: previewAsset.uri }}
              style={styles.cropImage}
              contentFit="cover"
            />
          </Animated.View>

          <CropOverlay />
        </View>

        {/* 상단 헤더: 취소 / 다음 */}
        <View style={[styles.cropHeader, { paddingTop: insets.top }]}>
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

function CropOverlay() {
  const circleCenterX = SCREEN_WIDTH / 2;
  const circleCenterY = CROP_CIRCLE_TOP + CROP_CIRCLE_SIZE / 2;

  return (
    <Svg
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <Mask id="cropMask">
          <Rect width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="#FFFFFF" />
          <Circle
            cx={circleCenterX}
            cy={circleCenterY}
            r={CROP_CIRCLE_SIZE / 2}
            fill="#000000"
          />
        </Mask>
      </Defs>
      <Rect
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        fill="rgba(0, 0, 0, 0.55)"
        mask="url(#cropMask)"
      />
      <Circle
        cx={circleCenterX}
        cy={circleCenterY}
        r={CROP_CIRCLE_SIZE / 2}
        fill="transparent"
        stroke="#FFFFFF"
        strokeWidth={2}
      />
    </Svg>
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

  // === 원형 크롭 프리뷰 ===
  cropContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  cropGestureArea: {
    ...StyleSheet.absoluteFillObject,
  },
  cropImageFrame: {
    position: "absolute",
  },
  cropImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cropHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    elevation: 2,
    height: 88,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cropHeaderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 25,
  },
});
