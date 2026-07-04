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
  Image as RNImage,
  Modal,
  PanResponder,
  Platform,
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
const DEFAULT_PROFILE_IMAGE_ASSET = require("@/assets/images/default-profile.png");
const DEFAULT_PROFILE_IMAGE_URI = RNImage.resolveAssetSource(
  DEFAULT_PROFILE_IMAGE_ASSET,
).uri;
const MIN_CROP_ZOOM = 1;
const MAX_CROP_ZOOM = 3;

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
  const cropScale = useRef(new Animated.Value(1)).current;
  const cropOffsetRef = useRef({ x: 0, y: 0 });
  const cropStartOffsetRef = useRef({ x: 0, y: 0 });
  const cropZoomRef = useRef(1);
  const cropStartZoomRef = useRef(1);
  const cropPinchDistanceRef = useRef<number | null>(null);

  const handlePhotoPick = () => {
    setShowActionSheet(true);
  };

  const [pendingAction, setPendingAction] = useState<"camera" | "gallery" | null>(
    null,
  );

  const handlePickFromGallery = () => {
    handleImageAction("gallery");
  };

  const handleTakePhoto = () => {
    handleImageAction("camera");
  };

  const handleImageAction = (action: "camera" | "gallery") => {
    setShowActionSheet(false);

    if (Platform.OS === "ios") {
      setPendingAction(action);
      return;
    }

    void runImageAction(action);
  };

  const onModalDismiss = async () => {
    const action = pendingAction;
    if (!action) return;

    setPendingAction(null);
    await runImageAction(action);
  };

  const runImageAction = async (action: "camera" | "gallery") => {
    try {
      const result =
        action === "gallery"
          ? await pickImageFromGallery()
          : await takePhotoWithCamera();

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
      console.error("Profile Image Pick Error:", error);
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("갤러리 접근 권한이 필요합니다.");
      throw new Error("Media library permission denied.");
    }

    return ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
  };

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("카메라 권한이 필요합니다.");
      throw new Error("Camera permission denied.");
    }

    return ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
    });
  };

  const handleDefaultProfile = () => {
    setShowActionSheet(false);
    setPhotoUri(DEFAULT_PROFILE_IMAGE_URI);
    setDraftProfileImageUri(DEFAULT_PROFILE_IMAGE_URI);
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

  const clampCropOffset = useCallback((x: number, y: number, zoom = cropZoomRef.current) => {
    if (!cropMetrics) return { x: 0, y: 0 };

    const circleRight = cropMetrics.circleLeft + CROP_CIRCLE_SIZE;
    const circleBottom = cropMetrics.circleTop + CROP_CIRCLE_SIZE;
    const scaledWidth = cropMetrics.displayWidth * zoom;
    const scaledHeight = cropMetrics.displayHeight * zoom;
    const scaleInsetX = (scaledWidth - cropMetrics.displayWidth) / 2;
    const scaleInsetY = (scaledHeight - cropMetrics.displayHeight) / 2;
    const minX = circleRight - cropMetrics.imageLeft - scaledWidth + scaleInsetX;
    const maxX = cropMetrics.circleLeft - cropMetrics.imageLeft + scaleInsetX;
    const minY = circleBottom - cropMetrics.imageTop - scaledHeight + scaleInsetY;
    const maxY = cropMetrics.circleTop - cropMetrics.imageTop + scaleInsetY;

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
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          cropStartOffsetRef.current = cropOffsetRef.current;
          cropStartZoomRef.current = cropZoomRef.current;
          cropPinchDistanceRef.current = getTouchDistance(
            event.nativeEvent.touches,
          );
        },
        onPanResponderMove: (_, gestureState) => {
          let nextZoom = cropZoomRef.current;
          const pinchDistance = getTouchDistance(_.nativeEvent.touches);

          if (pinchDistance && !cropPinchDistanceRef.current) {
            cropPinchDistanceRef.current = pinchDistance;
            cropStartZoomRef.current = cropZoomRef.current;
          }

          if (pinchDistance && cropPinchDistanceRef.current) {
            nextZoom = clamp(
              cropStartZoomRef.current *
                (pinchDistance / cropPinchDistanceRef.current),
              MIN_CROP_ZOOM,
              MAX_CROP_ZOOM,
            );
            cropZoomRef.current = nextZoom;
            cropScale.setValue(nextZoom);
          }

          const nextOffset = clampCropOffset(
            cropStartOffsetRef.current.x + gestureState.dx,
            cropStartOffsetRef.current.y + gestureState.dy,
            nextZoom,
          );

          cropOffsetRef.current = nextOffset;
          cropTranslate.setValue(nextOffset);
        },
        onPanResponderRelease: () => {
          const nextOffset = clampCropOffset(
            cropOffsetRef.current.x,
            cropOffsetRef.current.y,
            cropZoomRef.current,
          );

          cropOffsetRef.current = nextOffset;
          cropStartOffsetRef.current = nextOffset;
          cropStartZoomRef.current = cropZoomRef.current;
          cropPinchDistanceRef.current = null;
          cropTranslate.setValue(nextOffset);
        },
      }),
    [clampCropOffset, cropScale, cropTranslate],
  );

  const resetCropOffset = () => {
    const offset = { x: 0, y: 0 };
    cropOffsetRef.current = offset;
    cropStartOffsetRef.current = offset;
    cropZoomRef.current = 1;
    cropStartZoomRef.current = 1;
    cropPinchDistanceRef.current = null;
    cropTranslate.setValue(offset);
    cropScale.setValue(1);
  };

  // 원형 크롭 프리뷰: 확정
  const handleCropConfirm = async () => {
    if (!previewAsset || !cropMetrics) return;

    const cropOffset = cropOffsetRef.current;
    const cropZoom = cropZoomRef.current;
    const scaledWidth = cropMetrics.displayWidth * cropZoom;
    const scaledHeight = cropMetrics.displayHeight * cropZoom;
    const imageScreenLeft =
      cropMetrics.imageLeft + cropOffset.x - (scaledWidth - cropMetrics.displayWidth) / 2;
    const imageScreenTop =
      cropMetrics.imageTop + cropOffset.y - (scaledHeight - cropMetrics.displayHeight) / 2;
    const originX =
      (cropMetrics.circleLeft - imageScreenLeft) / (cropMetrics.imageScale * cropZoom);
    const originY =
      (cropMetrics.circleTop - imageScreenTop) / (cropMetrics.imageScale * cropZoom);
    const cropSize = CROP_CIRCLE_SIZE / (cropMetrics.imageScale * cropZoom);
    const roundedOriginX = Math.round(
      clamp(originX, 0, Math.max(previewAsset.width - cropSize, 0)),
    );
    const roundedOriginY = Math.round(
      clamp(originY, 0, Math.max(previewAsset.height - cropSize, 0)),
    );
    const roundedWidth = Math.round(
      Math.min(cropSize, previewAsset.width - roundedOriginX),
    );
    const roundedHeight = Math.round(
      Math.min(cropSize, previewAsset.height - roundedOriginY),
    );

    try {
      const croppedImage = await ImageManipulator.manipulateAsync(
        previewAsset.uri,
        [
          {
            crop: {
              originX: roundedOriginX,
              originY: roundedOriginY,
              width: roundedWidth,
              height: roundedHeight,
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
    setDraftProfileImageUri(photoUri ?? DEFAULT_PROFILE_IMAGE_URI);
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
                  { scale: cropScale },
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
      step={5}
      totalSteps={5}
      buttonEnabled
      onNext={handleNext}
    >
      <View style={styles.photoArea}>
        {/* 원형 + 뱃지를 감싸는 컨테이너 */}
        <View style={styles.photoContainer}>
          <Pressable style={styles.photoCircle} onPress={handlePhotoPick}>
            {photoUri && photoUri !== "default" ? (
              <Image
                source={getProfileImageSource(photoUri)}
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
                onPress={handleTakePhoto}
              >
                <Text style={styles.modalOptionText}>카메라로 촬영</Text>
              </Pressable>
              <View style={styles.modalDivider} />
              <Pressable
                style={({ pressed }) => [
                  styles.modalOption,
                  pressed && styles.modalOptionPressed,
                ]}
                onPress={handlePickFromGallery}
              >
                <Text style={styles.modalOptionText}>앨범에서 선택</Text>
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

function getTouchDistance(touches: { pageX: number; pageY: number }[]) {
  if (touches.length < 2) return null;

  const [first, second] = touches;
  const dx = first.pageX - second.pageX;
  const dy = first.pageY - second.pageY;

  return Math.hypot(dx, dy);
}

function getProfileImageSource(uri: string) {
  return uri === DEFAULT_PROFILE_IMAGE_URI
    ? DEFAULT_PROFILE_IMAGE_ASSET
    : { uri };
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
