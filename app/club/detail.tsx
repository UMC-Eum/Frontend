import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import ClubJoinRequestSheet from "@/components/club/ClubJoinRequestSheet";
import { CLUB_COLORS } from "@/components/club/ClubPostParts";

const CLUB_IMAGE =
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=85&w=1200&auto=format&fit=crop";

const CLUB = {
  title: "새벽 등산 동호회",
  location: "서울시 서대문구",
  category: "운동/스포츠",
  host: "루씨",
  memberText: "6명 참석중 (6/15)",
};

export default function ClubDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [isJoinSheetVisible, setJoinSheetVisible] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [hasRequested, setHasRequested] = useState(false);
  const isApprovalClub = params.mode === "approval";

  const handleSubmitJoinRequest = () => {
    if (joinMessage.trim().length === 0) return;

    setHasRequested(true);
    setJoinSheetVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={{ uri: CLUB_IMAGE }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroDim} />
          <View style={styles.header}>
            <Pressable style={styles.headerButton} onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="chevron-back" size={26} color={CLUB_COLORS.black} />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerButton} hitSlop={12}>
                <Ionicons name="share-outline" size={24} color={CLUB_COLORS.black} />
              </Pressable>
              <Pressable style={styles.headerButton} hitSlop={12}>
                <Ionicons name="ellipsis-vertical" size={23} color={CLUB_COLORS.black} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{CLUB.category}</Text>
          </View>
          <Text style={styles.title}>⛰️ {CLUB.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{CLUB.location}</Text>
            <Text style={styles.metaDivider}>·</Text>
            <Text style={styles.metaText}>{CLUB.host}</Text>
            <Text style={styles.metaDivider}>·</Text>
            <Ionicons name="person" size={18} color={CLUB_COLORS.gray700} />
            <Text style={styles.metaText}>{CLUB.memberText}</Text>
          </View>
        </View>

        <View style={styles.band} />

        <View style={styles.contentSection}>
          <Text style={styles.bodyText}>
            해 뜨기 전에 산에 올라 일출 보고 내려옵니다. 평일 새벽이라 부담 없이
            운동 삼아 나오시는 분들 많아요. 초보도 환영해요.
          </Text>

          <View style={styles.meetingCard}>
            <Text style={styles.sectionTitle}>정기모임</Text>
            <View style={styles.meetingBox}>
              <View style={styles.meetingHeader}>
                <View style={styles.smallPill}>
                  <Text style={styles.smallPillText}>매주</Text>
                </View>
                <Text style={styles.meetingTitle}>매주하는 새벽등산🔥</Text>
              </View>
              <InfoRow label="일시" value="매주 목요일 저녁 19시" />
              <InfoRow label="위치" value="종로역 1번 출구 앞" />
              <InfoRow label="비용" value="n만원" />
            </View>
          </View>
        </View>
      </ScrollView>

      <Cta
        label={hasRequested ? "가입 신청 완료" : "가입 신청"}
        disabled={hasRequested}
        onPress={() => setJoinSheetVisible(true)}
        buttonStyle={styles.ctaButton}
        labelStyle={styles.ctaLabel}
      />

      <ClubJoinRequestSheet
        visible={isJoinSheetVisible}
        club={CLUB}
        message={joinMessage}
        onChangeMessage={setJoinMessage}
        onClose={() => setJoinSheetVisible(false)}
        onSubmit={handleSubmitJoinRequest}
        isApprovalRequired={isApprovalClub}
      />
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CLUB_COLORS.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: CLUB_COLORS.white,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    height: 320,
    backgroundColor: "#D9D9D9",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  summarySection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 10,
  },
  categoryPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: CLUB_COLORS.gray150,
  },
  categoryText: {
    color: CLUB_COLORS.gray700,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  title: {
    color: CLUB_COLORS.black,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
  },
  metaRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  metaText: {
    color: CLUB_COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  metaDivider: {
    color: CLUB_COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
  },
  band: {
    height: 8,
    backgroundColor: CLUB_COLORS.gray100,
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 22,
  },
  bodyText: {
    color: CLUB_COLORS.black,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  meetingCard: {
    gap: 12,
  },
  sectionTitle: {
    color: CLUB_COLORS.black,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
  meetingBox: {
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: CLUB_COLORS.gray150,
    borderRadius: 14,
    backgroundColor: CLUB_COLORS.white,
  },
  meetingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: CLUB_COLORS.gray100,
  },
  smallPillText: {
    color: CLUB_COLORS.gray700,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  meetingTitle: {
    color: CLUB_COLORS.black,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    width: 32,
    color: CLUB_COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  infoValue: {
    flex: 1,
    color: CLUB_COLORS.black,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
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
