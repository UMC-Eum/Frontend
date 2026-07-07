import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useCallback, useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Mask, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CROP_CIRCLE_SIZE = Math.min(SCREEN_WIDTH - 40, 372);
const CROP_CIRCLE_TOP = SCREEN_HEIGHT * 0.306;
const MAX_CROP_ZOOM = 3;

export type CircleCropAsset = {
  uri: string;
  width: number;
  height: number;
};

export type CircleCropResult = {
  uri: string;
  width: number;
  height: number;
};

type CircleImageCropperProps = {
  asset: CircleCropAsset;
  onCancel: () => void;
  onConfirm: (result: CircleCropResult) => void;
  onError?: (error: unknown) => void;
  cancelLabel?: string;
  confirmLabel?: string;
};

export default function CircleImageCropper({
  asset,
  onCancel,
  onConfirm,
  onError,
  cancelLabel = "취소",
  confirmLabel = "다음",
}: CircleImageCropperProps) {
  const insets = useSafeAreaInsets();
  const cropTranslate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const cropScale = useRef(new Animated.Value(1)).current;
  const cropOffsetRef = useRef({ x: 0, y: 0 });
  const cropStartOffsetRef = useRef({ x: 0, y: 0 });
  const cropZoomRef = useRef(1);
  const cropStartZoomRef = useRef(1);
  const cropPinchDistanceRef = useRef<number | null>(null);

  const cropMetrics = useMemo(() => {
    const imageScale = Math.max(
      SCREEN_WIDTH / asset.width,
      SCREEN_HEIGHT / asset.height,
    );
    const displayWidth = asset.width * imageScale;
    const displayHeight = asset.height * imageScale;

    return {
      imageScale,
      displayWidth,
      displayHeight,
      // 초기 배율(1)은 화면 전체 cover 기준이라, 크롭 원만 덮으면 되는 수준까지 축소를 허용한다.
      minZoom: CROP_CIRCLE_SIZE / Math.min(displayWidth, displayHeight),
      imageLeft: (SCREEN_WIDTH - displayWidth) / 2,
      imageTop: (SCREEN_HEIGHT - displayHeight) / 2,
      circleLeft: (SCREEN_WIDTH - CROP_CIRCLE_SIZE) / 2,
      circleTop: CROP_CIRCLE_TOP,
    };
  }, [asset.height, asset.width]);

  const clampCropOffset = useCallback(
    (x: number, y: number, zoom = cropZoomRef.current) => {
      const circleRight = cropMetrics.circleLeft + CROP_CIRCLE_SIZE;
      const circleBottom = cropMetrics.circleTop + CROP_CIRCLE_SIZE;
      const scaledWidth = cropMetrics.displayWidth * zoom;
      const scaledHeight = cropMetrics.displayHeight * zoom;
      const scaleInsetX = (scaledWidth - cropMetrics.displayWidth) / 2;
      const scaleInsetY = (scaledHeight - cropMetrics.displayHeight) / 2;
      const minX =
        circleRight - cropMetrics.imageLeft - scaledWidth + scaleInsetX;
      const maxX = cropMetrics.circleLeft - cropMetrics.imageLeft + scaleInsetX;
      const minY =
        circleBottom - cropMetrics.imageTop - scaledHeight + scaleInsetY;
      const maxY = cropMetrics.circleTop - cropMetrics.imageTop + scaleInsetY;

      return {
        x: clamp(x, minX, maxX),
        y: clamp(y, minY, maxY),
      };
    },
    [cropMetrics],
  );

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
        onPanResponderMove: (event, gestureState) => {
          let nextZoom = cropZoomRef.current;
          const pinchDistance = getTouchDistance(event.nativeEvent.touches);

          if (pinchDistance && !cropPinchDistanceRef.current) {
            cropPinchDistanceRef.current = pinchDistance;
            cropStartZoomRef.current = cropZoomRef.current;
          }

          if (pinchDistance && cropPinchDistanceRef.current) {
            nextZoom = clamp(
              cropStartZoomRef.current *
                (pinchDistance / cropPinchDistanceRef.current),
              cropMetrics.minZoom,
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
    [clampCropOffset, cropMetrics, cropScale, cropTranslate],
  );

  const handleConfirm = async () => {
    const cropOffset = cropOffsetRef.current;
    const cropZoom = cropZoomRef.current;
    const scaledWidth = cropMetrics.displayWidth * cropZoom;
    const scaledHeight = cropMetrics.displayHeight * cropZoom;
    const imageScreenLeft =
      cropMetrics.imageLeft +
      cropOffset.x -
      (scaledWidth - cropMetrics.displayWidth) / 2;
    const imageScreenTop =
      cropMetrics.imageTop +
      cropOffset.y -
      (scaledHeight - cropMetrics.displayHeight) / 2;
    const originX =
      (cropMetrics.circleLeft - imageScreenLeft) /
      (cropMetrics.imageScale * cropZoom);
    const originY =
      (cropMetrics.circleTop - imageScreenTop) /
      (cropMetrics.imageScale * cropZoom);
    const cropSize = CROP_CIRCLE_SIZE / (cropMetrics.imageScale * cropZoom);
    const roundedOriginX = Math.round(
      clamp(originX, 0, Math.max(asset.width - cropSize, 0)),
    );
    const roundedOriginY = Math.round(
      clamp(originY, 0, Math.max(asset.height - cropSize, 0)),
    );
    const roundedWidth = Math.round(
      Math.min(cropSize, asset.width - roundedOriginX),
    );
    const roundedHeight = Math.round(
      Math.min(cropSize, asset.height - roundedOriginY),
    );

    try {
      const croppedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
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

      onConfirm({
        uri: croppedImage.uri,
        width: croppedImage.width,
        height: croppedImage.height,
      });
    } catch (error) {
      if (onError) {
        onError(error);
        return;
      }

      Alert.alert("사진 설정 실패", "사진을 다시 선택해주세요.");
    }
  };

  return (
    <View style={styles.cropContainer}>
      <View style={styles.cropGestureArea} {...cropPanResponder.panHandlers}>
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
          <Image source={{ uri: asset.uri }} style={styles.cropImage} contentFit="cover" />
        </Animated.View>

        <CropOverlay />
      </View>

      <View style={[styles.cropHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={onCancel} hitSlop={12}>
          <Text style={styles.cropHeaderText}>{cancelLabel}</Text>
        </Pressable>
        <Pressable onPress={handleConfirm} hitSlop={12}>
          <Text style={styles.cropHeaderText}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
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

const styles = StyleSheet.create({
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
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
  },
});
