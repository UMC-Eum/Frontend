import { StyleSheet, View } from "react-native";

import Skeleton from "./Skeleton";

const BOARD_POST_PLACEHOLDERS = Array.from({ length: 3 }, (_, index) =>
  `board-post-placeholder-${index}`,
);

const ALBUM_PLACEHOLDERS = Array.from({ length: 3 }, (_, index) =>
  `album-placeholder-${index}`,
);

// 동호회 게시판 글(작성자 40px 아바타 + 본문)과 같은 배치로 로딩 자리를 잡습니다.
export function BoardPostListSkeleton() {
  return (
    <View style={styles.postList}>
      {BOARD_POST_PLACEHOLDERS.map((id) => (
        <View key={id} style={styles.boardPost}>
          <View style={styles.postTop}>
            <Skeleton width={40} height={40} circle style={styles.avatar} />
            <View style={styles.postMeta}>
              <Skeleton width={88} height={13} radius={6} />
              <Skeleton width={128} height={12} radius={6} style={styles.metaLine} />
            </View>
          </View>
          <View style={styles.postBody}>
            <Skeleton width="94%" height={15} radius={6} />
            <Skeleton width="68%" height={15} radius={6} style={styles.metaLine} />
          </View>
        </View>
      ))}
    </View>
  );
}

// 앨범 탭의 정사각 타일 그리드와 같은 배치로 로딩 자리를 잡습니다.
export function AlbumGridSkeleton({ itemSize }: { itemSize: number }) {
  return (
    <View style={styles.albumGrid}>
      {ALBUM_PLACEHOLDERS.map((id) => (
        <Skeleton
          key={id}
          width={itemSize}
          height={itemSize}
          radius={0}
          style={styles.albumItem}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  postList: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  boardPost: {
    paddingBottom: 20,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECED",
  },
  postTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 12,
  },
  postMeta: {
    flex: 1,
    minWidth: 0,
  },
  metaLine: {
    marginTop: 5,
  },
  postBody: {
    marginTop: 16,
  },
  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
  },
  albumItem: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#FFFFFF",
  },
});
