import { StyleSheet, View } from "react-native";

import Skeleton from "./Skeleton";

const CHAT_PREVIEW_PLACEHOLDERS = Array.from({ length: 6 }, (_, index) =>
  `chat-preview-placeholder-${index}`,
);

const ACTIVE_MEMBER_PLACEHOLDERS = Array.from({ length: 4 }, (_, index) =>
  `active-member-placeholder-${index}`,
);

// ChatListScreen의 chatItem(minHeight 84)과 같은 배치로 로딩 자리를 잡습니다.
export function ChatPreviewListSkeleton() {
  return (
    <View>
      {CHAT_PREVIEW_PLACEHOLDERS.map((id) => (
        <View key={id} style={styles.chatItem}>
          <Skeleton width={64} height={64} circle />
          <View style={styles.chatContent}>
            <Skeleton width={96} height={16} radius={6} style={styles.chatNameLine} />
            <Skeleton width="72%" height={15} radius={6} />
          </View>
        </View>
      ))}
    </View>
  );
}

// 활동중인 멤버(86×80 카드) 가로 목록의 로딩 자리입니다.
export function ActiveMemberListSkeleton() {
  return (
    <View style={styles.activeList}>
      {ACTIVE_MEMBER_PLACEHOLDERS.map((id) => (
        <View key={id} style={styles.activeMember}>
          <Skeleton width={86} height={80} radius={10} style={styles.activeImage} />
          <Skeleton width={58} height={12} radius={6} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  chatContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  chatNameLine: {
    marginBottom: 8,
  },
  activeList: {
    flexDirection: "row",
    gap: 12,
  },
  activeMember: {
    width: 86,
  },
  activeImage: {
    marginBottom: 8,
  },
});
