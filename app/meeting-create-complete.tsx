import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import {
  MEETING_COLORS,
  MeetingSummaryCard,
  ShareAction,
} from "@/components/meeting/MeetingCreateParts";

const MOCK_MEETING = {
  title: "매주하는 새벽등산🔥",
  dateText: "매주 목요일 저녁 19시",
  location: "종로역 1번 출구 앞",
  cost: "n만원",
};

export default function MeetingCreateCompleteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={styles.closeButton}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="close" size={30} color={MEETING_COLORS.gray500} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.heroBlock}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={54} color={MEETING_COLORS.white} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>정기모임이 생성되었어요!🎉</Text>
            <Text style={styles.subtitle}>
              이제 정기모임의 멤버를 모아볼까요?
            </Text>
          </View>
        </View>

        {/* 생성 직후 공유할 핵심 모임 정보를 한 번 더 확인하는 카드입니다. */}
        <MeetingSummaryCard
          title={MOCK_MEETING.title}
          dateText={MOCK_MEETING.dateText}
          location={MOCK_MEETING.location}
          cost={MOCK_MEETING.cost}
        />

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
            <ShareAction
              label="외부 공유"
              icon="share-outline"
              variant="share"
            />
          </View>
        </View>
      </View>

      <Cta
        label="정기모임 바로가기"
        onPress={() => router.push("/club-home" as never)}
        containerStyle={styles.ctaContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MEETING_COLORS.white,
  },
  header: {
    height: 56,
    backgroundColor: MEETING_COLORS.white,
    justifyContent: "center",
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  heroBlock: {
    alignItems: "center",
    gap: 24,
  },
  successCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MEETING_COLORS.pink,
  },
  titleBlock: {
    width: "100%",
    alignItems: "center",
    gap: 4,
    marginBottom: 28,
  },
  title: {
    color: MEETING_COLORS.text,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 30,
    textAlign: "center",
  },
  subtitle: {
    color: MEETING_COLORS.gray500,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "center",
  },
  shareBlock: {
    marginTop: "auto",
    paddingBottom: 32,
    alignItems: "center",
    gap: 16,
  },
  shareTitleBlock: {
    alignItems: "center",
    gap: 4,
  },
  shareTitle: {
    color: MEETING_COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
    textAlign: "center",
  },
  shareSubtitle: {
    color: MEETING_COLORS.gray500,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "center",
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 42,
  },
  ctaContainer: {
    paddingTop: 12,
  },
});
