import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radius, shadows } from "../../src/theme";
import { api } from "../../src/api/client";
import { Header } from "../../src/components/common/Header";
import { Category } from "../../src/types";

export default function CategoriesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
  });

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/products?categorySlug=${item.slug}` as any)}
    >
      <Image
        source={{
          uri:
            item.imageUrl ||
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardOverlay}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>
          {item.productCount || 24} Verified Items
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="All Categories" showBack={false} />

      {/* Filter search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color={colors.text.muted} />
        <TextInput
          placeholder="Filter categories..."
          placeholderTextColor={colors.text.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    height: 140,
    borderRadius: radius.lg,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.navy[900],
    ...shadows.subtle,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(18, 23, 43, 0.65)",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },
  categoryCount: {
    fontSize: 11,
    color: colors.amber[400],
    fontWeight: "600",
    marginTop: 2,
  },
});
