import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import {
  MEETING_COLORS,
  MeetingFieldSection,
  MeetingInput,
  MeetingJoinOption,
  MeetingJoinType,
  MeetingMemberCounter,
} from "@/components/meeting/MeetingCreateParts";

type RequiredMeetingField = "title" | "intro" | "dateText" | "location";

const REQUIRED_FIELD_MESSAGES: Record<RequiredMeetingField, string> = {
  title: "모임 제목을 입력해주세요.",
  intro: "모임 소개를 입력해주세요.",
  dateText: "정기모임 일시를 입력해주세요.",
  location: "정기모임 위치를 입력해주세요.",
};

export default function MeetingCreateScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<RequiredMeetingField, number>>({
    title: 0,
    intro: 0,
    dateText: 0,
    location: 0,
  });
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [dateText, setDateText] = useState("");
  const [location, setLocation] = useState("");
  const [cost, setCost] = useState("");
  const [maxMembers, setMaxMembers] = useState(15);
  const [joinType, setJoinType] = useState<MeetingJoinType>("free");
  const [submitted, setSubmitted] = useState(false);

  const requiredValues: Record<RequiredMeetingField, string> = {
    title,
    intro,
    dateText,
    location,
  };

  const getFieldError = (field: RequiredMeetingField) => {
    if (!submitted || requiredValues[field].trim().length > 0) {
      return "";
    }

    return REQUIRED_FIELD_MESSAGES[field];
  };

  const getFirstInvalidField = () =>
    (Object.keys(requiredValues) as RequiredMeetingField[]).find(
      (field) => requiredValues[field].trim().length === 0,
    );

  const firstInvalidField = submitted ? getFirstInvalidField() : undefined;
  const validationWarning = firstInvalidField
    ? REQUIRED_FIELD_MESSAGES[firstInvalidField]
    : "";

  const handleSectionLayout =
    (field: RequiredMeetingField) =>
    (event: { nativeEvent: { layout: { y: number } } }) => {
      sectionOffsets.current[field] = event.nativeEvent.layout.y;
    };

  const decreaseMembers = () => {
    setMaxMembers((current) => Math.max(2, current - 1));
  };

  const increaseMembers = () => {
    setMaxMembers((current) => Math.min(99, current + 1));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    const nextInvalidField = getFirstInvalidField();

    if (nextInvalidField) {
      scrollViewRef.current?.scrollTo({
        y: Math.max(sectionOffsets.current[nextInvalidField] - 8, 0),
        animated: true,
      });
      return;
    }

    router.push("/meeting-create-complete" as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={28} color={MEETING_COLORS.gray500} />
          </Pressable>
          <Text style={styles.headerTitle}>정기모임 만들기</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 정기모임 생성에 필요한 기본 입력값입니다. */}
          <MeetingFieldSection
            label="모임 제목"
            onLayout={handleSectionLayout("title")}
          >
            <MeetingInput
              value={title}
              onChangeText={setTitle}
              placeholder="어떤 정기 모임인지 알려주세요."
              hasError={!!getFieldError("title")}
              errorMessage={getFieldError("title")}
            />
          </MeetingFieldSection>

          <MeetingFieldSection
            label="모임 소개"
            onLayout={handleSectionLayout("intro")}
          >
            <MeetingInput
              value={intro}
              onChangeText={setIntro}
              placeholder={
                "모임에 대해 소개해주세요.\n어떤 분들과 함께하고 싶은지, 무엇을 할 예정인지 적어주세요."
              }
              multiline
              maxLength={200}
              minHeight={108}
              showCounter
              hasError={!!getFieldError("intro")}
              errorMessage={getFieldError("intro")}
            />
          </MeetingFieldSection>

          <MeetingFieldSection
            label="일시"
            icon="calendar-outline"
            onLayout={handleSectionLayout("dateText")}
          >
            <MeetingInput
              value={dateText}
              onChangeText={setDateText}
              placeholder="예) 매주 목요일 저녁 18시"
              hasError={!!getFieldError("dateText")}
              errorMessage={getFieldError("dateText")}
            />
          </MeetingFieldSection>

          <MeetingFieldSection
            label="위치"
            icon="location"
            onLayout={handleSectionLayout("location")}
          >
            <MeetingInput
              value={location}
              onChangeText={setLocation}
              placeholder="예) 종로역 1번 출구 앞"
              hasError={!!getFieldError("location")}
              errorMessage={getFieldError("location")}
            />
          </MeetingFieldSection>

          {/* 인원 조정 UI는 완료 카드와 분리해 폼 전용 상태로만 관리합니다. */}
          <MeetingFieldSection label="최대인원">
            <MeetingMemberCounter
              value={maxMembers}
              onDecrease={decreaseMembers}
              onIncrease={increaseMembers}
            />
          </MeetingFieldSection>

          <MeetingFieldSection label="비용" optional>
            <MeetingInput
              value={cost}
              onChangeText={setCost}
              placeholder="예) 1인 10,000원"
            />
          </MeetingFieldSection>

          <MeetingFieldSection label="참여 조건">
            <View style={styles.optionRow}>
              <MeetingJoinOption
                title="자유 가입"
                description="누구나 바로 참여"
                selected={joinType === "free"}
                onPress={() => setJoinType("free")}
              />
              <MeetingJoinOption
                title="승인 필요"
                description="운영자 확인 후 참여"
                selected={joinType === "approval"}
                onPress={() => setJoinType("approval")}
              />
            </View>
          </MeetingFieldSection>
        </ScrollView>

        <View style={styles.bottomArea}>
          {validationWarning ? (
            <View style={styles.validationBanner}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={MEETING_COLORS.pink}
              />
              <Text style={styles.validationText}>{validationWarning}</Text>
            </View>
          ) : null}
          <Cta
            label="정기모임 생성"
            onPress={handleSubmit}
            containerStyle={styles.ctaContainer}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MEETING_COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: 56,
    backgroundColor: MEETING_COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: MEETING_COLORS.text,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 30,
  },
  scrollView: {
    flex: 1,
    backgroundColor: MEETING_COLORS.white,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  bottomArea: {
    backgroundColor: MEETING_COLORS.white,
  },
  validationBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MEETING_COLORS.pink,
    backgroundColor: MEETING_COLORS.pink50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  validationText: {
    flex: 1,
    color: MEETING_COLORS.pink,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  ctaContainer: {
    paddingTop: 8,
  },
});
