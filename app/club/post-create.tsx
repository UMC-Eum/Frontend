import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ClubCategoryChips,
  ClubHeader,
  ClubImagePreviewList,
  ClubMediaBar,
  CLUB_COLORS,
  RequiredLabel,
} from "@/components/club/ClubPostParts";
import { KEYBOARD_AVOIDING_BEHAVIOR } from "@/constants/keyboard";
import { createClubPost } from "@/api/clubs/clubPostsApi";
import { queryKeys } from "@/hooks/api/queryKeys";
import { useFastInputScroll } from "@/hooks/useFastInputScroll";
import { ClubPostCategory } from "@/types/api/clubs/clubPostsDTO";

const CATEGORY_OPTIONS: { label: string; value: ClubPostCategory }[] = [
  { label: "공지", value: "NOTICE" },
  { label: "가입인사", value: "GREETING" },
  { label: "후기", value: "REVIEW" },
  { label: "자유게시판", value: "FREE" },
];
const CATEGORY_LABELS = CATEGORY_OPTIONS.map((category) => category.label);
type InputField = "title" | "content";

/**
 * 동호회 게시글 작성 화면
 * - 카테고리, 제목, 내용, 사진 첨부 상태를 관리합니다.
 * - 공통 헤더/칩/미디어바/이미지 미리보기는 components/club에서 재사용합니다.
 */
export default function ClubPostCreateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ clubId?: string }>();
  const insets = useSafeAreaInsets();
  const inputScroll = useFastInputScroll();
  const inputOffsets = useRef<Record<InputField, number>>({
    title: 0,
    content: 0,
  });
  const [categoryLabel, setCategoryLabel] = useState(CATEGORY_OPTIONS[0].label);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const clubId = Number(params.clubId);
  const selectedCategory =
    CATEGORY_OPTIONS.find((category) => category.label === categoryLabel)?.value ??
    CATEGORY_OPTIONS[0].value;
  const canSubmit = useMemo(
    () => Number.isFinite(clubId) && content.trim().length > 0,
    [clubId, content],
  );
  const createPostMutation = useMutation({
    mutationFn: () => {
      const remoteImageUrls = images.filter((uri) => uri.startsWith("http"));

      return createClubPost(clubId, {
        category: selectedCategory,
        title: title.trim() || null,
        content: content.trim(),
        imageUrls: remoteImageUrls,
      });
    },
    onSuccess: ({ postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.posts() });
      router.replace({
        pathname: "/club/post-detail",
        params: { postId: String(postId) },
      } as never);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "게시글 등록 중 문제가 발생했습니다.";
      Alert.alert("등록 실패", message);
    },
  });

  const handleInputLayout =
    (field: InputField) =>
    (event: LayoutChangeEvent) => {
      inputOffsets.current[field] = event.nativeEvent.layout.y;
    };

  const scrollToInput = (field: InputField) => {
    inputScroll.scrollTo(inputOffsets.current[field] - 8);
  };

  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("앨범 권한 필요", "사진을 첨부하려면 앨범 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      selectionLimit: 4,
    });

    if (!result.canceled) {
      setImages(result.assets.slice(0, 4).map((asset) => asset.uri));
    }
  };

  const handleCameraMock = () => {
    Alert.alert("준비 중", "카메라 촬영 기능은 추후 연결 예정입니다.");
  };

  const handleRemoveImage = (index: number) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleSubmit = () => {
    if (!Number.isFinite(clubId)) {
      Alert.alert("동호회 정보 없음", "게시글을 작성할 동호회 정보를 찾을 수 없습니다.");
      return;
    }

    if (!canSubmit || createPostMutation.isPending) return;

    createPostMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={KEYBOARD_AVOIDING_BEHAVIOR}
      >
        <ClubHeader
          title="글쓰기"
          rightText="등록"
          rightTextDisabled={!canSubmit || createPostMutation.isPending}
          onBack={() => router.back()}
          onRightPress={handleSubmit}
        />

        <ScrollView
          ref={inputScroll.scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 112 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={inputScroll.scrollEventThrottle}
          onScroll={inputScroll.onScroll}
        >
          {/* 게시판 분류 선택 영역입니다. */}
          <View style={styles.categorySection}>
            <RequiredLabel label="카테고리" />
            <ClubCategoryChips
              categories={CATEGORY_LABELS}
              selected={categoryLabel}
              onSelect={setCategoryLabel}
            />
          </View>

          <View style={styles.dividerBand} />

          {/* 제목 입력 영역입니다. 제목은 선택값이므로 내용만 입력해도 등록할 수 있습니다. */}
          <View
            style={styles.titleFieldWrap}
            onLayout={handleInputLayout("title")}
          >
            <TextInput
              style={[styles.titleInput, !title && styles.titleInputEmpty]}
              placeholder="제목 (선택)"
              placeholderTextColor={CLUB_COLORS.gray500}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              onFocus={() => scrollToInput("title")}
            />
          </View>

          <View
            style={styles.contentSection}
            onLayout={handleInputLayout("content")}
          >
            <RequiredLabel label="내용" />
            <TextInput
              style={styles.contentInput}
              placeholder={"이 모임만의 이야기를 자유롭게 들려주세요.\n예) 등산 후기, 추천 코스, 함께할 분 모집 등"}
              placeholderTextColor={CLUB_COLORS.gray500}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              onFocus={() => scrollToInput("content")}
            />
          </View>

          <ClubImagePreviewList images={images} onRemove={handleRemoveImage} />
        </ScrollView>

        <ClubMediaBar
          bottomPadding={insets.bottom + 12}
          onGalleryPress={handlePickImages}
          onCameraPress={handleCameraMock}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CLUB_COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: CLUB_COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  categorySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: CLUB_COLORS.white,
  },
  dividerBand: {
    height: 8,
    backgroundColor: CLUB_COLORS.gray100,
  },
  titleFieldWrap: {
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: CLUB_COLORS.gray300,
  },
  titleInput: {
    minHeight: 58,
    paddingVertical: 16,
    color: CLUB_COLORS.black,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
  },
  titleInputEmpty: {
    fontWeight: "500",
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  contentInput: {
    minHeight: 340,
    paddingTop: 8,
    color: CLUB_COLORS.black,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
});
