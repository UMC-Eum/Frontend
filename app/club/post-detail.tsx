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
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  deleteClubPostComment,
  deleteClubPost,
  getClubPostComments,
  getClubPostDetail,
  likeClubPost,
  toggleClubPostPin,
  unlikeClubPost,
} from "@/api/clubs/clubPostsApi";
import { queryKeys } from "@/hooks/api/queryKeys";
import type { IArticlesGetResponse } from "@/types/api/articles/articlesDTO";
import type {
  ClubPostCategory,
  IClubPostDetailResponse,
} from "@/types/api/clubs/clubPostsDTO";
import { uniqueBy } from "@/utils/array";
import { sharePost } from "@/utils/shareLinks";

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
    canPin?: string;
  }>();
  const [isActionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<{
    commentId: number;
    isMine?: boolean;
  } | null>(null);
  const [replyTarget, setReplyTarget] = useState<{
    commentId: number;
    nickname: string;
  } | null>(null);
  const [comment, setComment] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const commentInputRef = useRef<TextInput>(null);

  const postId = Number(params.postId);
  const clubId = Number(params.clubId);
  const activeClubId = Number.isFinite(clubId) ? clubId : undefined;
  const hasPostId = Number.isFinite(postId) && activeClubId !== undefined;
  const canPinPost = params.canPin === "true";
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
    onError: (error, _nextLiked, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.clubs.post(postId), context.previousPost);
      }
      Alert.alert(
        "좋아요 실패",
        getApiErrorStatus(error) === 403
          ? "클럽 회원만 이용할 수 있는 기능이에요"
          : "잠시 후 다시 시도해주세요.",
      );
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
  const pinMutation = useMutation({
    mutationFn: (nextPinned: boolean) =>
      toggleClubPostPin(activeClubId!, postId, nextPinned),
    onMutate: async (nextPinned) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clubs.post(postId) });
      const previousPost = queryClient.getQueryData<IClubPostDetailResponse>(
        queryKeys.clubs.post(postId),
      );
      queryClient.setQueryData<IClubPostDetailResponse>(
        queryKeys.clubs.post(postId),
        (current) => (current ? { ...current, isPinned: nextPinned } : current),
      );
      return { previousPost };
    },
    onError: (_error, _nextPinned, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.clubs.post(postId), context.previousPost);
      }
      Alert.alert("고정 실패", "게시글 고정 상태를 바꾸지 못했습니다.");
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IClubPostDetailResponse>(
        queryKeys.clubs.post(postId),
        (current) => (current ? { ...current, isPinned: data.isPinned } : current),
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
        parentCommentId: replyTarget?.commentId ?? null,
      }),
    onSuccess: () => {
      setComment("");
      setReplyTarget(null);
      Keyboard.dismiss();
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.comments(postId) });
    },
    onError: (error) => {
      Alert.alert(
        "댓글 등록 실패",
        getApiErrorStatus(error) === 403
          ? "클럽 회원만 이용할 수 있는 기능이에요"
          : "댓글을 등록하는 중 문제가 발생했습니다.",
      );
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
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      deleteClubPostComment(activeClubId!, postId, commentId),
    onSuccess: () => {
      setSelectedComment(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.comments(postId) });
    },
    onError: (error) => {
      Alert.alert(
        "댓글 삭제 실패",
        getApiErrorStatus(error) === 403
          ? "클럽 회원만 이용할 수 있는 기능이에요"
          : "댓글을 삭제하는 중 문제가 발생했습니다.",
      );
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
  const commentActionSheetMode: ClubActionSheetMode =
    selectedComment?.isMine === true ? "commentOwner" : "guest";

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

  const handleTogglePin = () => {
    if (!post || pinMutation.isPending) return;

    pinMutation.mutate(!post.isPinned);
  };

  const handlePrimaryAction = () => {
    setActionSheetVisible(false);

    if (actionSheetMode === "owner") {
      router.push({
        pathname: "/club/post-create",
        params: {
          clubId: String(clubId),
          postId: String(postId),
          canPin: params.canPin === "true" ? "true" : "false",
        },
      } as never);
      return;
    }

    router.push({
      pathname: "/club/report",
      params: { clubId: String(clubId), articleId: String(postId) },
    } as never);
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

  const handleCommentPrimaryAction = () => {
    if (!selectedComment) return;

    if (commentActionSheetMode === "commentOwner") {
      const commentId = selectedComment.commentId;

      setSelectedComment(null);
      Alert.alert(
        "댓글 삭제",
        "댓글을 삭제하시겠어요? 달린 답글은 삭제되지 않아요.",
        [
          { text: "취소", style: "cancel" },
          {
            text: "삭제",
            style: "destructive",
            onPress: () => deleteCommentMutation.mutate(commentId),
          },
        ],
      );
      return;
    }

    setSelectedComment(null);
    Alert.alert("준비 중", "댓글 신고 API 명세 확인 후 연결 예정입니다.");
  };

  const handleCommentSecondaryAction = () => {
    if (!selectedComment) return;

    setSelectedComment(null);
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
              {canPinPost && post ? (
                <Pressable
                  style={styles.headerIconButton}
                  onPress={handleTogglePin}
                  disabled={pinMutation.isPending}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={post.isPinned ? "게시글 고정 해제" : "게시글 고정"}
                >
                  <Ionicons
                    name={post.isPinned ? "bookmark" : "bookmark-outline"}
                    size={23}
                    color={post.isPinned ? CLUB_COLORS.pink : CLUB_COLORS.black}
                  />
                </Pressable>
              ) : null}
              <Pressable
                style={styles.headerIconButton}
                onPress={() => sharePost(clubId, postId, post?.title)}
                hitSlop={12}
              >
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
                  isReply={item.parentCommentId !== null}
                  avatarUri={item.author.profileImageUrl ?? undefined}
                  onReplyPress={() => {
                    setReplyTarget({
                      commentId: item.parentCommentId ?? item.commentId,
                      nickname: item.author.nickname,
                    });
                    commentInputRef.current?.focus();
                  }}
                  onMorePress={() =>
                    setSelectedComment({
                      commentId: item.commentId,
                      isMine: item.isMine,
                    })
                  }
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
          inputRef={commentInputRef}
          value={comment}
          onChangeText={setComment}
          bottomPadding={insets.bottom + 12}
          onSend={handleSendComment}
          placeholder={
            replyTarget
              ? `${replyTarget.nickname}님에게 답글 작성`
              : undefined
          }
          onCancelReply={replyTarget ? () => setReplyTarget(null) : undefined}
        />

        <ClubPostActionSheet
          visible={isActionSheetVisible}
          mode={actionSheetMode}
          onClose={() => setActionSheetVisible(false)}
          onPrimaryPress={handlePrimaryAction}
          onSecondaryPress={handleSecondaryAction}
        />

        <ClubPostActionSheet
          visible={selectedComment !== null}
          mode={commentActionSheetMode}
          onClose={() => setSelectedComment(null)}
          onPrimaryPress={handleCommentPrimaryAction}
          onSecondaryPress={handleCommentSecondaryAction}
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

function getApiErrorStatus(error: unknown) {
  const apiError = error as { response?: { status?: number } };
  return apiError.response?.status;
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
