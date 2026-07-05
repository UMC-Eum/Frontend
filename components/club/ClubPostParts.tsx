import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export const CLUB_COLORS = {
  pink: "#FF3E70",
  black: "#202020",
  gray700: "#636970",
  gray500: "#A6AFB6",
  gray300: "#DEE3E5",
  gray150: "#E9ECED",
  gray100: "#F8FAFB",
  danger: "#F03F40",
  white: "#FFFFFF",
};

export type ClubActionSheetMode = "owner" | "guest";

interface ClubHeaderProps {
  title?: string;
  rightText?: string;
  rightTextDisabled?: boolean;
  onBack: () => void;
  onRightPress?: () => void;
  rightActions?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * 동호회 화면에서 쓰는 상단 헤더입니다.
 * - 글쓰기 화면은 중앙 제목 + 우측 텍스트 액션을 사용합니다.
 * - 상세 화면은 우측 아이콘 액션을 주입해서 사용합니다.
 */
export function ClubHeader({
  title,
  rightText,
  rightTextDisabled = false,
  onBack,
  onRightPress,
  rightActions,
  style,
}: ClubHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <Pressable style={styles.headerIconButton} onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={28} color={CLUB_COLORS.gray500} />
      </Pressable>
      {title ? <Text style={styles.headerTitle}>{title}</Text> : <View />}
      {rightText ? (
        <Pressable onPress={onRightPress} disabled={rightTextDisabled} hitSlop={12}>
          <Text style={[styles.headerRightText, rightTextDisabled && styles.headerRightTextDisabled]}>
            {rightText}
          </Text>
        </Pressable>
      ) : (
        rightActions ?? <View style={styles.headerIconButton} />
      )}
    </View>
  );
}

export function RequiredLabel({
  label,
  required = true,
  style,
  textStyle,
}: {
  label: string;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[styles.requiredLabelRow, style]}>
      <Text style={[styles.requiredLabel, textStyle]}>{label}</Text>
      {required ? <Text style={styles.requiredMark}>*</Text> : null}
    </View>
  );
}

export function ClubCategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <View style={styles.categoryRow}>
      {categories.map((item) => {
        const isActive = item === selected;
        return (
          <Pressable
            key={item}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ClubImagePreviewList({
  images,
  onRemove,
}: {
  images: string[];
  onRemove: (index: number) => void;
}) {
  if (images.length === 0) return null;

  return (
    <View style={styles.previewRow}>
      {images.map((uri, index) => (
        <View key={`${uri}-${index}`} style={styles.previewItem}>
          <Image source={{ uri }} style={styles.previewImage} contentFit="cover" />
          <Pressable style={styles.removeImageButton} onPress={() => onRemove(index)}>
            <Ionicons name="close" size={14} color={CLUB_COLORS.white} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

export function ClubMediaBar({
  bottomPadding,
  onGalleryPress,
  onCameraPress,
}: {
  bottomPadding: number;
  onGalleryPress: () => void;
  onCameraPress: () => void;
}) {
  return (
    <View style={[styles.mediaBar, { paddingBottom: bottomPadding }]}>
      <MediaAction icon="image" label="갤러리" onPress={onGalleryPress} />
      <MediaAction icon="camera" label="사진" onPress={onCameraPress} />
    </View>
  );
}

export function ClubAuthorMeta({
  name,
  time,
  category,
  avatarUri,
}: {
  name: string;
  time: string;
  category: string;
  avatarUri?: string;
}) {
  return (
    <View style={styles.authorRow}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.authorAvatar} contentFit="cover" />
      ) : (
        <View style={styles.authorAvatar} />
      )}
      <View>
        <Text style={styles.authorName}>{name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{time}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>
    </View>
  );
}

export function ClubReactionSummary({
  likeCount,
  commentCount,
  isLiked = false,
  onLikePress,
}: {
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  onLikePress?: () => void;
}) {
  return (
    <View style={styles.reactionRow}>
      <Reaction
        icon={isLiked ? "heart" : "heart-outline"}
        count={likeCount}
        color={isLiked ? CLUB_COLORS.pink : undefined}
        onPress={onLikePress}
      />
      <Reaction icon="chatbubble-outline" count={commentCount} />
    </View>
  );
}

export function ClubCommentItem({
  name,
  time,
  text,
  onMorePress,
  avatarUri,
}: {
  name: string;
  time: string;
  text: string;
  onMorePress?: () => void;
  avatarUri?: string | null;
}) {
  return (
    <View style={styles.commentRow}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.commentAvatar} contentFit="cover" />
      ) : (
        <View style={styles.commentAvatar} />
      )}
      <View style={styles.commentContent}>
        <View style={styles.commentTopRow}>
          <View style={styles.commentNameRow}>
            <Text style={styles.commentName}>{name}</Text>
            <Text style={styles.commentTime}>{time}</Text>
          </View>
          {onMorePress ? (
            <Pressable onPress={onMorePress} hitSlop={10}>
              <Ionicons name="ellipsis-vertical" size={22} color={CLUB_COLORS.gray500} />
            </Pressable>
          ) : (
            <View style={styles.commentMoreIcon}>
              <Ionicons name="ellipsis-vertical" size={22} color={CLUB_COLORS.gray500} />
            </View>
          )}
        </View>
        <Text style={styles.commentText}>{text}</Text>
        <Text style={styles.replyText}>답글 달기</Text>
      </View>
    </View>
  );
}

export function ClubCommentInputBar({
  value,
  onChangeText,
  bottomPadding,
  onSend,
}: {
  value: string;
  onChangeText: (value: string) => void;
  bottomPadding: number;
  onSend?: () => void;
}) {
  const canSend = value.trim().length > 0 && !!onSend;

  return (
    <View style={[styles.inputBar, { paddingBottom: bottomPadding }]}>
      <TextInput
        style={styles.commentInput}
        placeholder="따뜻한 댓글을 작성해주세요."
        placeholderTextColor={CLUB_COLORS.gray500}
        value={value}
        onChangeText={onChangeText}
      />
      <Pressable
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!canSend}
        hitSlop={12}
      >
        <Ionicons
          name="send"
          size={24}
          color={canSend ? CLUB_COLORS.pink : CLUB_COLORS.gray500}
        />
      </Pressable>
    </View>
  );
}

export function ClubPostActionSheet({
  visible,
  mode,
  onClose,
  onPrimaryPress,
  onSecondaryPress,
}: {
  visible: boolean;
  mode: ClubActionSheetMode;
  onClose: () => void;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
}) {
  const primaryLabel = mode === "owner" ? "수정하기" : "신고하기";
  const secondaryLabel = mode === "owner" ? "삭제하기" : "차단하기";
  const primaryDanger = mode === "guest";
  const secondaryDanger = mode === "owner";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheetGroup}>
          <View style={styles.sheetContainer}>
            <SheetButton
              label={primaryLabel}
              danger={primaryDanger}
              position="top"
              onPress={onPrimaryPress ?? onClose}
            />
            <SheetButton
              label={secondaryLabel}
              danger={secondaryDanger}
              position="bottom"
              onPress={onSecondaryPress ?? onClose}
            />
          </View>
          <SheetButton label="취소" position="single" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function MediaAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.mediaAction} onPress={onPress}>
      <Ionicons name={icon} size={28} color={CLUB_COLORS.gray500} />
      <Text style={styles.mediaActionText}>{label}</Text>
    </Pressable>
  );
}

function Reaction({
  icon,
  count,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={styles.reactionItem}
      onPress={onPress}
      disabled={!onPress}
      hitSlop={8}
    >
      <Ionicons name={icon} size={20} color={color ?? CLUB_COLORS.gray700} />
      <Text style={styles.reactionCount}>{count}</Text>
    </Pressable>
  );
}

function SheetButton({
  label,
  danger = false,
  position,
  onPress,
}: {
  label: string;
  danger?: boolean;
  position: "top" | "bottom" | "single";
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.sheetButton,
        position === "top" && styles.sheetButtonTop,
        position === "bottom" && styles.sheetButtonBottom,
        position === "single" && styles.sheetButtonSingle,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.sheetButtonText, danger && styles.sheetButtonTextDanger]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CLUB_COLORS.white,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: CLUB_COLORS.black,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 30,
  },
  headerRightText: {
    color: CLUB_COLORS.pink,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  headerRightTextDisabled: {
    color: CLUB_COLORS.gray500,
  },
  requiredLabelRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 1,
  },
  requiredLabel: {
    color: CLUB_COLORS.black,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  requiredMark: {
    color: CLUB_COLORS.pink,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  categoryRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: CLUB_COLORS.gray300,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CLUB_COLORS.white,
  },
  chipActive: {
    borderColor: CLUB_COLORS.pink,
    backgroundColor: CLUB_COLORS.pink,
  },
  chipText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  chipTextActive: {
    color: CLUB_COLORS.white,
    fontWeight: "600",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  previewItem: {
    width: 82,
    height: 82,
  },
  previewImage: {
    width: 82,
    height: 82,
    borderRadius: 7,
    backgroundColor: "#D9D9D9",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: CLUB_COLORS.gray700,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaBar: {
    minHeight: 84,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CLUB_COLORS.gray300,
    backgroundColor: CLUB_COLORS.white,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mediaAction: {
    minHeight: 40,
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mediaActionText: {
    color: CLUB_COLORS.gray500,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  authorRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D9D9D9",
  },
  authorName: {
    color: CLUB_COLORS.black,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    color: CLUB_COLORS.gray500,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  metaDot: {
    color: CLUB_COLORS.gray500,
    fontSize: 12,
    fontWeight: "500",
  },
  categoryText: {
    color: CLUB_COLORS.pink,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  reactionRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reactionCount: {
    color: CLUB_COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
  },
  commentRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D9D9D9",
  },
  commentContent: {
    flex: 1,
    gap: 8,
  },
  commentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  commentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentMoreIcon: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  commentName: {
    color: CLUB_COLORS.black,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  commentTime: {
    color: CLUB_COLORS.gray500,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 20,
  },
  commentText: {
    color: CLUB_COLORS.black,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  replyText: {
    color: CLUB_COLORS.gray500,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 20,
  },
  inputBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CLUB_COLORS.white,
  },
  commentInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F3F4F5",
    color: CLUB_COLORS.black,
    fontSize: 18,
    fontWeight: "500",
  },
  sendButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  sheetGroup: {
    gap: 12,
  },
  sheetContainer: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: CLUB_COLORS.white,
  },
  sheetButton: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CLUB_COLORS.white,
  },
  sheetButtonTop: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  sheetButtonBottom: {
    borderTopWidth: 1,
    borderTopColor: CLUB_COLORS.gray150,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  sheetButtonSingle: {
    borderRadius: 14,
  },
  sheetButtonText: {
    color: CLUB_COLORS.black,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  sheetButtonTextDanger: {
    color: CLUB_COLORS.danger,
  },
});
