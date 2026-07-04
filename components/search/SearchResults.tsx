import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Club, SortOption } from "@/types/search";

import ClubRow from "./ClubRow";

type SearchResultsProps = {
  results: Club[];
  sortOption: SortOption;
  onPressSort: () => void;
  showSort?: boolean;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  emptyKeyword?: string;
  onPressMore?: () => void;
};

export default function SearchResults({
  results,
  sortOption,
  onPressSort,
  showSort = true,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  emptyKeyword,
  onPressMore,
}: SearchResultsProps) {
  const router = useRouter();
  const hasResults = results.length > 0;
  const openClubDetail = (clubId: string) => {
    router.push({
      pathname: "/club/detail",
      params: { clubId: parseClubId(clubId) },
    } as never);
  };

  return (
    <FlatList
      style={styles.resultList}
      data={results}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.resultListContent}
      ListHeaderComponent={
        <>
          {showSort ? (
            <Pressable onPress={onPressSort} style={styles.sortChip}>
              <Text style={styles.sortText}>
                {sortOption === "recommended" ? "추천순" : "최신순"}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#202020" />
            </Pressable>
          ) : null}
          {isLoading ? <LoadingState /> : null}
          {!isLoading && !hasResults ? <EmptyState keyword={emptyKeyword} /> : null}
        </>
      }
      renderItem={({ item }) => (
        <ClubRow
          club={item}
          featured
          onPress={() => openClubDetail(item.id)}
        />
      )}
      onEndReachedThreshold={0.6}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          onPressMore?.();
        }
      }}
      ListFooterComponent={
        hasResults ? (
          <>
            {isFetchingNextPage ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#FC3367" />
              </View>
            ) : null}
            {hasNextPage && !isFetchingNextPage ? (
              <Pressable style={styles.moreButton} onPress={onPressMore}>
                <Text style={styles.moreButtonText}>더보기</Text>
              </Pressable>
            ) : null}
          </>
        ) : null
      }
    />
  );
}

function parseClubId(value: string) {
  const match = value.match(/\d+/);
  return match?.[0] ?? value;
}

function LoadingState() {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator size="small" color="#FC3367" />
      <Text style={styles.loadingText}>동호회를 불러오는 중이에요.</Text>
    </View>
  );
}

function EmptyState({ keyword }: { keyword?: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {keyword ? `${keyword}에 대한 검색 결과가 없어요` : "검색 결과가 없어요"}
      </Text>
      <Text style={styles.emptyDescription}>
        모임 검색 결과가 없어요. 다른 키워드로 다시 검색해 보세요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  resultList: {
    flex: 1,
  },
  resultListContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  sortChip: {
    alignSelf: "flex-start",
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
  },
  sortText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#202020",
  },
  moreButton: {
    height: 42,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3F4",
  },
  moreButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A6AFB6",
  },
  emptyState: {
    height: 176,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#202020",
    textAlign: "center",
  },
  emptyDescription: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: "#A6AFB6",
    textAlign: "center",
  },
  loadingState: {
    height: 176,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: "#A6AFB6",
  },
  footerLoading: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
});
