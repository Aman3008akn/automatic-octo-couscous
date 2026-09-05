import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radius, shadows } from "../src/theme";
import { api } from "../src/api/client";
import { formatRupees } from "../src/utils/format";

const TRENDING_TAGS = [
  "Mechanical Keyboard",
  "Wireless Headphones",
  "Daypack 22L",
  "Smart LED Lamp",
  "Mobiles",
  "Titanium Audio",
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Wireless Headphones",
    "Mechanical Keyboards",
  ]);

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: () => api.getProducts({ q: query, take: 10 }),
    enabled: query.trim().length > 1,
  });

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    if (!recentSearches.includes(searchTerm)) {
      setRecentSearches([searchTerm, ...recentSearches.slice(0, 4)]);
    }
    router.push(`/products?q=${encodeURIComponent(searchTerm)}` as any);
  };

  const results = searchResults?.items || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Search Input Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color={colors.text.muted} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearchSubmit(query)}
            returnKeyType="search"
            placeholder="Search verified items, brands..."
            placeholderTextColor={colors.text.muted}
            style={styles.input}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Autocomplete Results or Search Suggestions */}
      {query.trim().length > 1 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => router.push(`/products/${item.id}` as any)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultBrand}>{item.brand || "VERIFIED"}</Text>
                <Text style={styles.resultTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.resultPrice}>{formatRupees(item.priceCents)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !isFetching ? (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyTitle}>No matches found for "{query}"</Text>
                <Text style={styles.emptySubtitle}>
                  Try checking for typos or searching by brand name.
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.suggestionsContainer}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
                <TouchableOpacity onPress={() => setRecentSearches([])}>
                  <Text style={styles.clearLink}>Clear</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagsRow}>
                {recentSearches.map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => {
                      setQuery(term);
                      handleSearchSubmit(term);
                    }}
                  >
                    <Ionicons name="time-outline" size={12} color={colors.text.secondary} />
                    <Text style={styles.tagText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Trending Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>POPULAR SEARCHES</Text>
            <View style={styles.tagsRow}>
              {TRENDING_TAGS.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.trendingTag}
                  onPress={() => {
                    setQuery(tag);
                    handleSearchSubmit(tag);
                  }}
                >
                  <Ionicons name="trending-up" size={13} color={colors.amber[600]} />
                  <Text style={styles.trendingText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.navy[50],
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  suggestionsContainer: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: colors.text.muted,
  },
  clearLink: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.status.danger,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tagText: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: "600",
  },
  trendingTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.amber[100],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.amber[400],
  },
  trendingText: {
    fontSize: 12,
    color: colors.navy[900],
    fontWeight: "700",
  },
  resultsList: {
    padding: 16,
    gap: 10,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    ...shadows.subtle,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.navy[50],
  },
  resultInfo: {
    flex: 1,
  },
  resultBrand: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 1,
  },
  resultPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.navy[900],
    marginTop: 2,
  },
  emptyResults: {
    paddingTop: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy[900],
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});
