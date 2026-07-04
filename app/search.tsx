import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RecentSearches from "@/components/search/RecentSearches";
import SearchHeader from "@/components/search/SearchHeader";
import SearchResults from "@/components/search/SearchResults";
import SortSheet from "@/components/search/SortSheet";
import SuggestionList from "@/components/search/SuggestionList";
import { RECENT_SEARCHES, SUGGESTIONS } from "@/constants/search";
import { useClubsInfiniteQuery } from "@/hooks/api/useClub";
import type {
  ClubCategory,
  ClubListSort,
  IClubListItem,
} from "@/types/api/club/clubDTO";
import { Club, SortOption } from "@/types/search";

const CATEGORY_TABS = [
  { label: "운동 / 스포츠", value: "SPORTS" },
  { label: "봉사활동", value: "VOLUNTEER" },
  { label: "자기개발", value: "STUDY" },
  { label: "취미생활", value: "HOBBY" },
  { label: "사교", value: "OTHERS" },
] as const satisfies readonly { label: string; value: ClubCategory }[];

const CATEGORY_CHIPS_BY_LABEL: Record<string, string[]> = {
  "운동 / 스포츠": ["전체", "러닝", "등산", "필라테스"],
  봉사활동: ["전체", "봉사", "나눔", "지역활동"],
  자기개발: ["전체", "스터디", "독서", "외국어"],
  취미생활: ["전체", "공예", "사진", "음악"],
  사교: ["전체", "친목", "동네친구", "네트워킹"],
};

const DEFAULT_CATEGORY_CHIPS = ["전체"];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string | string[];
    categoryLabel?: string | string[];
  }>();
  const inputRef = useRef<TextInput>(null);
  const routeCategory = useMemo(
    () => resolveRouteCategory(params.category, params.categoryLabel),
    [params.category, params.categoryLabel],
  );
  const routeCategoryValue = routeCategory?.value ?? null;
  const routeCategoryLabel = routeCategory?.label ?? "";
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [isSortVisible, setIsSortVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ClubCategory | null>(
    () => routeCategoryValue,
  );
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState(
    () => routeCategoryLabel,
  );
  const [selectedChip, setSelectedChip] = useState("전체");

  const trimmedQuery = query.trim();
  const hasSubmitted = submittedQuery.trim().length > 0;
  const activeChipKeyword = selectedChip !== "전체" ? selectedChip : "";
  const activeKeyword = activeChipKeyword || submittedQuery.trim();
  const clubSort = useMemo<ClubListSort>(
    () => (sortOption === "latest" ? "RECENT" : "POPULAR"),
    [sortOption],
  );
  const shouldRequestClubs = Boolean(selectedCategory || hasSubmitted);

  const clubsQuery = useClubsInfiniteQuery(
    {
      category: selectedCategory ?? undefined,
      keyword: activeKeyword || undefined,
      sort: clubSort,
      limit: 20,
    },
    shouldRequestClubs,
  );

  const results = useMemo(
    () =>
      clubsQuery.data?.pages.flatMap((page) =>
        getClubItemsFromPage(page).map(mapClubListItemToSearchClub),
      ) ?? [],
    [clubsQuery.data],
  );
  const selectedCategoryChips =
    CATEGORY_CHIPS_BY_LABEL[selectedCategoryLabel] ?? DEFAULT_CATEGORY_CHIPS;

  useEffect(() => {
    if (!routeCategoryValue) return;

    setSelectedCategory(routeCategoryValue);
    setSelectedCategoryLabel(routeCategoryLabel);
    setSelectedChip("전체");
    setQuery("");
    setSubmittedQuery("");
  }, [routeCategoryLabel, routeCategoryValue]);

  const suggestions = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    return SUGGESTIONS.filter((item) => item.includes(trimmedQuery));
  }, [trimmedQuery]);

  const submitSearch = (nextQuery = query) => {
    const keyword = nextQuery.trim();

    if (!keyword && !selectedCategory) {
      return;
    }

    setQuery(keyword);
    setSubmittedQuery(keyword);
    setSelectedChip("전체");
    if (keyword) {
      setRecentSearches((items) => [
        keyword,
        ...items.filter((item) => item !== keyword),
      ]);
    }
    Keyboard.dismiss();
  };

  const clearQuery = () => {
    setQuery("");
    setSubmittedQuery("");
    setSelectedChip("전체");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const removeRecentSearch = (keyword: string) => {
    setRecentSearches((items) => items.filter((item) => item !== keyword));
  };

  const renderBody = () => {
    if (!trimmedQuery && !selectedCategory) {
      return (
        <RecentSearches
          searches={recentSearches}
          onPressSearch={submitSearch}
          onRemoveSearch={removeRecentSearch}
          onClearAll={() => setRecentSearches([])}
        />
      );
    }

    if (trimmedQuery && !hasSubmitted) {
      return (
        <SuggestionList suggestions={suggestions} onPressSearch={submitSearch} />
      );
    }

    return (
      <View style={styles.resultsWrap}>
        {selectedCategory ? (
          <CategoryFilters
            selectedCategoryLabel={selectedCategoryLabel}
            selectedChip={selectedChip}
            chips={selectedCategoryChips}
            onSelectCategory={(category) => {
              setSelectedCategory(category.value);
              setSelectedCategoryLabel(category.label);
              setSelectedChip("전체");
              setQuery("");
              setSubmittedQuery("");
            }}
            onSelectChip={(chip) => {
              setSelectedChip(chip);
              setQuery("");
              setSubmittedQuery("");
            }}
          />
        ) : null}
        <SearchResults
          results={results}
          sortOption={sortOption}
          showSort={!selectedCategory}
          isLoading={clubsQuery.isLoading}
          isFetchingNextPage={clubsQuery.isFetchingNextPage}
          hasNextPage={Boolean(clubsQuery.hasNextPage)}
          emptyKeyword={activeKeyword || selectedCategoryLabel}
          onPressSort={() => setIsSortVisible(true)}
          onPressMore={() => clubsQuery.fetchNextPage()}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <SearchHeader
          inputRef={inputRef}
          query={query}
          onChangeQuery={(text) => {
            setQuery(text);
            setSubmittedQuery("");
            setSelectedChip("전체");
          }}
          onSubmit={() => submitSearch()}
          onClear={clearQuery}
          onBack={() => router.back()}
          autoFocus={!selectedCategory}
        />
        {renderBody()}
      </KeyboardAvoidingView>

      <SortSheet
        visible={isSortVisible}
        selected={sortOption}
        onClose={() => setIsSortVisible(false)}
        onSelect={(option) => {
          setSortOption(option);
          setIsSortVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function CategoryFilters({
  selectedCategoryLabel,
  selectedChip,
  chips,
  onSelectCategory,
  onSelectChip,
}: {
  selectedCategoryLabel: string;
  selectedChip: string;
  chips: string[];
  onSelectCategory: (category: (typeof CATEGORY_TABS)[number]) => void;
  onSelectChip: (chip: string) => void;
}) {
  return (
    <View style={styles.categoryFilters}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabRow}
      >
        {CATEGORY_TABS.map((category) => {
          const isActive = selectedCategoryLabel === category.label;

          return (
            <Pressable
              key={category.label}
              style={styles.categoryTab}
              onPress={() => onSelectCategory(category)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  isActive && styles.categoryTabTextActive,
                ]}
              >
                {category.label}
              </Text>
              {isActive ? <View style={styles.categoryTabUnderline} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.keywordChipRow}
      >
        {chips.map((chip) => {
          const isActive = selectedChip === chip;

          return (
            <Pressable
              key={chip}
              style={[styles.keywordChip, isActive && styles.keywordChipActive]}
              onPress={() => onSelectChip(chip)}
            >
              <Text
                style={[
                  styles.keywordChipText,
                  isActive && styles.keywordChipTextActive,
                ]}
              >
                {chip}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function mapClubListItemToSearchClub(item: IClubListItem): Club {
  const extendedItem = item as IClubListItem & {
    areaName?: string | null;
    capacity?: number | null;
    createdAt?: string | null;
    district?: string | null;
    host?: { nickname?: string | null } | null;
    likeCount?: number | null;
    location?: string | null;
  };
  const createdAt = extendedItem.createdAt
    ? Date.parse(extendedItem.createdAt)
    : item.clubId;
  const memberCount = item.memberCount ?? 0;
  const capacity = extendedItem.capacity ?? null;

  return {
    id: String(item.clubId),
    title: item.name || "이름 없는 동호회",
    district:
      extendedItem.areaName?.trim() ||
      extendedItem.district?.trim() ||
      extendedItem.location?.trim() ||
      getClubCategoryLabel(item.category),
    host: extendedItem.host?.nickname || "운영자",
    description: item.introText || "",
    members: memberCount,
    date: capacity ? `${memberCount}/${capacity}` : `${memberCount}`,
    score: extendedItem.likeCount ?? item.likes ?? 0,
    createdAt: Number.isFinite(createdAt) ? createdAt : 0,
    thumbnailUrl: item.thumbnailUrl,
    category: item.category,
  };
}

function getClubItemsFromPage(page: unknown): IClubListItem[] {
  if (Array.isArray(page)) {
    return page.filter(isClubListItem);
  }

  if (!page || typeof page !== "object") {
    return [];
  }

  const pageLike = page as {
    clubs?: unknown;
    items?: unknown;
    content?: unknown;
    clubList?: unknown;
    data?: unknown;
  };
  const clubs =
    pageLike.clubs ??
    pageLike.items ??
    pageLike.content ??
    pageLike.clubList ??
    pageLike.data;

  return Array.isArray(clubs) ? clubs.filter(isClubListItem) : [];
}

function isClubListItem(item: unknown): item is IClubListItem {
  return Boolean(
    item &&
      typeof item === "object" &&
      "clubId" in item &&
      "name" in item,
  );
}

function resolveRouteCategory(
  categoryParam?: string | string[],
  labelParam?: string | string[],
) {
  const category = getFirstParam(categoryParam) as ClubCategory | undefined;
  const label = getFirstParam(labelParam);

  if (label) {
    const categoryByLabel = CATEGORY_TABS.find((item) => item.label === label);
    if (categoryByLabel) return categoryByLabel;
  }

  if (!category) return null;

  return (
    CATEGORY_TABS.find((item) => item.value === category) ?? {
      label: label || getClubCategoryLabel(category),
      value: category,
    }
  );
}

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getClubCategoryLabel(category: ClubCategory) {
  switch (category) {
    case "SPORTS":
      return "운동 / 스포츠";
    case "HOBBY":
      return "취미생활";
    case "STUDY":
      return "자기개발";
    case "VOLUNTEER":
      return "봉사활동";
    case "OTHERS":
      return "사교";
    default:
      return String(category);
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  resultsWrap: {
    flex: 1,
  },
  categoryFilters: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F4",
    backgroundColor: "#FFFFFF",
  },
  categoryTabRow: {
    minHeight: 50,
    paddingHorizontal: 20,
    gap: 22,
    alignItems: "flex-end",
  },
  categoryTab: {
    height: 50,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  categoryTabText: {
    paddingBottom: 10,
    color: "#636970",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
  },
  categoryTabTextActive: {
    color: "#202020",
  },
  categoryTabUnderline: {
    width: "100%",
    height: 2,
    borderRadius: 1,
    backgroundColor: "#202020",
  },
  keywordChipRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 10,
  },
  keywordChip: {
    height: 34,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  keywordChipActive: {
    borderColor: "#FC3367",
    backgroundColor: "#FFF2F5",
  },
  keywordChipText: {
    color: "#202020",
    fontSize: 13,
    fontWeight: "600",
  },
  keywordChipTextActive: {
    color: "#FC3367",
  },
});
