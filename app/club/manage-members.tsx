import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  pink: "#FF3E70",
  pink50: "#FFF0F2",
  pink400: "#FF6B8E",
  text: "#202020",
  gray700: "#636970",
  gray500: "#A6AFB6",
  gray300: "#DEE3E5",
  gray150: "#E9ECED",
  gray100: "#F8FAFB",
  white: "#FFFFFF",
};

type JoinRequest = {
  id: string;
  name: string;
  age: number;
  area: string;
  message: string;
  date: string;
  image: string;
};

type Member = {
  id: string;
  name: string;
  age: number;
  joinedAt: string;
  isOwner?: boolean;
  image: string;
};

const INITIAL_REQUESTS: JoinRequest[] = [
  {
    id: "1",
    name: "김철수",
    age: 65,
    area: "서울시 종로구",
    message: "산을 정말 좋아합니다. 새벽 공기마시며 건강하게 활동 하고싶어요!",
    date: "05.10 신청",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "29아나29",
    age: 70,
    area: "서울시 관악구",
    message: "안녕하세요 산을 좋아합니다!",
    date: "05.10 신청",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
  },
];

const INITIAL_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "루시",
    age: 58,
    joinedAt: "2026.05.10",
    isOwner: true,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "m2",
    name: "등산등산",
    age: 62,
    joinedAt: "2026.05.14",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "m3",
    name: "등산등산",
    age: 62,
    joinedAt: "2026.05.14",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "m4",
    name: "등산조아",
    age: 50,
    joinedAt: "2026.05.16",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
  },
];

export default function ClubManageMembersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);

  const handleRequest = (id: string, approve: boolean) => {
    setRequests((prev) => {
      const target = prev.find((request) => request.id === id);
      if (approve && target) {
        setMembers((current) => [
          ...current,
          {
            id: `m-${target.id}`,
            name: target.name,
            age: target.age,
            joinedAt: "2026.05.20",
            image: target.image,
          },
        ]);
      }
      return prev.filter((request) => request.id !== id);
    });
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header title="멤버 관리" onBack={() => router.back()} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {requests.length > 0 ? (
          <View style={styles.requestSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>가입신청</Text>
              <View style={styles.countChip}>
                <Text style={styles.countChipText}>{requests.length}</Text>
              </View>
            </View>

            <View style={styles.requestList}>
              {requests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.profileRow}>
                      <Image
                        source={{ uri: request.image }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                      <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                          {request.name} · {request.age}세
                        </Text>
                        <Text style={styles.profileArea}>{request.area}</Text>
                      </View>
                    </View>
                    <Text style={styles.requestDate}>{request.date}</Text>
                  </View>

                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{request.message}</Text>
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRequest(request.id, false)}
                    >
                      <Text style={styles.rejectText}>거절</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleRequest(request.id, true)}
                    >
                      <Text style={styles.approveText}>승인</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.dividerBand} />

        <View style={styles.memberTitleRow}>
          <Text style={styles.sectionTitle}>멤버 목록</Text>
        </View>

        <View style={styles.memberList}>
          {members.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.profileRow}>
                <Image
                  source={{ uri: member.image }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.memberInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.profileName}>
                      {member.name} · {member.age}세
                    </Text>
                    {member.isOwner ? (
                      <View style={styles.ownerChip}>
                        <Text style={styles.ownerChipText}>운영자</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.memberJoinedAt}>가입일 {member.joinedAt}</Text>
                </View>
              </View>
              {!member.isOwner ? (
                <Pressable style={styles.kickButton} onPress={() => removeMember(member.id)}>
                  <Text style={styles.kickText}>퇴장</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.headerIconButton} onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={28} color={COLORS.text} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerIconButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 24, lineHeight: 30, fontWeight: "700", color: COLORS.text },
  scrollView: { flex: 1 },
  requestSection: { paddingHorizontal: 20, paddingTop: 8 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sectionTitle: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.text },
  countChip: {
    height: 24,
    minWidth: 24,
    paddingHorizontal: 8,
    borderRadius: 100,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  countChipText: { fontSize: 14, lineHeight: 20, fontWeight: "600", color: COLORS.white },
  requestList: { marginTop: 16, gap: 12 },
  requestCard: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  requestHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.gray150 },
  profileInfo: { gap: 4 },
  profileName: { fontSize: 18, lineHeight: 23, fontWeight: "500", color: COLORS.text },
  profileArea: { fontSize: 14, lineHeight: 20, fontWeight: "500", color: COLORS.gray500 },
  requestDate: { fontSize: 14, lineHeight: 20, fontWeight: "500", color: COLORS.gray500 },
  messageBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "rgba(222,227,229,0.4)",
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  messageText: { fontSize: 18, lineHeight: 23, fontWeight: "500", color: COLORS.text },
  actionRow: { flexDirection: "row", gap: 12, height: 48 },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: { backgroundColor: COLORS.gray150 },
  approveButton: { backgroundColor: COLORS.pink },
  rejectText: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.gray700 },
  approveText: { fontSize: 18, lineHeight: 23, fontWeight: "600", color: COLORS.white },
  dividerBand: { height: 8, marginTop: 16, backgroundColor: COLORS.gray100 },
  memberTitleRow: { paddingHorizontal: 20, paddingTop: 11 },
  memberList: { marginTop: 11 },
  memberRow: {
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray150,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  memberInfo: { gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ownerChip: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.pink400,
    backgroundColor: COLORS.pink50,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerChipText: { fontSize: 12, lineHeight: 20, fontWeight: "500", color: COLORS.pink },
  memberJoinedAt: { fontSize: 14, lineHeight: 20, fontWeight: "500", color: COLORS.gray500 },
  kickButton: {
    width: 64,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.gray150,
    alignItems: "center",
    justifyContent: "center",
  },
  kickText: { fontSize: 16, lineHeight: 24, fontWeight: "500", color: COLORS.gray700 },
});
