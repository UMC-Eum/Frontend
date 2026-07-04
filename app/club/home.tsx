import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppNavbar } from "@/components/AppNavbar";
import ClubRow from "@/components/search/ClubRow";
import { CLUBS, RECOMMENDED_CLUBS } from "@/constants/search";
import type { ClubCategory } from "@/types/api/club/clubDTO";

const MY_CLUBS = [
  {
    id: "my-club-1",
    title: "우리집 강아지 산책 동호회",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80&auto=format&fit=crop",
    status: "가입 대기",
  },
  {
    id: "my-club-2",
    title: "압백 등반 동호회",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80&auto=format&fit=crop",
  },
];

const CATEGORIES = [
  {
    label: "운동, 스포츠",
    searchLabel: "운동 / 스포츠",
    value: "SPORTS",
    icon: "walk",
  },
  {
    label: "봉사활동",
    searchLabel: "봉사활동",
    value: "VOLUNTEER",
    icon: "heart",
  },
  {
    label: "자기개발",
    searchLabel: "자기개발",
    value: "STUDY",
    icon: "trending-up",
  },
  {
    label: "취미생활",
    searchLabel: "취미생활",
    value: "HOBBY",
    icon: "musical-notes",
  },
  {
    label: "사교",
    searchLabel: "사교",
    value: "OTHERS",
    icon: "people",
  },
] as const satisfies readonly {
  label: string;
  searchLabel: string;
  value: ClubCategory;
  icon: keyof typeof Ionicons.glyphMap;
}[];

export default function ClubHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const localClubs = CLUBS.slice(0, 3);
  const todayClubs = RECOMMENDED_CLUBS.slice(0, 3);
  const openClubDetail = (clubId: string) => {
    router.push({
      pathname: "/club/detail",
      params: { clubId: parseClubId(clubId) },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.locationButton} hitSlop={10}>
          <Ionicons name="location-sharp" size={21} color="#202020" />
          <Text style={styles.locationText}>동작구</Text>
          <Ionicons name="chevron-down" size={16} color="#202020" />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push("/search" as never)}
            hitSlop={10}
          >
            <Ionicons name="search" size={23} color="#202020" />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push("/notifications" as never)}
            hitSlop={10}
          >
            <Ionicons name="notifications-outline" size={22} color="#202020" />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
      </View>

      <View style={styles.topTabs}>
        <Pressable
          onPress={() => router.replace("/(tabs)" as never)}
          accessibilityRole="button"
          hitSlop={10}
        >
          <Text style={styles.inactiveTab}>홈</Text>
        </Pressable>
        <View style={styles.activeTabWrap}>
          <Text style={styles.activeTab}>동호회</Text>
          <View style={styles.activeUnderline} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 112 },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 동호회</Text>
          <Text style={styles.sectionLink}>전체보기</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.myClubList}
        >
          {MY_CLUBS.map((club) => (
            <MyClubCard
              key={club.id}
              title={club.title}
              image={club.image}
              status={club.status}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionDivider} />

        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>추천 카테고리</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((category) => (
              <CategoryButton
                key={category.label}
                label={category.label}
                icon={category.icon}
                onPress={() =>
                  router.push({
                    pathname: "/search",
                    params: {
                      category: category.value,
                      categoryLabel: category.searchLabel,
                    },
                  } as never)
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <ClubSection
          title="루씨 님을 위한 동호회"
          accent="루씨"
          clubs={localClubs}
          showMore
          onClubPress={openClubDetail}
        />

        <ClubSection
          title="오늘의 추천 동호회"
          icon="sparkles"
          clubs={todayClubs}
          onClubPress={openClubDetail}
        />
      </ScrollView>

      <Pressable
        style={[styles.createFab, { bottom: insets.bottom + 96 }]}
        onPress={() => router.push("/club/create" as never)}
        hitSlop={10}
      >
        <Ionicons name="add" size={38} color="#FFFFFF" />
      </Pressable>

      <View style={styles.navbarWrap}>
        <AppNavbar
          activeTabId="index"
          onTabPress={(id) => {
            if (id === "index") {
              router.replace("/(tabs)" as never);
              return;
            }

            router.replace(`/(tabs)/${id}` as never);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function parseClubId(value: string) {
  const match = value.match(/\d+/);
  return match?.[0] ?? value;
}

function MyClubCard({
  title,
  image,
  status,
}: {
  title: string;
  image: string;
  status?: string;
}) {
  return (
    <TouchableOpacity style={styles.myClubCard} activeOpacity={0.85}>
      <View style={styles.myClubImageWrap}>
        <Image source={{ uri: image }} style={styles.myClubImage} contentFit="cover" />
        {status ? (
          <>
            <View style={styles.myClubDim} />
            <Text style={styles.myClubStatus}>{status}</Text>
          </>
        ) : null}
      </View>
      <Text style={styles.myClubTitle} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function CategoryButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.categoryItem}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.categoryIconBox}>
        <Ionicons name={icon} size={28} color="#FC3367" />
      </View>
      <Text style={styles.categoryLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function ClubSection({
  title,
  accent,
  icon,
  clubs,
  showMore = false,
  onClubPress,
}: {
  title: string;
  accent?: string;
  icon?: "sparkles";
  clubs: typeof CLUBS;
  showMore?: boolean;
  onClubPress?: (clubId: string) => void;
}) {
  return (
    <View style={styles.clubSection}>
      <View style={styles.clubSectionTitleRow}>
        {icon ? <Ionicons name={icon} size={15} color="#FC3367" /> : null}
        <Text style={styles.clubSectionTitle}>
          {accent ? <Text style={styles.accentText}>{accent}</Text> : null}
          {accent ? title.replace(accent, "") : title}
        </Text>
      </View>

      <View style={styles.clubList}>
        {clubs.map((club) => (
          <ClubRow
            key={club.id}
            club={club}
            onPress={() => onClubPress?.(club.id)}
          />
        ))}
      </View>

      {showMore ? (
        <Pressable style={styles.moreButton}>
          <Text style={styles.moreButtonText}>더보기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationText: {
    color: "#202020",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  iconButton: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FC3367",
  },
  topTabs: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F4",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    backgroundColor: "#FFFFFF",
  },
  inactiveTab: {
    color: "#636970",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
    paddingBottom: 11,
  },
  activeTabWrap: {
    alignItems: "center",
  },
  activeTab: {
    color: "#FC3367",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
    paddingBottom: 11,
  },
  activeUnderline: {
    width: 51,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FC3367",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#202020",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
  },
  sectionLink: {
    color: "#A6AFB6",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  myClubList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  myClubCard: {
    width: 108,
  },
  myClubImageWrap: {
    width: 108,
    height: 108,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
  },
  myClubImage: {
    width: "100%",
    height: "100%",
  },
  myClubDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,2,2,0.6)",
  },
  myClubStatus: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 42,
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    textAlign: "center",
  },
  myClubTitle: {
    color: "#202020",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    marginTop: 4,
    textAlign: "center",
  },
  sectionDivider: {
    height: 8,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#F8FAFB",
  },
  categorySection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryItem: {
    alignItems: "center",
    gap: 4,
  },
  categoryIconBox: {
    width: 64,
    height: 64,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F8FAFB",
    backgroundColor: "#F7F7F8",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    color: "#202020",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  clubSection: {
    marginBottom: 32,
  },
  clubSectionTitleRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clubSectionTitle: {
    color: "#202020",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
  },
  accentText: {
    color: "#FC3367",
  },
  clubList: {
    gap: 4,
  },
  moreButton: {
    height: 42,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#E9EEF1",
    alignItems: "center",
    justifyContent: "center",
  },
  moreButtonText: {
    color: "#A6AFB6",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  createFab: {
    position: "absolute",
    right: 20,
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "#FFA0B4",
    backgroundColor: "#FC3367",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
    elevation: 8,
  },
  navbarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
