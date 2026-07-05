import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  InfiniteData,
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
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "@/components/KeyboardCompat";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ClubImageLightbox } from "@/components/club/ClubImageLightbox";
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
import { KEYBOARD_AVOIDING_BEHAVIOR } from "@/constants/keyboard";
import {
  createClubPostComment,
  deleteClubPost,
  getClubPostComments,
  getClubPostDetail,
  likeClubPost,
  unlikeClubPost,
} from "@/api/clubs/clubPostsApi";
import { queryKeys } from "@/hooks/api/queryKeys";
import type { IArticlesGetResponse } from "@/types/api/articles/articlesDTO";
import type {
  ClubPostCategory,
  IClubPostDetailResponse,
} from "@/types/api/clubs/clubPostsDTO";
import { uniqueBy } from "@/utils/array";

const CATEGORY_LABELS: Record<ClubPostCategory, string> = {
  NOTICE: "공지",
  CHECKIN: "가입인사",
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
  const params = useLocalSearchParams<{
    mode?: ClubActionSheetMode;
    postId?: string;
    clubId?: string;
  }>();
  const [isActionSheetVisible, setActionSheetVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const postId = Number(params.postId);
  const clubId = Number(params.clubId);
  const activeClubId = Number.isFinite(clubId) ? clubId : undefined;
  const hasPostId = Number.isFinite(postId) && activeClubId !== undefined;
  const postQuery = useQuery({
    queryKey: queryKeys.clubs.post(postId),
    queryFn: () => getClubPostDetail(activeClubId!, postId),
    enabled: hasPostId,
  });
  const commentsQuery = useInfiniteQuery({
    queryKey: queryKeys.clubs.comments(postId),
    queryFn: ({ pageParam }) =>
      getClubPostComments(activeClubId!, postId, { cursor: pageParam, limit: 20 }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: hasPostId,
  });
  const likeMutation = useMutation({
    mutationFn: (nextLiked: boolean) =>
      nextLiked
        ? likeClubPost(activeClubId!, postId)
        : unlikeClubPost(activeClubId!, postId),
    onMutate: async (nextLiked) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clubs.post(postId) });
      const previousPost = queryClient.getQueryData<IClubPostDetailResponse>(
        queryKeys.clubs.post(postId),
      );
      queryClient.setQueryData<IClubPostDetailResponse>(
        queryKeys.clubs.post(postId),
        (current) =>
          current
            ? {
                ...current,
                isLiked: nextLiked,
                likeCount: Math.max(0, current.likeCount + (nextLiked ? 1 : -1)),
              }
            : current,
      );
      return { previousPost };
    },
    onError: (_error, _nextLiked, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.clubs.post(postId), context.previousPost);
      }
      Alert.alert("좋아요 실패", "잠시 후 다시 시도해주세요.");
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IClubPostDetailResponse>(
        queryKeys.clubs.post(postId),
        (current) =>
          current
            ? { ...current, isLiked: data.isLiked, likeCount: data.likeCount }
            : current,
      );
      if (activeClubId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.articles.all(activeClubId),
        });
      }
    },
  });
  const createCommentMutation = useMutation({
    mutationFn: () =>
      createClubPostComment(activeClubId!, postId, {
        content: comment.trim(),
      }),
    onSuccess: () => {
      setComment("");
      Keyboard.dismiss();
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.comments(postId) });
    },
    onError: () => {
      Alert.alert("댓글 등록 실패", "댓글을 등록하는 중 문제가 발생했습니다.");
    },
  });
  const deletePostMutation = useMutation({
    mutationFn: () => deleteClubPost(activeClubId!, postId),
    onSuccess: () => {
      if (activeClubId) {
        removeDeletedArticleFromLists(queryClient, activeClubId, postId);
        queryClient.invalidateQueries({
          queryKey: queryKeys.articles.all(activeClubId),
        });
      }
      queryClient.removeQueries({ queryKey: queryKeys.clubs.post(postId) });
      router.back();
      Alert.alert("삭제 완료", "게시글이 삭제되었습니다.");
    },
    onError: () => {
      Alert.alert("삭제 실패", "게시글을 삭제하는 중 문제가 발생했습니다.");
    },
  });

  const post = postQuery.data;
  const comments = uniqueBy(
    commentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    (item) => item.commentId,
  );
  const actionSheetMode: ClubActionSheetMode =
    post?.isMine === true
      ? "owner"
      : "guest";

  const handleSendComment = () => {
    if (!hasPostId || comment.trim().length === 0 || createCommentMutation.isPending) {
      return;
    }

    createCommentMutation.mutate();
  };

  const handleToggleLike = () => {
    if (!post || likeMutation.isPending) return;

    likeMutation.mutate(!post.isLiked);
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
        behavior={KEYBOARD_AVOIDING_BEHAVIOR}
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
                {post.images.map((image, index) => (
                  <Pressable
                    key={image.imageId}
                    onPress={() => setLightboxIndex(index)}
                  >
                    <Image
                      source={{ uri: image.imageUrl }}
                      style={styles.postImage}
                      contentFit="cover"
                    />
                  </Pressable>
                ))}
              </View>

              <ClubReactionSummary
                likeCount={post.likeCount}
                commentCount={post.commentCount}
                isLiked={post.isLiked}
                onLikePress={handleToggleLike}
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

        <ClubImageLightbox
          visible={lightboxIndex !== null}
          images={
            post?.images.map((image) => ({
              id: image.imageId,
              imageUrl: image.imageUrl,
            })) ?? []
          }
          initialIndex={lightboxIndex ?? 0}
          onClose={() => setLightboxIndex(null)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function removeDeletedArticleFromLists(
  queryClient: ReturnType<typeof useQueryClient>,
  clubId: number,
  articleId: number,
) {
  queryClient.setQueriesData<InfiniteData<IArticlesGetResponse>>(
    {
      predicate: (query) => {
        const key = query.queryKey;
        return (
          Array.isArray(key) &&
          key[0] === "club" &&
          key[1] === "detail" &&
          key[2] === clubId &&
          key[3] === "articles" &&
          key[4] === "list"
        );
      },
    },
    (current) =>
      current
        ? {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              articles: page.articles.filter(
                (article) => article.articleId !== articleId,
              ),
            })),
          }
        : current,
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
