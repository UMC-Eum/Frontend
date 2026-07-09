import { Ionicons } from "@expo/vector-icons";
import { Image } from "@/components/Image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import { shareClub } from "@/utils/shareLinks";

const COLORS = {
  pink: "#FF3E70",
  text: "#202020",
  gray700: "#636970",
  gray500: "#A6AFB6",
  gray300: "#DEE3E5",
  white: "#FFFFFF",
};

export default function ClubCreateCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    clubId?: string;
    name?: string;
    intro?: string;
    location?: string;
    host?: string;
    image?: string;
  }>();
  const clubId = Number(params.clubId);
  const metaText = [params.location, params.host].filter(Boolean).join(" · ");

  const handleShare = useCallback(
    () => shareClub(clubId, params.name),
    [clubId, params.name],
  );

  const handleClose = useCallback(() => {
    if (Number.isFinite(clubId)) {
      router.replace({
        pathname: "/club/detail",
        params: { clubId: String(clubId) },
      } as never);
      return;
    }

    router.replace("/(tabs)?tab=club" as never);
  }, [clubId, router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });

    return () => subscription.remove();
  }, [handleClose]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={12}
        >
          <Ionicons name="close" size={30} color={COLORS.gray500} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.heroBlock}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={54} color={COLORS.white} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>동호회가 생성 되었어요!🎉</Text>
            <Text style={styles.subtitle}>이제 동호회 멤버를 모아볼까요?</Text>
          </View>
        </View>

        <View style={styles.clubCard}>
          {params.image ? (
            <Image
              source={{ uri: params.image }}
              style={styles.clubImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.clubImage} />
          )}
          <View style={styles.clubInfo}>
            <View>
              <Text style={styles.clubTitle} numberOfLines={1}>
                {params.name ?? ""}
              </Text>
              <Text style={styles.clubIntro} numberOfLines={2}>
                {params.intro ?? ""}
              </Text>
            </View>
            {metaText ? (
              <View style={styles.clubMetaRow}>
                <Text style={styles.clubMeta} numberOfLines={1}>
                  {metaText}
                </Text>
              </View>
            ) : null}
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
        label="동호회 바로가기"
        onPress={handleClose}
        containerStyle={styles.ctaContainer}
        buttonStyle={styles.ctaButton}
        labelStyle={styles.ctaLabel}
      />
    </SafeAreaView>
  );
}

function ShareAction({
  label,
  icon,
  variant,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: "kakao" | "copy" | "share";
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.shareAction} onPress={onPress}>
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    height: 56,
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.pink,
  },
  titleBlock: {
    width: "100%",
    alignItems: "center",
    gap: 4,
    marginBottom: 28,
  },
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
  clubCard: {
    minHeight: 132,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  clubImage: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: "#D9D9D9",
  },
  clubInfo: {
    flex: 1,
    minHeight: 100,
    justifyContent: "space-between",
  },
  clubTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
  clubIntro: {
    color: COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    marginTop: 2,
  },
  clubMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clubMeta: {
    color: COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
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
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 42,
  },
  shareAction: {
    width: 64,
    alignItems: "center",
    gap: 4,
  },
  shareIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  kakaoCircle: {
    backgroundColor: "#FEE500",
  },
  copyCircle: {
    backgroundColor: "#E3E8EA",
  },
  shareCircle: {
    backgroundColor: COLORS.gray300,
  },
  shareLabel: {
    color: COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  ctaContainer: {
    paddingTop: 12,
  },
  ctaButton: {
    height: 54,
    borderRadius: 14,
  },
  ctaLabel: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
});
