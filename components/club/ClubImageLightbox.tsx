import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CLUB_COLORS } from "./ClubPostParts";

// FlatList는 viewabilityConfig의 런타임 변경을 지원하지 않아 모듈 상수로 고정한다.
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };

export interface ClubLightboxImage {
  id: number | string;
  imageUrl: string;
}

/**
 * 동호회 사진 라이트박스(전체 화면 이미지 뷰어)입니다.
 * - 어두운 배경 위에 이미지를 원본 비율(contain)로 크게 보여줍니다.
 * - 좌우 스와이프로 이전/다음 사진을 넘기고, 닫기 버튼이나 이미지 탭으로 닫습니다.
 * - 사진첩 탭과 게시글 상세 본문 이미지에서 공용으로 사용합니다.
 */
export function ClubImageLightbox({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: {
  visible: boolean;
  images: ClubLightboxImage[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const startIndex = Math.min(Math.max(initialIndex, 0), images.length - 1);
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // 닫혀도 언마운트되지 않으므로 다시 열릴 때 카운터를 시작 인덱스로 동기화한다.
  useEffect(() => {
    if (visible) {
      setCurrentIndex(startIndex);
    }
  }, [visible, startIndex]);

  // 스와이프로 페이지가 바뀔 때 상단 카운터를 갱신합니다.
  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const nextIndex = viewableItems[0]?.index;
      if (typeof nextIndex === "number") {
        setCurrentIndex(nextIndex);
      }
    },
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: ClubLightboxImage }) => (
      <Pressable style={{ width, height }} onPress={onClose}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          contentFit="contain"
        />
      </Pressable>
    ),
    [width, height, onClose],
  );

  if (!visible || images.length === 0) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <FlatList
          data={images}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
        />

        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={28} color={CLUB_COLORS.white} />
          </Pressable>
          {images.length > 1 ? (
            <Text style={styles.counterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          ) : null}
          <View style={styles.closeButton} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  image: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    color: CLUB_COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },
});
