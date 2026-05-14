import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

const CATEGORIES = ["공지", "가입인사", "후기", "자유게시판"];

/**
 * 동호회 게시글 작성 화면
 * - 카테고리, 제목, 내용, 사진 첨부 상태를 관리합니다.
 * - 공통 헤더/칩/미디어바/이미지 미리보기는 components/club에서 재사용합니다.
 */
export default function ClubPostCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0,
    [content, title],
  );

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
    if (!canSubmit) return;

    router.push("/club/post-detail" as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ClubHeader
          title="글쓰기"
          rightText="등록"
          rightTextDisabled={!canSubmit}
          onBack={() => router.back()}
          onRightPress={handleSubmit}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 112 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 게시판 분류 선택 영역입니다. */}
          <View style={styles.categorySection}>
            <RequiredLabel label="카테고리" />
            <ClubCategoryChips
              categories={CATEGORIES}
              selected={category}
              onSelect={setCategory}
            />
          </View>

          <View style={styles.dividerBand} />

          {/* 제목 입력 영역입니다. 현재 등록 조건은 API 정책 확정 전 임시로 제목을 필수로 둡니다. */}
          <View style={styles.titleFieldWrap}>
            <TextInput
              style={[styles.titleInput, !title && styles.titleInputEmpty]}
              placeholder="제목 (선택)"
              placeholderTextColor={CLUB_COLORS.gray500}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </View>

          <View style={styles.contentSection}>
            <RequiredLabel label="내용" />
            <TextInput
              style={styles.contentInput}
              placeholder={"이 모임만의 이야기를 자유롭게 들려주세요.\n예) 등산 후기, 추천 코스, 함께할 분 모집 등"}
              placeholderTextColor={CLUB_COLORS.gray500}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
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
