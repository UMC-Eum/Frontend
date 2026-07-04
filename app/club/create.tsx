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
import { Chip } from "@/components/Chip";
import TextBox from "@/components/TextBox";
import { CLUB_CREATE_CATEGORIES } from "@/constants/club";
import { useCreateClubMutation } from "@/hooks/api/useClub";

const categories = CLUB_CREATE_CATEGORIES.map((item) => item.label);

type JoinType = "free" | "approval";
type BoardScope = "all" | "member";

export default function ClubCreateScreen() {
  const router = useRouter();
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

  const createClubMutation = useCreateClubMutation();

  const handleSubmit = () => {
    const categoryValue =
      CLUB_CREATE_CATEGORIES.find((item) => item.label === category)?.value ??
      "OTHERS";

    createClubMutation.mutate(
      {
        name: name.trim(),
        category: categoryValue,
        introText: intro.trim(),
        // ponytail: 음성/키워드 UI 없음 — 서버 필수값이라 빈 값 전송, 거부 시 백엔드 협의
        introVoice: "",
        capacity: maxMembers,
        keywordIds: [],
      },
      {
        onSuccess: (club) => {
          router.push({
            pathname: "/club/create-complete",
            params: {
              clubId: String(club.clubId),
              name: club.name,
              intro: intro.trim(),
              location: region,
              host: club.host?.nickname ?? "",
              image: coverImageUris[0] ?? "",
            },
          } as never);
        },
        onError: () => {
          Alert.alert("동호회 생성 실패", "잠시 후 다시 시도해주세요.");
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          style={styles.headerIconButton}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={26} color="#A6AFB6" />
        </Pressable>
        <Text style={styles.headerTitle}>동호회 만들기</Text>
        <View style={styles.headerIconButton} />
      </View>

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
                {/* ponytail: Figma MCP 미연결로 아이콘 크기 36 적용, 실제 값 다르면 수치만 조정 */}
                <Ionicons name="camera" size={36} color="#9EA8AF" />
              </View>
              <Text style={styles.coverText}>커버 사진 추가</Text>
              <Text style={styles.coverSubText}>(최대 5장까지 가능)</Text>
            </>
          )}
        </Pressable>

        <FormSection>
          <RequiredLabel label="동호회 이름" />
          <TextBox
            value={name}
            onChangeText={setName}
            placeholder="동호회 이름을 입력해주세요"
            multiline={false}
            inputBoxStyle={styles.nameInputBox}
            style={styles.nameInput}
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
                key={item}
                label={item}
                variant={category === item ? "outlineActive" : "outline"}
                size="small"
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryChip,
                  category === item ? styles.categoryChipActive : null,
                ]}
                textStyle={[
                  styles.categoryChipText,
                  category === item ? styles.categoryChipTextActive : null,
                ]}
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
          <RequiredLabel label="최대인원" />
          <View style={styles.counterBox}>
            <View style={styles.memberCountBox}>
              <Text style={styles.memberCount}>{maxMembers}</Text>
              <Text style={styles.memberUnit}>명</Text>
            </View>
            <View style={styles.stepperGroup}>
              <RoundIconButton
                icon="remove"
                disabled={maxMembers <= 2}
                onPress={() => setMaxMembers((prev) => Math.max(2, prev - 1))}
              />
              <View style={styles.stepperDivider} />
              <RoundIconButton
                icon="add"
                onPress={() => setMaxMembers((prev) => Math.min(99, prev + 1))}
              />
            </View>
          </View>
        </FormSection>

        <FormSection>
          <RequiredLabel label="가입 방식" />
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
          <RequiredLabel label="게시판 공개 범위" />
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
        label={canSubmit ? "동호회 만들기" : "다음"}
        disabled={!canSubmit || createClubMutation.isPending}
        onPress={handleSubmit}
        buttonStyle={styles.ctaButton}
        labelStyle={styles.ctaLabel}
      />
    </SafeAreaView>
  );
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
      <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
        {title}
      </Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    color: "#202020",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 112,
  },
  coverBox: {
    height: 240,
    backgroundColor: "#E9ECED",
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  coverText: {
    color: "#A6AFB6",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  coverSubText: {
    color: "#A6AFB6",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: "#202020",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    marginBottom: 12,
  },
  required: {
    color: "#FC3367",
  },
  hint: {
    color: "#A6AFB6",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    marginBottom: 12,
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    height: 32,
    borderRadius: 100,
    backgroundColor: "#F8FAFB",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryChipActive: {
    borderColor: "#FC3367",
    backgroundColor: "#FFF0F2",
  },
  categoryChipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#FC3367",
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
  nameInputBox: {
    height: 48,
    minHeight: 48,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: "center",
  },
  nameInput: {
    minHeight: 0,
  },
  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  memberCountBox: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E9ECED",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  roundButtonMuted: {
    backgroundColor: "#F8FAFB",
  },
  roundButtonActive: {
    backgroundColor: "#F8FAFB",
  },
  roundButtonDisabled: {
    opacity: 0.7,
  },
  stepperGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DEE3E5",
    borderRadius: 10,
    overflow: "hidden",
  },
  stepperDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#DEE3E5",
  },
  memberCount: {
    color: "#202020",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
  },
  memberUnit: {
    color: "#202020",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "500",
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECED",
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: "#FC3367",
    backgroundColor: "#FFF0F2",
  },
  optionTitle: {
    color: "#202020",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  optionTitleSelected: {
    color: "#FC3367",
  },
  optionDescription: {
    color: "#636970",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    marginTop: 2,
  },
  ctaButton: {
    height: 54,
    borderRadius: 14,
  },
  ctaLabel: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
});
