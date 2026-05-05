import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RecentSearches from "@/components/search/RecentSearches";
import SearchHeader from "@/components/search/SearchHeader";
import SearchResults from "@/components/search/SearchResults";
import SortSheet from "@/components/search/SortSheet";
import SuggestionList from "@/components/search/SuggestionList";
import { CLUBS, RECENT_SEARCHES, SUGGESTIONS } from "@/constants/search";
import { SortOption } from "@/types/search";

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [isSortVisible, setIsSortVisible] = useState(false);

  const trimmedQuery = query.trim();
  const hasSubmitted = submittedQuery.trim().length > 0;

  const suggestions = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    return SUGGESTIONS.filter((item) => item.includes(trimmedQuery));
  }, [trimmedQuery]);

  const results = useMemo(() => {
    if (!hasSubmitted) {
      return [];
    }

    const keyword = submittedQuery.trim();
    const filtered = CLUBS.filter((club) =>
      [club.title, club.district, club.host, club.description].some((value) =>
        value.includes(keyword),
      ),
    );

    return [...filtered].sort((a, b) =>
      sortOption === "recommended"
        ? b.score - a.score
        : b.createdAt - a.createdAt,
    );
  }, [hasSubmitted, sortOption, submittedQuery]);

  const submitSearch = (nextQuery = query) => {
    const keyword = nextQuery.trim();

    if (!keyword) {
      return;
    }

    setQuery(keyword);
    setSubmittedQuery(keyword);
    setRecentSearches((items) => [
      keyword,
      ...items.filter((item) => item !== keyword),
    ]);
    Keyboard.dismiss();
  };

  const clearQuery = () => {
    setQuery("");
    setSubmittedQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const removeRecentSearch = (keyword: string) => {
    setRecentSearches((items) => items.filter((item) => item !== keyword));
  };

  const renderBody = () => {
    if (!trimmedQuery) {
      return (
        <RecentSearches
          searches={recentSearches}
          onPressSearch={submitSearch}
          onRemoveSearch={removeRecentSearch}
          onClearAll={() => setRecentSearches([])}
        />
      );
    }

    if (!hasSubmitted) {
      return (
        <SuggestionList suggestions={suggestions} onPressSearch={submitSearch} />
      );
    }

    return (
      <SearchResults
        results={results}
        sortOption={sortOption}
        onPressSort={() => setIsSortVisible(true)}
      />
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
          }}
          onSubmit={() => submitSearch()}
          onClear={clearQuery}
          onBack={() => router.back()}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
});
