import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
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
  white: "#FFFFFF",
};

const MOCK_CLUB = {
  title: "새벽 등산 동호회⛰️",
  intro: "해뜨기전에 산에 올라 일출을 보는 모임이에요. 초보도 환영!",
  location: "서울시 서대문구",
  host: "루씨",
  image:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80&auto=format&fit=crop",
};

export default function ClubCreateCompleteScreen() {
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
          <Image source={{ uri: MOCK_CLUB.image }} style={styles.clubImage} contentFit="cover" />
          <View style={styles.clubInfo}>
            <View>
              <Text style={styles.clubTitle} numberOfLines={1}>
                {MOCK_CLUB.title}
              </Text>
              <Text style={styles.clubIntro} numberOfLines={2}>
                {MOCK_CLUB.intro}
              </Text>
            </View>
            <View style={styles.clubMetaRow}>
              <Text style={styles.clubMeta} numberOfLines={1}>
                {MOCK_CLUB.location}
              </Text>
              <Text style={styles.metaDot}> · </Text>
              <Text style={styles.clubMeta} numberOfLines={1}>
                {MOCK_CLUB.host}
              </Text>
            </View>
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
        label="동호회 바로가기"
        onPress={() => router.replace("/club/home" as never)}
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
  metaDot: {
    color: COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
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
