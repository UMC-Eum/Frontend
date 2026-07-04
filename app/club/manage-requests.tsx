import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  pink: "#FF3E70",
  text: "#202020",
  gray700: "#636970",
  gray500: "#A6AFB6",
  gray150: "#E9ECED",
  gray100: "#F8FAFB",
  danger: "#F03F40",
  white: "#FFFFFF",
};

const INITIAL_REQUESTS = [
  {
    id: "1",
    name: "김택수",
    age: 54,
    area: "서울시 마포구",
    message: "새벽 산행을 꾸준히 해보고 싶어요. 잘 부탁드립니다.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "한미영",
    age: 51,
    area: "서울시 서대문구",
    message: "등산 초보지만 주말마다 함께 참여하고 싶습니다.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "오준호",
    age: 58,
    area: "서울시 동작구",
    message: "운동 겸 좋은 사람들과 만나고 싶어서 신청합니다.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
  },
];

export default function ClubManageRequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const removeRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Header title="가입 요청" onBack={() => router.back()} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.countHeader}>
          <Text style={styles.countTitle}>가입 요청</Text>
          <Text style={styles.countText}>{requests.length}개</Text>
        </View>

        <View style={styles.requestList}>
          {requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.profileRow}>
                <Image source={{ uri: request.image }} style={styles.avatar} contentFit="cover" />
                <View style={styles.profileInfo}>
                  <Text style={styles.nameText}>
                    {request.name} {request.age}
                  </Text>
                  <Text style={styles.areaText}>{request.area}</Text>
                </View>
              </View>
              <Text style={styles.messageText}>{request.message}</Text>
              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => removeRequest(request.id)}
                >
                  <Text style={styles.rejectText}>거절</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => removeRequest(request.id)}
                >
                  <Text style={styles.approveText}>승인</Text>
                </Pressable>
              </View>
            </View>
          ))}
          {requests.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-circle" size={34} color={COLORS.gray500} />
              <Text style={styles.emptyText}>처리할 가입 요청이 없어요</Text>
            </View>
          ) : null}
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
  headerTitle: { fontSize: 20, lineHeight: 26, fontWeight: "800", color: COLORS.text },
  scrollView: { flex: 1 },
  content: { paddingTop: 8 },
  countHeader: {
    height: 48,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countTitle: { fontSize: 20, lineHeight: 25, fontWeight: "700", color: COLORS.text },
  countText: { fontSize: 16, lineHeight: 22, fontWeight: "600", color: COLORS.pink },
  requestList: { marginTop: 8 },
  requestCard: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray150,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.gray150 },
  profileInfo: { flex: 1, marginLeft: 12 },
  nameText: { fontSize: 17, lineHeight: 23, fontWeight: "900", color: COLORS.text },
  areaText: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: COLORS.gray500,
  },
  messageText: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    color: COLORS.gray700,
  },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: { backgroundColor: COLORS.gray100 },
  approveButton: { backgroundColor: COLORS.pink },
  rejectText: { fontSize: 15, fontWeight: "800", color: COLORS.gray700 },
  approveText: { fontSize: 15, fontWeight: "800", color: COLORS.white },
  emptyBox: {
    minHeight: 160,
    marginHorizontal: 20,
    borderRadius: 14,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: COLORS.gray500,
  },
});
