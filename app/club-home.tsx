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

import { Navbar } from "@/components/Navbar";
import ClubRow from "@/components/search/ClubRow";
import { CLUBS, RECOMMENDED_CLUBS } from "@/constants/search";

const MY_CLUBS = [
  {
    id: "my-club-1",
    title: "우리집 강아지 산책 동호회",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "my-club-2",
    title: "압백 등반 동호회",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80&auto=format&fit=crop",
  },
];

export default function ClubHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const localClubs = CLUBS.slice(0, 3);
  const todayClubs = RECOMMENDED_CLUBS.slice(0, 3);

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
          <Pressable style={styles.iconButton} hitSlop={10}>
            <Ionicons name="notifications-outline" size={22} color="#202020" />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
      </View>

      <View style={styles.topTabs}>
        <Text style={styles.inactiveTab}>홈</Text>
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
          <Pressable onPress={() => router.push("/club-create" as never)}>
            <Text style={styles.sectionLink}>동호회 만들기 | 전체보기</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.myClubList}
        >
          {MY_CLUBS.map((club) => (
            <MyClubCard key={club.id} title={club.title} image={club.image} />
          ))}
          <CreateClubCard onPress={() => router.push("/club-create" as never)} />
        </ScrollView>

        {/* 카테고리 아이콘 자리입니다. 아이콘 확정 전까지 동일한 크기의 플레이스홀더를 유지합니다. */}
        <View style={styles.categoryRow}>
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} style={styles.categoryPlaceholder} />
          ))}
        </View>

        <ClubSection
          title="루씨 님을 위한 동호회"
          accent="루씨"
          clubs={localClubs}
          showMore
        />

        <ClubSection
          title="오늘의 추천 동호회"
          icon="sparkles"
          clubs={todayClubs}
        />
      </ScrollView>

      <View style={styles.navbarWrap}>
        <Navbar
          tabs={[
            { id: "index", iconName: "home", label: "홈" },
            { id: "heart", iconName: "heart", label: "마음", hasDotBadge: true },
            { id: "chat", iconName: "chat", label: "대화", badgeCount: 100 },
            { id: "my", iconName: "person", label: "마이" },
          ]}
          activeTabId="index"
          onTabPress={(id) => router.push(`/(tabs)/${id}` as never)}
          activeColor="#1F2937"
          inactiveColor="#9CA3AF"
        />
      </View>
    </SafeAreaView>
  );
}

function MyClubCard({ title, image }: { title: string; image: string }) {
  return (
    <TouchableOpacity style={styles.myClubCard} activeOpacity={0.85}>
      <Image source={{ uri: image }} style={styles.myClubImage} contentFit="cover" />
      <Text style={styles.myClubTitle} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function CreateClubCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.createClubCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.createImageBox}>
        <Ionicons name="add" size={36} color="#A6AFB6" />
      </View>
      <Text style={styles.createClubText}>동호회 만들기</Text>
    </TouchableOpacity>
  );
}

function ClubSection({
  title,
  accent,
  icon,
  clubs,
  showMore = false,
}: {
  title: string;
  accent?: string;
  icon?: "sparkles";
  clubs: typeof CLUBS;
  showMore?: boolean;
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
          <ClubRow key={club.id} club={club} />
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
    fontSize: 18,
    fontWeight: "800",
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
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F4",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 18,
    backgroundColor: "#FFFFFF",
  },
  inactiveTab: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "600",
    paddingBottom: 12,
  },
  activeTabWrap: {
    alignItems: "center",
  },
  activeTab: {
    color: "#FC3367",
    fontSize: 13,
    fontWeight: "800",
    paddingBottom: 10,
  },
  activeUnderline: {
    width: 48,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FC3367",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 22,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#202020",
    fontSize: 17,
    fontWeight: "800",
  },
  sectionLink: {
    color: "#202020",
    fontSize: 12,
    fontWeight: "600",
  },
  myClubList: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 14,
  },
  myClubCard: {
    width: 86,
  },
  myClubImage: {
    width: 86,
    height: 86,
    borderRadius: 10,
    backgroundColor: "#D7D7D7",
  },
  myClubTitle: {
    color: "#202020",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8,
  },
  createClubCard: {
    width: 86,
    alignItems: "center",
  },
  createImageBox: {
    width: 86,
    height: 86,
    borderRadius: 10,
    backgroundColor: "#EEF1F3",
    alignItems: "center",
    justifyContent: "center",
  },
  createClubText: {
    color: "#202020",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 26,
  },
  categoryPlaceholder: {
    flex: 1,
    height: 56,
    backgroundColor: "#D7D7D7",
  },
  clubSection: {
    marginBottom: 26,
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
    fontSize: 17,
    fontWeight: "800",
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
    borderRadius: 9,
    backgroundColor: "#E9EEF1",
    alignItems: "center",
    justifyContent: "center",
  },
  moreButtonText: {
    color: "#A6AFB6",
    fontSize: 13,
    fontWeight: "800",
  },
  navbarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
