import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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

export default function MeetingCreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [dateText, setDateText] = useState("");
  const [location, setLocation] = useState("");
  const [cost, setCost] = useState("");
  const [maxMembers, setMaxMembers] = useState(15);
  const [joinType, setJoinType] = useState<MeetingJoinType>("free");

  const decreaseMembers = () => {
    setMaxMembers((current) => Math.max(2, current - 1));
  };

  const increaseMembers = () => {
    setMaxMembers((current) => Math.min(99, current + 1));
  };

  const handleSubmit = () => {
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
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 정기모임 생성에 필요한 기본 입력값입니다. */}
          <MeetingFieldSection label="모임 제목">
            <MeetingInput
              value={title}
              onChangeText={setTitle}
              placeholder="어떤 정기 모임인지 알려주세요."
            />
          </MeetingFieldSection>

          <MeetingFieldSection label="모임 소개">
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
            />
          </MeetingFieldSection>

          <MeetingFieldSection label="일시" icon="calendar-outline">
            <MeetingInput
              value={dateText}
              onChangeText={setDateText}
              placeholder="예) 매주 목요일 저녁 18시"
            />
          </MeetingFieldSection>

          <MeetingFieldSection label="위치" icon="location">
            <MeetingInput
              value={location}
              onChangeText={setLocation}
              placeholder="예) 종로역 1번 출구 앞"
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

        <Cta
          label="정기모임 생성"
          onPress={handleSubmit}
          containerStyle={styles.ctaContainer}
        />
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
  ctaContainer: {
    paddingTop: 12,
  },
});
