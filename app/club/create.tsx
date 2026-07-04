import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import DevBackHeader from "@/components/DevBackHeader";
import { Chip } from "@/components/Chip";
import TextBox from "@/components/TextBox";
import TxtBox from "@/components/txt-box";
import { useCreateClubMutation } from "@/hooks/api/useClub";
import type { ClubCategory } from "@/types/api/club/clubDTO";
import type { ApiFailResponse } from "@/types/api/api";

const categories: { label: string; value: ClubCategory }[] = [
  { label: "운동 / 스포츠", value: "SPORTS" },
  { label: "취미 / 여가", value: "HOBBY" },
  { label: "문화 / 예술", value: "CULTURE" },
  { label: "봉사활동", value: "SOCIAL" },
  { label: "음식 / 맛집", value: "SOCIAL" },
  { label: "독서 / 공부", value: "STUDY" },
  { label: "기타", value: "ETC" },
];

type JoinType = "free" | "approval";
type BoardScope = "all" | "member";

export default function ClubCreateScreen() {
  const router = useRouter();
  const createClubMutation = useCreateClubMutation();
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [region, setRegion] = useState("");
  const [maxMembers, setMaxMembers] = useState(15);
  const [joinType, setJoinType] = useState<JoinType>("free");
  const [boardScope, setBoardScope] = useState<BoardScope>("member");
  const [coverImageUris, setCoverImageUris] = useState<string[]>([]);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && intro.trim().length > 0 && !!category && !!region,
    [category, intro, name, region],
  );

  const handlePickCoverImages = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert("권한 필요", "커버 사진을 선택하려면 앨범 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
      });

      if (!result.canceled) {
        setCoverImageUris(result.assets.slice(0, 5).map((asset) => asset.uri));
      }
    } catch (error) {
      console.error("Cover Image Picker Error:", error);
      Alert.alert("사진 선택 실패", "사진을 불러오는 중 문제가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || createClubMutation.isPending) return;

    try {
      const createdClub = await createClubMutation.mutateAsync({
        name: name.trim(),
        category: category.value,
        introText: intro.trim(),
        capacity: maxMembers,
        keywordIds: [],
      });

      router.replace({
        pathname: "/club/detail",
        params: { clubId: String(createdClub.clubId) },
      } as never);
    } catch (error) {
      Alert.alert(
        "동호회 생성 실패",
        getApiErrorMessage(error) ??
          "동호회를 생성하지 못했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DevBackHeader title="동호회 만들기" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 커버 사진 업로드 진입 영역입니다. */}
        <Pressable
          style={styles.coverBox}
          onPress={handlePickCoverImages}
        >
          {coverImageUris[0] ? (
            <>
              <Image
                source={{ uri: coverImageUris[0] }}
                style={styles.coverImage}
                contentFit="cover"
              />
              <View style={styles.coverDim} />
              <View style={styles.coverEditBadge}>
                <Ionicons name="camera" size={17} color="#FFFFFF" />
                <Text style={styles.coverEditText}>
                  {coverImageUris.length}/5
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.cameraCircle}>
                <Ionicons name="camera" size={22} color="#9EA8AF" />
              </View>
              <Text style={styles.coverText}>커버 사진 추가</Text>
              <Text style={styles.coverSubText}>(최대 5장까지 가능)</Text>
            </>
          )}
        </Pressable>

        <FormSection>
          <RequiredLabel label="동호회 이름" />
          <TxtBox
            value={name}
            onChangeText={setName}
            placeholder="동호회 이름을 입력해주세요"
          />
        </FormSection>

        <FormSection>
          <RequiredLabel label="동호회 소개" />
          <TextBox
            value={intro}
            onChangeText={setIntro}
            placeholder={"동호회를 소개해주세요.\n(활동 내용, 분위기, 참여 방법 등)"}
            maxLength={200}
          />
        </FormSection>

        <FormSection>
          <View style={styles.labelRow}>
            <RequiredLabel label="카테고리" />
            <Text style={styles.hint}>최소 1개 선택</Text>
          </View>
          <View style={styles.chipList}>
            {categories.map((item) => (
              <Chip
                key={item.label}
                label={item.label}
                variant={category.label === item.label ? "outlineActive" : "outline"}
                size="small"
                onPress={() => setCategory(item)}
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              />
            ))}
          </View>
        </FormSection>

        <FormSection>
          <RequiredLabel label="활동 지역" />
          <Pressable
            style={styles.selectBox}
            onPress={() => setRegion("서울시 서대문구")}
          >
            <Text style={[styles.selectText, region && styles.selectTextActive]}>
              {region || "지역을 선택해주세요"}
            </Text>
            <Ionicons name="chevron-forward" size={22} color="#A6AFB6" />
          </Pressable>
        </FormSection>

        <FormSection>
          <RequiredLabel label="최대인원" required={false} />
          <View style={styles.counterBox}>
            <RoundIconButton
              icon="remove"
              disabled={maxMembers <= 2}
              onPress={() => setMaxMembers((prev) => Math.max(2, prev - 1))}
            />
            <View style={styles.memberCountRow}>
              <Text style={styles.memberCount}>{maxMembers}</Text>
              <Text style={styles.memberUnit}>명</Text>
            </View>
            <RoundIconButton
              icon="add"
              active
              onPress={() => setMaxMembers((prev) => Math.min(99, prev + 1))}
            />
          </View>
        </FormSection>

        <FormSection>
          <RequiredLabel label="가입 방식" required={false} />
          <View style={styles.optionRow}>
            <OptionCard
              title="자유 가입"
              description="누구나 바로 가입"
              selected={joinType === "free"}
              onPress={() => setJoinType("free")}
            />
            <OptionCard
              title="승인 필요"
              description="운영자 확인 후 가입"
              selected={joinType === "approval"}
              onPress={() => setJoinType("approval")}
            />
          </View>
        </FormSection>

        <FormSection>
          <RequiredLabel label="게시판 공개 범위" required={false} />
          <View style={styles.optionRow}>
            <OptionCard
              title="전체 공개"
              description="누구나 게시판 열람"
              selected={boardScope === "all"}
              onPress={() => setBoardScope("all")}
            />
            <OptionCard
              title="회원 공개"
              description="가입 회원만 열람 가능"
              selected={boardScope === "member"}
              onPress={() => setBoardScope("member")}
            />
          </View>
        </FormSection>
      </ScrollView>

      <Cta
        label={createClubMutation.isPending ? "생성 중..." : canSubmit ? "동호회 만들기" : "다음"}
        disabled={!canSubmit || createClubMutation.isPending}
        onPress={handleSubmit}
      />
    </SafeAreaView>
  );
}

function getApiErrorMessage(error: unknown) {
  const apiError = error as { response?: { data?: ApiFailResponse } };
  return apiError.response?.data?.error?.message;
}

function FormSection({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

function RequiredLabel({
  label,
  required = true,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

function RoundIconButton({
  icon,
  active,
  disabled,
  onPress,
}: {
  icon: "add" | "remove";
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.roundButton,
        active ? styles.roundButtonActive : styles.roundButtonMuted,
        disabled && styles.roundButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={24}
        color={active && !disabled ? "#FFFFFF" : "#7B858C"}
      />
    </Pressable>
  );
}

function OptionCard({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onPress}
    >
      <View style={styles.optionTitleRow}>
        <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
          {title}
        </Text>
        <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
          {selected ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
        </View>
      </View>
      <Text style={styles.optionDescription}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F8FAFB",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  coverBox: {
    height: 176,
    backgroundColor: "#EEF1F3",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  coverDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  coverEditBadge: {
    position: "absolute",
    right: 16,
    bottom: 14,
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    backgroundColor: "rgba(17, 24, 39, 0.72)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coverEditText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  coverText: {
    color: "#A6AFB6",
    fontSize: 14,
    fontWeight: "600",
  },
  coverSubText: {
    color: "#A6AFB6",
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 8,
    borderBottomColor: "#F8FAFB",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },
  required: {
    color: "#FC3367",
  },
  hint: {
    color: "#A6AFB6",
    fontSize: 12,
    marginBottom: 12,
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#FFFFFF",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  selectBox: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    color: "#A6AFB6",
    fontSize: 14,
    fontWeight: "500",
  },
  selectTextActive: {
    color: "#1F2937",
  },
  counterBox: {
    height: 62,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  roundButtonMuted: {
    backgroundColor: "#E9EEF1",
  },
  roundButtonActive: {
    backgroundColor: "#FC3367",
  },
  roundButtonDisabled: {
    opacity: 0.7,
  },
  memberCountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  memberCount: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
  },
  memberUnit: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "700",
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minHeight: 68,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  optionCardSelected: {
    borderColor: "#FC3367",
    backgroundColor: "#FFF1F4",
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  optionTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
  optionTitleSelected: {
    color: "#FC3367",
  },
  optionDescription: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkCircleSelected: {
    borderColor: "#FC3367",
    backgroundColor: "#FC3367",
  },
});
