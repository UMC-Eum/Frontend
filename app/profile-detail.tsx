import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";

const PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85&auto=format&fit=crop";

const profile = {
  name: "루시",
  age: 55,
  location: "서울시 서대문구",
  distance: "7km",
  intro:
    "안녕하세요.\n하루를 마무리하며 나누는 소소한 대화를 좋아합니다. 서두르지 않고, 편안하게 이야기할 수 있는 인연을 만나고 싶어요. 먼저 대화를 주도하는 편입니다! 친해져 지내봐요 ㅎㅎ",
  interests: ["헬스", "요리", "여행", "음악듣기"],
  preferences: ["귀여운", "다정한", "친절한", "가까이 사는", "솔직한", "친절한"],
};

const clubs = [
  { id: 1, title: "새벽 등산 동호회", meta: "서울시 서대문구 · 루씨" },
  { id: 2, title: "새벽 등산 동호회", meta: "서울시 서대문구 · 루씨" },
  { id: 3, title: "새벽 등산 동호회", meta: "서울시 서대문구 · 루씨" },
  { id: 4, title: "새벽 등산 동호회", meta: "서울시 서대문구 · 루씨" },
];

export default function ProfileDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleComingSoon = (message: string) => {
    Alert.alert(message);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 104 },
        ]}
      >
        {/* 프로필 대표 사진과 상단 액션 영역입니다. */}
        <ImageBackground
          source={{ uri: PROFILE_IMAGE }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={[styles.topActions, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => handleComingSoon("공유 기능은 준비 중입니다.")}
              >
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => setMenuVisible(true)}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroGradient} />

          <View style={styles.profileSummary}>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  {profile.name} {profile.age}
                </Text>
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={15} color="#FFFFFF" />
                <Text style={styles.locationText}>
                  {profile.location} · {profile.distance}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.likeButton}
              activeOpacity={0.82}
              onPress={() => setLiked((prev) => !prev)}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={28}
                color={liked ? "#FC3367" : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.pagination}>
            <View style={styles.activeDot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </ImageBackground>

        {/* 소개와 사용자 성향을 카드/칩 형태로 보여주는 본문입니다. */}
        <View style={styles.content}>
          <SectionTitle title="소개" />
          <View style={styles.introCard}>
            <Text style={styles.introText}>{profile.intro}</Text>
          </View>

          <SectionTitle title="저의 관심사에요." />
          <View style={styles.chipList}>
            {profile.interests.map((interest, index) => (
              <Chip
                key={interest}
                label={interest}
                variant={index === 0 ? "outlineActive" : "outline"}
                shape="rect"
                size="small"
                style={styles.profileChip}
                textStyle={styles.profileChipText}
              />
            ))}
          </View>

          <SectionTitle title="이런 사람이 좋아요." />
          <View style={styles.chipList}>
            {profile.preferences.map((preference, index) => (
              <Chip
                key={`${preference}-${index}`}
                label={preference}
                variant={index === 1 || index === 2 ? "outlineActive" : "outline"}
                shape="rect"
                size="small"
                style={styles.profileChip}
                textStyle={styles.profileChipText}
              />
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* 동호회 정보는 동일한 카드 패턴으로 재사용되도록 분리했습니다. */}
        <View style={styles.content}>
          <SectionTitle title="이런 동호회를 참여하고있어요" />
          {clubs.slice(0, 2).map((club) => (
            <ClubCard key={`joined-${club.id}`} club={club} />
          ))}

          <SectionTitle title="이런 동호회를 운영해요" />
          {clubs.slice(2).map((club) => (
            <ClubCard key={`owned-${club.id}`} club={club} />
          ))}
        </View>
      </ScrollView>

      {/* 스크롤 위치와 상관없이 하단에 붙어 있는 CTA입니다. */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => handleComingSoon("대화 기능은 준비 중입니다.")}
        >
          <Text style={styles.ctaText}>바로 대화하기</Text>
        </TouchableOpacity>
      </View>

      <ActionSheetModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onReport={() => {
          setMenuVisible(false);
          handleComingSoon("신고 기능은 준비 중입니다.");
        }}
        onBlock={() => {
          setMenuVisible(false);
          handleComingSoon("차단 기능은 준비 중입니다.");
        }}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ClubCard({
  club,
}: {
  club: {
    title: string;
    meta: string;
  };
}) {
  return (
    <View style={styles.clubCard}>
      <View style={styles.clubThumbnail} />
      <View style={styles.clubInfo}>
        <Text style={styles.clubTitle}>{club.title}</Text>
        <Text style={styles.clubMeta}>{club.meta}</Text>
        <View style={styles.memberRow}>
          <Ionicons name="person" size={14} color="#A6AFB6" />
          <Text style={styles.memberText}>6명 참석중 (6/15)</Text>
        </View>
      </View>
    </View>
  );
}

function ActionSheetModal({
  visible,
  onClose,
  onReport,
  onBlock,
}: {
  visible: boolean;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.actionSheet}>
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.75}
              onPress={onReport}
            >
              <Text style={styles.reportText}>신고하기</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.75}
              onPress={onBlock}
            >
              <Text style={styles.actionText}>차단하기</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.75}
            onPress={onClose}
          >
            <Text style={styles.actionText}>취소</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    backgroundColor: "#FFFFFF",
  },
  hero: {
    height: 430,
    justifyContent: "flex-end",
    backgroundColor: "#D9D9D9",
  },
  heroImage: {
    resizeMode: "cover",
  },
  topActions: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  profileSummary: {
    zIndex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 42,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(77, 73, 60, 0.82)",
  },
  pagination: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.48)",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#202020",
  },
  introCard: {
    minHeight: 108,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  introText: {
    fontSize: 13,
    lineHeight: 22,
    color: "#565E64",
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  profileChip: {
    minHeight: 28,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  profileChipText: {
    fontSize: 12,
  },
  divider: {
    height: 8,
    marginTop: 6,
    backgroundColor: "#F5F6F7",
  },
  clubCard: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E8EA",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  clubThumbnail: {
    width: 66,
    height: 66,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: "#D9D9D9",
  },
  clubInfo: {
    flex: 1,
  },
  clubTitle: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#202020",
  },
  clubMeta: {
    marginBottom: 9,
    fontSize: 11,
    fontWeight: "600",
    color: "#818B92",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  memberText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A6AFB6",
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F1F2",
  },
  ctaButton: {
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FC3367",
  },
  ctaText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingBottom: 32,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  actionSheet: {
    gap: 8,
  },
  actionGroup: {
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  actionItem: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDivider: {
    height: 1,
    backgroundColor: "#EEF0F2",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#202020",
  },
  reportText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FC3367",
  },
  cancelButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
});
