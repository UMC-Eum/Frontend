import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { RECOMMENDED_CLUBS } from "@/constants/search";
import { Club, SortOption } from "@/types/search";

import ClubRow from "./ClubRow";

type SearchResultsProps = {
  results: Club[];
  sortOption: SortOption;
  onPressSort: () => void;
};

export default function SearchResults({
  results,
  sortOption,
  onPressSort,
}: SearchResultsProps) {
  const hasResults = results.length > 0;

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.resultListContent}
      ListHeaderComponent={
        <>
          <Pressable onPress={onPressSort} style={styles.sortChip}>
            <Text style={styles.sortText}>
              {sortOption === "recommended" ? "추천순" : "최신순"}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#202020" />
          </Pressable>
          {!hasResults && <EmptyState />}
        </>
      }
      renderItem={({ item }) => <ClubRow club={item} featured />}
      ListFooterComponent={
        <>
          <RecommendedSection />
          <Pressable style={styles.moreButton}>
            <Text style={styles.moreButtonText}>더보기</Text>
          </Pressable>
        </>
      }
    />
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>동산 동호회에 대한 검색 결과가 없어요</Text>
      <Text style={styles.emptyDescription}>
        모임 검색 결과가 없어요. 다른 키워드로 다시 검색해 보세요.
      </Text>
    </View>
  );
}

function RecommendedSection() {
  return (
    <View style={styles.recommendedSection}>
      <Text style={styles.recommendedTitle}>✦ 이런 동호회도 있어요!</Text>
      {RECOMMENDED_CLUBS.map((club) => (
        <ClubRow key={club.id} club={club} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
  recommendedSection: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 8,
    borderTopColor: "#F4F5F6",
  },
  recommendedTitle: {
    marginBottom: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: "800",
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
});
