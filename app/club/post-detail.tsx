import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import {
  createClubPostComment,
  deleteClubPost,
  getClubPostComments,
  getClubPostDetail,
} from "@/api/clubs/clubPostsApi";
import { queryKeys } from "@/hooks/api/queryKeys";
import { ClubPostCategory } from "@/types/api/clubs/clubPostsDTO";

const CATEGORY_LABELS: Record<ClubPostCategory, string> = {
  NOTICE: "공지",
  GREETING: "가입인사",
  REVIEW: "후기",
  FREE: "자유게시판",
};

/**
 * 동호회 게시글 상세 화면
 * - 게시글 본문, 반응, 댓글, 댓글 입력창을 조합합니다.
 * - 더보기 버튼을 누르면 내 글/타인 글 상태에 맞는 액션시트가 열립니다.
 */
export default function ClubPostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ mode?: ClubActionSheetMode; postId?: string }>();
  const [isActionSheetVisible, setActionSheetVisible] = useState(false);
  const [comment, setComment] = useState("");

  const postId = Number(params.postId);
  const hasPostId = Number.isFinite(postId);
  const postQuery = useQuery({
    queryKey: queryKeys.clubs.post(postId),
    queryFn: () => getClubPostDetail(postId),
    enabled: hasPostId,
  });
  const commentsQuery = useInfiniteQuery({
    queryKey: queryKeys.clubs.comments(postId),
    queryFn: ({ pageParam }) =>
      getClubPostComments(postId, { cursor: pageParam, size: 20 }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: hasPostId,
  });
  const createCommentMutation = useMutation({
    mutationFn: () =>
      createClubPostComment(postId, {
        content: comment.trim(),
      }),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.comments(postId) });
    },
    onError: () => {
      Alert.alert("댓글 등록 실패", "댓글을 등록하는 중 문제가 발생했습니다.");
    },
  });
  const deletePostMutation = useMutation({
    mutationFn: () => deleteClubPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.posts() });
      router.back();
    },
    onError: () => {
      Alert.alert("삭제 실패", "게시글을 삭제하는 중 문제가 발생했습니다.");
    },
  });

  const post = postQuery.data;
  const comments = commentsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const actionSheetMode: ClubActionSheetMode =
    post?.isMine === true
      ? "owner"
      : post?.isMine === false
        ? "guest"
        : params.mode === "guest"
          ? "guest"
          : "owner";

  const handleSendComment = () => {
    if (!hasPostId || comment.trim().length === 0 || createCommentMutation.isPending) {
      return;
    }

    createCommentMutation.mutate();
  };

  const handlePrimaryAction = () => {
    setActionSheetVisible(false);

    if (actionSheetMode === "owner") {
      Alert.alert("준비 중", "게시글 수정 화면은 추후 연결 예정입니다.");
      return;
    }

    Alert.alert("준비 중", "게시글 신고 API 명세 확인 후 연결 예정입니다.");
  };

  const handleSecondaryAction = () => {
    setActionSheetVisible(false);

    if (actionSheetMode === "owner") {
      Alert.alert("게시글 삭제", "게시글을 삭제하시겠어요?", [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => deletePostMutation.mutate(),
        },
      ]);
      return;
    }

    Alert.alert("준비 중", "사용자 차단 API 명세 확인 후 연결 예정입니다.");
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
            styles.scrollContentBottom,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {!hasPostId ? (
            <StatusMessage text="게시글 정보를 찾을 수 없습니다." />
          ) : postQuery.isLoading ? (
            <View style={styles.statusBox}>
              <ActivityIndicator color={CLUB_COLORS.pink} />
            </View>
          ) : postQuery.isError || !post ? (
            <StatusMessage text="게시글을 불러오지 못했습니다." />
          ) : (
            <>
              {/* 작성자와 게시글 메타 정보입니다. */}
              <ClubAuthorMeta
                name={post.author.nickname}
                time={formatRelativeTime(post.createdAt)}
                category={CATEGORY_LABELS[post.category]}
                avatarUri={post.author.profileImageUrl ?? undefined}
              />

              <View style={styles.postBody}>
                {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
                <Text style={styles.postContent}>{post.content}</Text>
                {post.images.map((image) => (
                  <Image
                    key={image.imageId}
                    source={{ uri: image.imageUrl }}
                    style={styles.postImage}
                    contentFit="cover"
                  />
                ))}
              </View>

              <ClubReactionSummary
                likeCount={post.likeCount}
                commentCount={post.commentCount}
              />

              <View style={styles.dividerBand} />

              {comments.map((item) => (
                <ClubCommentItem
                  key={item.commentId}
                  name={item.author.nickname}
                  time={formatRelativeTime(item.createdAt)}
                  text={item.content}
                  avatarUri={item.author.profileImageUrl ?? undefined}
                />
              ))}
              {comments.length === 0 ? (
                <StatusMessage text="아직 댓글이 없습니다." compact />
              ) : null}
              {commentsQuery.hasNextPage ? (
                <Pressable
                  style={styles.moreCommentsButton}
                  onPress={() => commentsQuery.fetchNextPage()}
                  disabled={commentsQuery.isFetchingNextPage}
                >
                  <Text style={styles.moreCommentsText}>
                    {commentsQuery.isFetchingNextPage ? "불러오는 중" : "댓글 더보기"}
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
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
          onPrimaryPress={handlePrimaryAction}
          onSecondaryPress={handleSecondaryAction}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StatusMessage({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <View style={[styles.statusBox, compact && styles.statusBoxCompact]}>
      <Text style={styles.statusText}>{text}</Text>
    </View>
  );
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) return value;

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
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
  scrollContentBottom: {
    paddingBottom: 16,
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
  statusBox: {
    minHeight: 160,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBoxCompact: {
    minHeight: 72,
  },
  statusText: {
    color: CLUB_COLORS.gray500,
    fontSize: 15,
    fontWeight: "500",
  },
  moreCommentsButton: {
    height: 44,
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: CLUB_COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  moreCommentsText: {
    color: CLUB_COLORS.gray700,
    fontSize: 14,
    fontWeight: "600",
  },
});
