import { StyleSheet, View } from "react-native";

import Skeleton from "./Skeleton";

const NOTIFICATION_PLACEHOLDERS = Array.from({ length: 7 }, (_, index) =>
  `notification-placeholder-${index}`,
);

// NotificationItem(minHeight 84)과 동일한 치수를 유지해 로딩 전후 높이가 튀지 않게 합니다.
export default function NotificationListSkeleton() {
  return (
    <View>
      {NOTIFICATION_PLACEHOLDERS.map((id) => (
        <View key={id} style={styles.row}>
          <Skeleton width={54} height={54} circle />
          <View style={styles.textBlock}>
            <Skeleton width="82%" height={17} radius={6} style={styles.mainLine} />
            <Skeleton width={64} height={13} radius={6} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 2,
  },
  mainLine: {
    marginBottom: 10,
  },
});
