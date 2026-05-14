import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ClubActionSheetMode,
  ClubAuthorMeta,
  ClubCommentInputBar,
  ClubCommentItem,
  ClubHeader,
  ClubPostActionSheet,
  ClubReactionSummary,
  CLUB_COLORS,
} from "@/components/club/ClubPostParts";

const POST_IMAGE =
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=85&w=1200&auto=format&fit=crop";

/**
 * 동호회 게시글 상세 화면
 * - 게시글 본문, 반응, 댓글, 댓글 입력창을 조합합니다.
 * - 더보기 버튼을 누르면 내 글/타인 글 상태에 맞는 액션시트가 열립니다.
 */
export default function ClubPostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: ClubActionSheetMode }>();
  const [isActionSheetVisible, setActionSheetVisible] = useState(false);
  const [comment, setComment] = useState("");

  const actionSheetMode: ClubActionSheetMode = params.mode === "guest" ? "guest" : "owner";

  const handleSendComment = () => {
    if (comment.trim().length === 0) return;

    setComment("");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ClubHeader
          onBack={() => router.back()}
          style={styles.header}
          rightActions={
            <View style={styles.headerActions}>
              <Pressable style={styles.headerIconButton} hitSlop={12}>
                <Ionicons name="share-outline" size={24} color={CLUB_COLORS.black} />
              </Pressable>
              <Pressable
                style={styles.headerIconButton}
                onPress={() => setActionSheetVisible(true)}
                hitSlop={12}
              >
                <Ionicons name="ellipsis-vertical" size={23} color={CLUB_COLORS.black} />
              </Pressable>
            </View>
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 92 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 작성자와 게시글 메타 정보입니다. */}
          <ClubAuthorMeta name="등산하는 사람" time="30분전" category="공지" />

          <View style={styles.postBody}>
            <Text style={styles.postTitle}>오늘 새벽 등산 후기⛰️</Text>
            <Text style={styles.postContent}>
              오늘 아침 등반은 정말 상쾌했어요! 멋진 일출을 보니 힘든 일도
              잊혀지네요.ㅎㅎ{"\n\n"}
              새벽 5시에 출발해서 6시 30분쯤 정상에 도착했는데, 마침 해가
              떠오르는 시간이라 정말 환상적이었어요. 사진으로는 그 감동을 다
              담을 수 없을 정도였어요.{"\n\n"}
              다들 고생 많으셨고, 다음 주에 또 만나요! 다음에는 도시락도
              챙겨가요 🍱
            </Text>
            <Image source={{ uri: POST_IMAGE }} style={styles.postImage} contentFit="cover" />
          </View>

          <ClubReactionSummary likeCount={23} commentCount={1} />

          <View style={styles.dividerBand} />

          {/* 댓글 목록은 상세 화면 검증을 위한 목 데이터입니다. */}
          <ClubCommentItem
            name="새벽이슬"
            time="10분 전"
            text="와 일출 사진 진짜 멋져요!! 다음 산행 때 저도 꼭 같이 가고 싶어요 🥺"
          />
        </ScrollView>

        <ClubCommentInputBar
          value={comment}
          onChangeText={setComment}
          bottomPadding={insets.bottom + 12}
          onSend={handleSendComment}
        />

        <ClubPostActionSheet
          visible={isActionSheetVisible}
          mode={actionSheetMode}
          onClose={() => setActionSheetVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CLUB_COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingRight: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: CLUB_COLORS.white,
  },
  scrollContent: {
    paddingTop: 8,
  },
  postBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  postTitle: {
    color: CLUB_COLORS.black,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
  },
  postContent: {
    color: CLUB_COLORS.black,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  postImage: {
    width: "100%",
    height: 238,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
  },
  dividerBand: {
    height: 8,
    backgroundColor: CLUB_COLORS.gray100,
  },
});
