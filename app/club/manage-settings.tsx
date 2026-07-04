import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
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

const CATEGORIES = [
  "운동 / 스포츠",
  "취미 / 여가",
  "문화 / 예술",
  "봉사활동",
  "음식 / 맛집",
  "독서 / 공부",
  "기타",
];

const COVER_PHOTOS = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445307806294-bff7f67ff225?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400&auto=format&fit=crop",
];

const INTRO_MAX = 200;

export default function ClubManageSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState(COVER_PHOTOS);
  const [name, setName] = useState("새벽 등산 동호회");
  const [intro, setIntro] = useState(
    "해뜨기 전에 산에 올라 일출 보고 내려옵니다. 평일 새벽이라 부담없이 하시는 분들도 많아요 편하게 활동 가능합니다~ ",
  );
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [capacity, setCapacity] = useState(15);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [memberOnlyBoard, setMemberOnlyBoard] = useState(true);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    Alert.alert("저장 완료", "동호회 정보가 저장되었어요.");
  };

  const handleDelete = () => {
    setDeleteVisible(false);
    router.back();
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
            {CATEGORIES.map((item) => {
              const active = category === item;
              return (
                <Pressable
                  key={item}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(item)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel label="활동 지역" />
          <Pressable style={styles.listItem}>
            <Text style={styles.listItemText}>서울시 광진구</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.gray700} />
          </Pressable>
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
                onPress={() => setCapacity((prev) => Math.max(1, prev - 1))}
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

        <View style={styles.field}>
          <FieldLabel label="가입방식" />
          <View style={styles.selectCardRow}>
            <SelectCard
              title="자유 가입"
              description="누구나 바로 가입"
              active={!approvalRequired}
              onPress={() => setApprovalRequired(false)}
            />
            <SelectCard
              title="승인 필요"
              description="운영자 확인 후 가입"
              active={approvalRequired}
              onPress={() => setApprovalRequired(true)}
            />
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel label="게시판 공개 범위" />
          <View style={styles.selectCardRow}>
            <SelectCard
              title="전체 공개"
              description="누구나 게시판 열람"
              active={!memberOnlyBoard}
              onPress={() => setMemberOnlyBoard(false)}
            />
            <SelectCard
              title="회원 공개"
              description="가입 회원만 열람 가능"
              active={memberOnlyBoard}
              onPress={() => setMemberOnlyBoard(true)}
            />
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
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </Pressable>
      </View>
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

function SelectCard({
  title,
  description,
  active,
  onPress,
}: {
  title: string;
  description: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.selectCard, active && styles.selectCardActive]} onPress={onPress}>
      <Text style={[styles.selectCardTitle, active && styles.selectCardTitleActive]}>{title}</Text>
      <Text style={styles.selectCardDescription}>{description}</Text>
    </Pressable>
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
  selectCardRow: { marginTop: 10, flexDirection: "row", gap: 12 },
  selectCard: {
    flex: 1,
    height: 72,
    borderWidth: 1,
    borderColor: COLORS.gray150,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    padding: 12,
    gap: 2,
  },
  selectCardActive: { borderWidth: 2, borderColor: COLORS.pink, backgroundColor: COLORS.pink50 },
  selectCardTitle: { fontSize: 16, lineHeight: 24, fontWeight: "600", color: COLORS.text },
  selectCardTitleActive: { color: COLORS.pink, fontWeight: "700" },
  selectCardDescription: { fontSize: 14, lineHeight: 20, fontWeight: "500", color: COLORS.gray700 },
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
  saveButtonText: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.white },
});
