import { StyleSheet, View } from "react-native";

import Skeleton from "./Skeleton";

type ClubRowListSkeletonProps = {
  count?: number;
  // search/ClubRow의 featured(minHeight 108) 여부와 맞춥니다.
  featured?: boolean;
};

// search/ClubRow(78px 썸네일 행)와 같은 배치로 로딩 자리를 잡습니다.
export default function ClubRowListSkeleton({
  count = 3,
  featured = false,
}: ClubRowListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={`club-row-placeholder-${index}`}
          style={[styles.row, featured && styles.featuredRow]}
        >
          <Skeleton width={78} height={78} radius={8} />
          <View style={styles.info}>
            <Skeleton width="46%" height={15} radius={6} />
            <Skeleton width="76%" height={12} radius={6} style={styles.line} />
            <Skeleton width="32%" height={11} radius={6} style={styles.line} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  featuredRow: {
    minHeight: 108,
  },
  info: {
    flex: 1,
  },
  line: {
    marginTop: 8,
  },
});
