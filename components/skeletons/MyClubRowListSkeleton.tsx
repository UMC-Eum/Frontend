import { StyleSheet, View } from "react-native";

import Skeleton from "./Skeleton";

// MY 탭 내 동호회 행(38×38 썸네일)과 같은 배치로 로딩 자리를 잡습니다.
export default function MyClubRowListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <View key={`my-club-row-placeholder-${index}`} style={styles.row}>
          <Skeleton width={38} height={38} radius={6} style={styles.thumb} />
          <View style={styles.textBlock}>
            <Skeleton width="54%" height={13} radius={6} style={styles.title} />
            <Skeleton width="38%" height={12} radius={6} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  thumb: {
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
});
