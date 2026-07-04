import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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

export default function ClubMeetingCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [datetime, setDatetime] = useState("");
  const [place, setPlace] = useState("");
  const [capacity, setCapacity] = useState(15);
  const [cost, setCost] = useState("");
  const [approvalRequired, setApprovalRequired] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable style={styles.headerIconButton} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>정기모임 만들기</Text>
        <View style={styles.headerIconButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <FieldLabel label="모임 제목" />
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="어떤 정기 모임인지 알려주세요."
              placeholderTextColor={COLORS.gray500}
            />
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel label="모임 소개" />
          <View style={[styles.inputBox, styles.textAreaBox]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={intro}
              onChangeText={(value) => setIntro(value.slice(0, INTRO_MAX))}
              placeholder={
                "모임에 대해 소개해주세요.\n어떤 분들과 함께하고 싶은지, 무엇을 할 예정인지 적어주세요."
              }
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
          <FieldLabel label="일시" icon="calendar-outline" />
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={datetime}
              onChangeText={setDatetime}
              placeholder="예) 매주 목요일 저녁 18시"
              placeholderTextColor={COLORS.gray500}
            />
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel label="위치" icon="location-outline" />
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={place}
              onChangeText={setPlace}
              placeholder="예) 종로역 1번 출구 앞"
              placeholderTextColor={COLORS.gray500}
            />
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
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>비용</Text>
            <Text style={styles.optionalHint}>(선택)</Text>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={cost}
              onChangeText={setCost}
              placeholder="예) 1인 10,000원"
              placeholderTextColor={COLORS.gray500}
            />
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel label="참여 조건" />
          <View style={styles.selectCardRow}>
            <SelectCard
              title="자유 가입"
              description="누구나 바로 참여"
              active={!approvalRequired}
              onPress={() => setApprovalRequired(false)}
            />
            <SelectCard
              title="승인 필요"
              description="운영자 확인 후 참여"
              active={approvalRequired}
              onPress={() => setApprovalRequired(true)}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={styles.saveButton}
          onPress={() =>
            router.replace({
              pathname: "/club/meeting-create-complete",
              params: {
                title: title || undefined,
                datetime: datetime || undefined,
                place: place || undefined,
                cost: cost || undefined,
              },
            } as never)
          }
        >
          <Text style={styles.saveButtonText}>정기모임 생성</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function FieldLabel({
  label,
  icon,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.fieldLabelRow}>
      {icon ? <Ionicons name={icon} size={22} color={COLORS.text} /> : null}
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
  field: { paddingHorizontal: 20, paddingTop: 16 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  labelRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  optionalHint: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: COLORS.gray500,
  },
  fieldLabel: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.text },
  requiredMark: { fontSize: 12, lineHeight: 14, color: COLORS.pink, marginLeft: -2 },
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
