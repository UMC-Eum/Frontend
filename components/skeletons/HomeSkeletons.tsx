import { StyleSheet, View } from "react-native";

import Skeleton from "./Skeleton";

const VIEWER_PLACEHOLDERS = Array.from({ length: 4 }, (_, index) =>
  `viewer-placeholder-${index}`,
);

const MY_CLUB_PLACEHOLDERS = Array.from({ length: 3 }, (_, index) =>
  `my-club-placeholder-${index}`,
);

// 홈 첫 진입 시 헤더/탭/추천 카드와 같은 자리를 차지하는 전체 스켈레톤입니다.
export function HomeInitialSkeleton() {
  return (
    <View>
      <View style={styles.header}>
        <Skeleton width={188} height={26} radius={8} />
        <Skeleton width={25} height={25} circle />
      </View>
      <View style={styles.homeTabs}>
        <Skeleton width={40} height={22} radius={6} />
        <Skeleton width={64} height={22} radius={6} />
      </View>
      <View style={styles.recommendHeader}>
        <Skeleton width={208} height={24} radius={8} />
        <Skeleton width={72} height={16} radius={6} />
      </View>
      <RecommendCardSkeleton />
    </View>
  );
}

// 추천 프로필 카드(492 높이)와 동일한 크기의 로딩 자리입니다.
export function RecommendCardSkeleton() {
  return (
    <View style={styles.recommendWrap}>
      <Skeleton width="100%" height={492} radius={14} />
      <View style={styles.recommendInfo}>
        <Skeleton width={150} height={26} radius={8} color="#E2E6EA" />
        <Skeleton
          width={112}
          height={18}
          radius={6}
          color="#E2E6EA"
          style={styles.recommendLine}
        />
        <Skeleton
          width="86%"
          height={16}
          radius={6}
          color="#E2E6EA"
          style={styles.recommendLine}
        />
      </View>
    </View>
  );
}

// 내 프로필을 본 인연 목록(84×84 카드)의 로딩 자리입니다.
export function ViewerListSkeleton() {
  return (
    <View style={styles.viewerRow}>
      {VIEWER_PLACEHOLDERS.map((id) => (
        <View key={id} style={styles.viewerItem}>
          <Skeleton width={84} height={84} radius={14} />
          <Skeleton width={64} height={14} radius={6} style={styles.viewerName} />
        </View>
      ))}
    </View>
  );
}

// 홈 동호회 탭의 내 동호회 카드(108×108) 가로 목록 로딩 자리입니다.
export function MyClubCardListSkeleton() {
  return (
    <View style={styles.myClubList}>
      {MY_CLUB_PLACEHOLDERS.map((id) => (
        <View key={id} style={styles.myClubCard}>
          <Skeleton width={108} height={108} radius={14} />
          <Skeleton width={84} height={16} radius={6} style={styles.myClubTitle} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  homeTabs: {
    height: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },
  recommendHeader: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recommendWrap: {
    marginHorizontal: 20,
  },
  recommendInfo: {
    position: "absolute",
    left: 20,
    bottom: 82,
  },
  recommendLine: {
    marginTop: 10,
  },
  viewerRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  viewerItem: {
    width: 84,
    marginRight: 12,
  },
  viewerName: {
    marginTop: 7,
  },
  myClubList: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  myClubCard: {
    width: 108,
  },
  myClubTitle: {
    marginTop: 8,
    alignSelf: "center",
  },
});
