import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import { BackHandler, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import {
  MEETING_COLORS,
  MeetingScreenHeader,
  MeetingSummaryCard,
  ShareAction,
} from "@/components/meeting/MeetingCreateParts";
import { formatDday } from "@/components/meeting/meetingSchedule";

type CompleteParams = {
  clubId?: string;
  meetingId?: string;
  title?: string;
  dateText?: string;
  ddaySource?: string;
  location?: string;
  cost?: string;
};

export default function MeetingCreateCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<CompleteParams>();
  const clubId = getParamString(params.clubId);
  const meetingId = getParamString(params.meetingId);
  const title = getParamString(params.title);
  const dateText = getParamString(params.dateText);
  const ddaySource = getParamString(params.ddaySource);
  const ddayText = ddaySource ? formatDday(ddaySource) : "D-?";
  const location = getParamString(params.location);
  const cost = getParamString(params.cost);
  const canOpenMeeting = !!clubId && !!meetingId;
  const hasMeetingResponse = !!title && !!dateText && !!location;
  const meetingUrl = Linking.createURL("/meeting-manage", {
    queryParams: { clubId, meetingId },
  });

  const handleShare = async () => {
    if (!hasMeetingResponse) return;

    await Share.share({
      message: `${title}\n${dateText}\n${meetingUrl}`,
    });
  };

  const handleClose = useCallback(() => {
    if (!clubId) {
      router.back();
      return;
    }

    router.replace({
      pathname: "/club/detail",
      params: { clubId },
    } as never);
  }, [clubId, router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });

    return () => subscription.remove();
  }, [handleClose]);

  const handleOpenMeeting = () => {
    if (!canOpenMeeting) {
      handleClose();
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

      <MeetingScreenHeader icon="close" onPressIcon={handleClose} />

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

        {hasMeetingResponse ? (
          <>
            <MeetingSummaryCard
              title={title}
              dateText={dateText}
              location={location}
              cost={cost || "없음"}
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
          </>
        ) : (
          <View style={styles.responseEmpty}>
            <Text style={styles.responseEmptyText}>
              정기모임 정보를 불러오지 못했어요.
            </Text>
          </View>
        )}
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
  responseEmpty: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray150,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  responseEmptyText: {
    color: MEETING_COLORS.gray500,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    textAlign: "center",
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
