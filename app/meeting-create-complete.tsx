import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import {
  MEETING_COLORS,
  MeetingScreenHeader,
  MeetingSummaryCard,
  ShareAction,
} from "@/components/meeting/MeetingCreateParts";

type CompleteParams = {
  clubId?: string;
  meetingId?: string;
  title?: string;
  dateText?: string;
  nextDateLabel?: string;
  ddayText?: string;
  location?: string;
  cost?: string;
};

export default function MeetingCreateCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<CompleteParams>();
  const clubId = getParamString(params.clubId);
  const meetingId = getParamString(params.meetingId);
  const title = getParamString(params.title) || "생성된 정기모임";
  const dateText = getParamString(params.dateText) || "일정 정보 없음";
  const nextDateLabel = getParamString(params.nextDateLabel);
  const ddayText = getParamString(params.ddayText) || "D-?";
  const location = getParamString(params.location) || "위치 정보 없음";
  const cost = getParamString(params.cost) || "없음";
  const canOpenMeeting = !!clubId && !!meetingId;
  const meetingUrl = Linking.createURL("/meeting-manage", {
    queryParams: { clubId, meetingId },
  });

  const handleShare = async () => {
    await Share.share({
      message: `${title}\n${dateText}${nextDateLabel ? ` · ${nextDateLabel}` : ""}\n${meetingUrl}`,
    });
  };

  const handleOpenMeeting = () => {
    if (!canOpenMeeting) {
      router.back();
      return;
    }

    router.replace({
      pathname: "/meeting-manage",
      params: { clubId, meetingId },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <MeetingScreenHeader icon="close" onPressIcon={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.heroBlock}>
          <View style={styles.successCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>정기모임이 생성되었어요!🎉</Text>
            <Text style={styles.subtitle}>
              이제 정기모임의 멤버를 모아볼까요?
            </Text>
          </View>
        </View>

        <MeetingSummaryCard
          title={title}
          dateText={dateText}
          location={location}
          cost={cost}
          ddayText={ddayText}
        />

        <View style={styles.shareBlock}>
          <View style={styles.shareTitleBlock}>
            <Text style={styles.shareTitle}>공유하고 멤버를 모아보세요</Text>
            <Text style={styles.shareSubtitle}>
              지인에게 링크를 공유하면 바로 가입할 수 있어요
            </Text>
          </View>
          <View style={styles.shareRow}>
            <ShareAction
              label="카카오톡"
              icon="chatbubble"
              variant="kakao"
              onPress={handleShare}
            />
            <ShareAction
              label="링크 복사"
              icon="copy"
              variant="copy"
              onPress={handleShare}
            />
            <ShareAction
              label="외부 공유"
              icon="share-outline"
              variant="share"
              onPress={handleShare}
            />
          </View>
        </View>
      </View>

      <Cta
        label="정기모임 바로가기"
        onPress={handleOpenMeeting}
        containerStyle={styles.ctaContainer}
        buttonStyle={styles.ctaButton}
        labelStyle={styles.ctaLabel}
      />
    </SafeAreaView>
  );
}

function getParamString(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MEETING_COLORS.white,
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
  successCheck: {
    color: MEETING_COLORS.white,
    fontSize: 54,
    fontWeight: "600",
    lineHeight: 60,
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
