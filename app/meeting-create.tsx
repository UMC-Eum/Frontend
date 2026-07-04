import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import { KEYBOARD_AVOIDING_BEHAVIOR } from "@/constants/keyboard";
import {
  MEETING_COLORS,
  MeetingFieldSection,
  MeetingInput,
  MeetingJoinOption,
  MeetingMemberCounter,
  MeetingScreenHeader,
} from "@/components/meeting/MeetingCreateParts";
import {
  MeetingScheduleField,
  MeetingSchedulePicker,
} from "@/components/meeting/MeetingSchedulePicker";
import { useMeetingCreateForm } from "@/hooks/useMeetingCreateForm";

export default function MeetingCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clubId?: string }>();
  const clubId = Number(params.clubId);
  const form = useMeetingCreateForm(clubId);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={KEYBOARD_AVOIDING_BEHAVIOR}
      >
        <MeetingScreenHeader
          title="정기모임 만들기"
          onPressIcon={() => router.back()}
        />

        <ScrollView
          ref={form.scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <MeetingFieldSection
            label="모임 제목"
            onLayout={form.handleSectionLayout("title")}
          >
            <MeetingInput
              value={form.title}
              onChangeText={form.setTitle}
              placeholder="어떤 정기 모임인지 알려주세요."
              hasError={!!form.getFieldError("title")}
              errorMessage={form.getFieldError("title")}
            />
          </MeetingFieldSection>

          <MeetingFieldSection
            label="모임 소개"
            onLayout={form.handleSectionLayout("intro")}
          >
            <MeetingInput
              value={form.intro}
              onChangeText={form.setIntro}
              placeholder={
                "모임에 대해 소개해주세요.\n어떤 분들과 함께하고 싶은지, 무엇을 할 예정인지 적어주세요."
              }
              multiline
              maxLength={200}
              minHeight={117}
              showCounter
              hasError={!!form.getFieldError("intro")}
              errorMessage={form.getFieldError("intro")}
            />
          </MeetingFieldSection>

          <MeetingFieldSection
            label="일정"
            onLayout={form.handleSectionLayout("schedule")}
          >
            <MeetingScheduleField
              value={form.schedule}
              onPress={form.openSchedulePicker}
              hasError={!!form.getFieldError("schedule")}
              errorMessage={form.getFieldError("schedule")}
            />
          </MeetingFieldSection>

          <MeetingFieldSection
            label="위치"
            onLayout={form.handleSectionLayout("location")}
          >
            <MeetingInput
              value={form.location}
              onChangeText={form.setLocation}
              placeholder="예) 종로역 1번 출구 앞"
              hasError={!!form.getFieldError("location")}
              errorMessage={form.getFieldError("location")}
            />
          </MeetingFieldSection>

          <MeetingFieldSection label="최대인원">
            <MeetingMemberCounter
              value={form.maxMembers}
              onDecrease={form.decreaseMembers}
              onIncrease={form.increaseMembers}
            />
          </MeetingFieldSection>

          <MeetingFieldSection label="비용" optional>
            <MeetingInput
              value={form.cost}
              onChangeText={form.setCost}
              placeholder="예) 1인 10,000원"
            />
          </MeetingFieldSection>

          <MeetingFieldSection label="참여 조건">
            <View style={styles.optionRow}>
              <MeetingJoinOption
                title="자유 가입"
                description="누구나 바로 참여"
                selected={form.joinType === "free"}
                onPress={() => form.setJoinType("free")}
              />
              <MeetingJoinOption
                title="승인 필요"
                description="운영자 확인 후 참여"
                selected={form.joinType === "approval"}
                onPress={() => form.setJoinType("approval")}
              />
            </View>
          </MeetingFieldSection>
        </ScrollView>

        <View style={styles.bottomArea}>
          {form.validationWarning ? (
            <View style={styles.validationBanner}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={MEETING_COLORS.pink}
              />
              <Text style={styles.validationText}>{form.validationWarning}</Text>
            </View>
          ) : null}
          <Cta
            label={form.isSubmitting ? "생성 중..." : "정기모임 생성"}
            onPress={form.handleSubmit}
            disabled={form.isSubmitting}
            containerStyle={styles.ctaContainer}
            buttonStyle={styles.ctaButton}
            labelStyle={styles.ctaLabel}
          />
        </View>
      </KeyboardAvoidingView>

      <MeetingSchedulePicker
        visible={form.isSchedulePickerVisible}
        value={form.schedule}
        onConfirm={form.confirmSchedule}
        onClose={form.closeSchedulePicker}
      />
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
  scrollView: {
    flex: 1,
    backgroundColor: MEETING_COLORS.white,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
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
  ctaButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: MEETING_COLORS.pink,
  },
  ctaLabel: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
});
