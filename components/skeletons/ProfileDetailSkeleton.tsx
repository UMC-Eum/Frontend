import { StyleSheet, View } from "react-native";

import Skeleton from "./Skeleton";

// 프로필 상세의 히어로 이미지/소개 카드와 같은 자리를 차지하는 스켈레톤입니다.
export default function ProfileDetailSkeleton({ heroHeight }: { heroHeight: number }) {
  return (
    <View>
      <Skeleton width="100%" height={heroHeight} radius={0} />
      <View style={styles.content}>
        <Skeleton width={64} height={20} radius={6} style={styles.sectionTitle} />
        <Skeleton width="100%" height={96} radius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
});
