import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";

const COLORS = {
  pink: "#FF3E70",
  text: "#202020",
  gray700: "#636970",
  gray500: "#A6AFB6",
  gray300: "#DEE3E5",
  gray150: "#E9ECED",
  white: "#FFFFFF",
};

const MOCK_MEETING = {
  dday: "D-4",
  title: "매주하는 새벽등산🔥",
  datetime: "매주 목요일 저녁 19시",
  place: "종로역 1번 출구 앞",
  cost: "n만원",
};

export default function ClubMeetingCreateCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    dday?: string;
    title?: string;
    datetime?: string;
    place?: string;
    cost?: string;
  }>();
  const dday = firstParam(params.dday) || MOCK_MEETING.dday;
  const title = firstParam(params.title) || MOCK_MEETING.title;
  const datetime = firstParam(params.datetime) || MOCK_MEETING.datetime;
  const place = firstParam(params.place) || MOCK_MEETING.place;
  const cost = firstParam(params.cost) || MOCK_MEETING.cost;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={30} color={COLORS.gray500} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.heroBlock}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={54} color={COLORS.white} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>정기모임이 생성 되었어요!🎉</Text>
            <Text style={styles.subtitle}>이제 정기모임의 멤버를 모아볼까요?</Text>
          </View>
        </View>

        <View style={styles.meetingCard}>
          <View style={styles.meetingTitleRow}>
            <View style={styles.ddayChip}>
              <Text style={styles.ddayText}>{dday}</Text>
            </View>
            <Text style={styles.meetingTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View style={styles.meetingInfo}>
            <MeetingInfoRow label="일시" value={datetime} />
            <MeetingInfoRow label="위치" value={place} />
            <MeetingInfoRow label="비용" value={cost} />
          </View>
        </View>

        <View style={styles.shareBlock}>
          <View style={styles.shareTitleBlock}>
            <Text style={styles.shareTitle}>공유하고 멤버를 모아보세요</Text>
            <Text style={styles.shareSubtitle}>
              지인에게 링크를 공유하면 바로 가입할 수 있어요
            </Text>
          </View>
          <View style={styles.shareRow}>
            <ShareAction label="카카오톡" icon="chatbubble" variant="kakao" />
            <ShareAction label="링크 복사" icon="copy" variant="copy" />
            <ShareAction label="외부 공유" icon="share-outline" variant="share" />
          </View>
        </View>
      </View>

      <Cta
        label="정기모임 바로가기"
        onPress={() => router.back()}
        containerStyle={styles.ctaContainer}
        buttonStyle={styles.ctaButton}
        labelStyle={styles.ctaLabel}
      />
    </SafeAreaView>
  );
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function MeetingInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meetingInfoRow}>
      <Text style={styles.meetingInfoLabel}>{label}</Text>
      <Text style={styles.meetingInfoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ShareAction({
  label,
  icon,
  variant,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: "kakao" | "copy" | "share";
}) {
  return (
    <Pressable style={styles.shareAction}>
      <View style={[styles.shareIconCircle, styles[`${variant}Circle`]]}>
        <Ionicons
          name={icon}
          size={variant === "kakao" ? 30 : 28}
          color={variant === "kakao" ? "#000000" : COLORS.gray700}
        />
      </View>
      <Text style={styles.shareLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: { height: 56, backgroundColor: COLORS.white, justifyContent: "center" },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 28 },
  heroBlock: { alignItems: "center", gap: 24 },
  successCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.pink,
  },
  titleBlock: { width: "100%", alignItems: "center", gap: 4, marginBottom: 28 },
  title: {
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.gray500,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    textAlign: "center",
  },
  meetingCard: {
    borderWidth: 1,
    borderColor: COLORS.gray150,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  meetingTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  ddayChip: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 100,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  ddayText: { fontSize: 12, lineHeight: 20, fontWeight: "600", color: COLORS.white },
  meetingTitle: { flex: 1, fontSize: 20, lineHeight: 25, fontWeight: "600", color: COLORS.text },
  meetingInfo: { gap: 0 },
  meetingInfoRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 24 },
  meetingInfoLabel: { width: 40, fontSize: 16, lineHeight: 24, fontWeight: "500", color: COLORS.gray700 },
  meetingInfoValue: { flex: 1, fontSize: 16, lineHeight: 24, fontWeight: "500", color: COLORS.text },
  shareBlock: { marginTop: "auto", paddingBottom: 32, alignItems: "center", gap: 16 },
  shareTitleBlock: { alignItems: "center", gap: 4 },
  shareTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    textAlign: "center",
  },
  shareSubtitle: {
    color: COLORS.gray500,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  shareRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 42 },
  shareAction: { width: 64, alignItems: "center", gap: 4 },
  shareIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  kakaoCircle: { backgroundColor: "#FEE500" },
  copyCircle: { backgroundColor: "#E3E8EA" },
  shareCircle: { backgroundColor: COLORS.gray300 },
  shareLabel: {
    color: COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  ctaContainer: { paddingTop: 12 },
  ctaButton: { height: 54, borderRadius: 14 },
  ctaLabel: { fontSize: 18, lineHeight: 23, fontWeight: "600" },
});
