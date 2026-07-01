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
  const cropOffsetRef = useRef({ x: 0, y: 0 });
  const cropStartOffsetRef = useRef({ x: 0, y: 0 });

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
      imageLeft: (SCREEN_WIDTH - displayWidth) / 2,
      imageTop: (SCREEN_HEIGHT - displayHeight) / 2,
      circleLeft: (SCREEN_WIDTH - CROP_CIRCLE_SIZE) / 2,
      circleTop: CROP_CIRCLE_TOP,
    };
  }, [asset.height, asset.width]);

  const clampCropOffset = useCallback(
    (x: number, y: number) => {
      const circleRight = cropMetrics.circleLeft + CROP_CIRCLE_SIZE;
      const circleBottom = cropMetrics.circleTop + CROP_CIRCLE_SIZE;
      const minX =
        circleRight - cropMetrics.imageLeft - cropMetrics.displayWidth;
      const maxX = cropMetrics.circleLeft - cropMetrics.imageLeft;
      const minY =
        circleBottom - cropMetrics.imageTop - cropMetrics.displayHeight;
      const maxY = cropMetrics.circleTop - cropMetrics.imageTop;

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

  const handleConfirm = async () => {
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
        asset.uri,
        [
          {
            crop: {
              originX: Math.round(clamp(originX, 0, asset.width - cropSize)),
              originY: Math.round(clamp(originY, 0, asset.height - cropSize)),
              width: Math.round(Math.min(cropSize, asset.width)),
              height: Math.round(Math.min(cropSize, asset.height)),
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
