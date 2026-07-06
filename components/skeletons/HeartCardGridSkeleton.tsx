import { StyleSheet, View } from "react-native";

import Skeleton from "./Skeleton";

const HEART_CARD_PLACEHOLDERS = Array.from({ length: 6 }, (_, index) =>
  `heart-card-placeholder-${index}`,
);

// 마음 탭의 2열 카드 그리드(cardWidth × 1.38)와 같은 배치로 로딩 자리를 잡습니다.
export default function HeartCardGridSkeleton({ cardWidth }: { cardWidth: number }) {
  return (
    <View style={styles.grid}>
      {HEART_CARD_PLACEHOLDERS.map((id) => (
        <Skeleton key={id} width={cardWidth} height={cardWidth * 1.38} radius={14} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
});
