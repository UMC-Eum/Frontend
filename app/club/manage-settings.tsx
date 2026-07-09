import { Ionicons } from "@expo/vector-icons";
import { Image } from "@/components/Image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import DeleteClubModal from "@/components/club/DeleteClubModal";
import { CLUB_CREATE_CATEGORIES } from "@/constants/club";
import { useClubDetailQuery } from "@/hooks/api/useClub";
import {
  useDeleteClubMutation,
  useUpdateClubMutation,
} from "@/hooks/api/useHost";
import type { ClubCategory } from "@/types/api/club/clubDTO";

const COLORS = {
  pink: "#FF3E70",
  pink50: "#FFF0F2",
  text: "#202020",
  gray700: "#636970",
  gray500: "#A6AFB6",
  gray300: "#DEE3E5",
  gray150: "#E9ECED",
  gray100: "#F8FAFB",
  white: "#FFFFFF",
};

const INTRO_MAX = 200;

function parseClubId(value?: string) {
  if (!value) return NaN;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : NaN;
}

export default function ClubManageSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ clubId?: string }>();
  const clubId = parseClubId(params.clubId);

  const detailQuery = useClubDetailQuery(clubId, Number.isFinite(clubId));
  const detail = detailQuery.data;
  const updateMutation = useUpdateClubMutation(clubId);
  const deleteMutation = useDeleteClubMutation();
  // 서버가 내려주는 커버 이미지 목록 필드가 없어 썸네일 1장만 초기값으로 사용한다.
  const [photos, setPhotos] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [category, setCategory] = useState<ClubCategory | null>(null);
  const [capacity, setCapacity] = useState(1);
  const [deleteVisible, setDeleteVisible] = useState(false);

  // 최대인원은 현재 가입 인원보다 낮게 설정할 수 없다.
  const minCapacity = Math.max(1, detail?.memberCount ?? 1);

  // 조회 데이터가 도착하면 폼 기본값을 채운다.
  useEffect(() => {
    if (!detail) return;
    setName(detail.name);
    setIntro(detail.introText ?? "");
    setCategory(detail.category);
    setCapacity(Math.max(detail.capacity, detail.memberCount, 1));
    setPhotos(detail.thumbnailUrl ? [detail.thumbnailUrl] : []);
  }, [detail]);

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!Number.isFinite(clubId)) return;

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      Alert.alert("동호회 이름", "동호회 이름을 입력해주세요.");
      return;
    }
    if (!category) {
      Alert.alert("카테고리", "카테고리를 선택해주세요.");
      return;
    }

    updateMutation.mutate(
      {
        name: trimmedName,
        introText: intro.trim(),
        category,
        capacity,
      },
      {
        onSuccess: () => {
          Alert.alert("저장 완료", "동호회 정보가 저장되었어요.");
          router.back();
        },
        onError: () => {
          Alert.alert("저장 실패", "잠시 후 다시 시도해주세요.");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!Number.isFinite(clubId)) return;

    deleteMutation.mutate(clubId, {
      onSuccess: () => {
        setDeleteVisible(false);
        router.back();
      },
      onError: () => {
        setDeleteVisible(false);
        Alert.alert("삭제 실패", "잠시 후 다시 시도해주세요.");
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable style={styles.headerIconButton} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>동호회 정보 수정</Text>
        <View style={styles.headerIconButton} />
      </View>

      {detailQuery.isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.pink} />
        </View>
      ) : detailQuery.isError || !detail ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>
            동호회 정보를 불러오지 못했어요.{"\n"}잠시 후 다시 시도해주세요.
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => detailQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cover}>
          {photos[0] ? (
            <Image source={{ uri: photos[0] }} style={styles.coverImage} contentFit="cover" />
          ) : null}
          <View style={styles.coverDim} />
          <View style={styles.coverCenter}>
            <Ionicons name="camera" size={36} color={COLORS.gray150} />
            <Text style={styles.coverText}>커버 사진{"\n"}(최대 5장까지 가능)</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {photos.map((photo, index) => (
            <View key={`${photo}-${index}`} style={styles.thumbWrap}>
              <Image source={{ uri: photo }} style={styles.thumb} contentFit="cover" />
              <Pressable
                style={styles.thumbRemove}
                onPress={() => removePhoto(index)}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.gray500} />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View style={styles.field}>
          <FieldLabel label="동호회 이름" />
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="동호회 이름"
              placeholderTextColor={COLORS.gray500}
            />
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel label="동호회 소개" />
          <View style={[styles.inputBox, styles.textAreaBox]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={intro}
              onChangeText={(value) => setIntro(value.slice(0, INTRO_MAX))}
              placeholder="동호회를 소개해주세요"
              placeholderTextColor={COLORS.gray500}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.counter}>
              {intro.length}/{INTRO_MAX}
            </Text>
          </View>
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <FieldLabel label="카테고리" />
            <Text style={styles.labelHint}>최소 1개 선택</Text>
          </View>
          <View style={styles.chipRow}>
            {CLUB_CREATE_CATEGORIES.map((item) => {
              const active = category === item.value;
              return (
                <Pressable
                  key={item.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(item.value)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel label="활동 지역" />
          <View style={styles.listItem}>
            <Text
              style={
                detail.areaName || detail.addressName
                  ? styles.listItemText
                  : styles.listItemPlaceholder
              }
            >
              {detail.areaName || detail.addressName || "지역 정보 없음"}
            </Text>
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel label="최대인원" />
          <View style={styles.stepperRow}>
            <View style={styles.stepperValueBox}>
              <Text style={styles.stepperValue}>{capacity}</Text>
              <Text style={styles.stepperUnit}>명</Text>
            </View>
            <View style={styles.stepperButtons}>
              <Pressable
                style={[styles.stepperButton, styles.stepperButtonLeft]}
                onPress={() =>
                  setCapacity((prev) => Math.max(minCapacity, prev - 1))
                }
              >
                <Ionicons name="remove" size={22} color={COLORS.gray700} />
              </Pressable>
              <Pressable
                style={[styles.stepperButton, styles.stepperButtonRight]}
                onPress={() => setCapacity((prev) => prev + 1)}
              >
                <Ionicons name="add" size={22} color={COLORS.gray700} />
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable style={styles.deleteRow} onPress={() => setDeleteVisible(true)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.pink} />
          <Text style={styles.deleteRowText}>동호회 삭제</Text>
        </Pressable>
      </ScrollView>

      <DeleteClubModal
        visible={deleteVisible}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[
            styles.saveButton,
            updateMutation.isPending && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </Pressable>
      </View>
        </>
      )}
    </SafeAreaView>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.requiredMark}>*</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 24, lineHeight: 30, fontWeight: "700", color: COLORS.text },
  scrollView: { flex: 1 },
  cover: { height: 240, backgroundColor: COLORS.gray150 },
  coverImage: { ...StyleSheet.absoluteFillObject },
  coverDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.2)" },
  coverCenter: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: 9 },
  coverText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: COLORS.gray150,
    textAlign: "center",
  },
  thumbRow: { paddingLeft: 20, paddingRight: 8, paddingTop: 22, paddingBottom: 6, gap: 18 },
  thumbWrap: { paddingTop: 8, paddingRight: 8 },
  thumb: { width: 82, height: 82, borderRadius: 7, backgroundColor: "#D9D9D9" },
  thumbRemove: { position: "absolute", top: 0, right: 0 },
  field: { paddingHorizontal: 20, paddingTop: 14 },
  fieldLabelRow: { flexDirection: "row", alignItems: "flex-start", gap: 1 },
  labelRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  labelHint: {
    marginBottom: 2,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.gray500,
  },
  fieldLabel: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.text },
  requiredMark: { fontSize: 12, lineHeight: 14, color: COLORS.pink },
  inputBox: {
    marginTop: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "rgba(222,227,229,0.4)",
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  textAreaBox: { minHeight: 96 },
  input: { fontSize: 18, lineHeight: 23, fontWeight: "500", color: COLORS.text, padding: 0 },
  textArea: { minHeight: 52 },
  counter: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.gray500,
    textAlign: "right",
  },
  chipRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { borderColor: COLORS.pink, backgroundColor: COLORS.pink50 },
  chipText: { fontSize: 14, lineHeight: 20, fontWeight: "500", color: COLORS.gray700 },
  chipTextActive: { color: COLORS.pink },
  listItem: {
    marginTop: 12,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.gray150,
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  listItemText: { fontSize: 16, lineHeight: 24, fontWeight: "500", color: COLORS.text },
  listItemPlaceholder: { fontSize: 16, lineHeight: 24, fontWeight: "500", color: COLORS.gray500 },
  stepperRow: { marginTop: 10, flexDirection: "row", gap: 12 },
  stepperValueBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray150,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepperValue: { fontSize: 20, lineHeight: 25, fontWeight: "600", color: COLORS.text },
  stepperUnit: { fontSize: 18, lineHeight: 23, fontWeight: "500", color: COLORS.text },
  stepperButtons: { flexDirection: "row" },
  stepperButton: {
    width: 44,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonLeft: { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  stepperButtonRight: { borderTopRightRadius: 10, borderBottomRightRadius: 10, marginLeft: -1 },
  deleteRow: {
    marginTop: 24,
    marginHorizontal: 20,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteRowText: { fontSize: 15, lineHeight: 21, fontWeight: "600", color: "#F03F40" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: COLORS.white,
  },
  saveButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.white },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    color: COLORS.gray700,
    textAlign: "center",
  },
  retryButton: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: { fontSize: 15, lineHeight: 21, fontWeight: "600", color: COLORS.pink },
});
