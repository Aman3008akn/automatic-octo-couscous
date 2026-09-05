import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radius, shadows } from "../../src/theme";
import { api } from "../../src/api/client";
import { Header } from "../../src/components/common/Header";
import { ProductCard } from "../../src/components/product/ProductCard";
import { Product } from "../../src/types";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest Arrivals" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "relevance", label: "Customer Relevance" },
];

export default function ProductListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; categorySlug?: string }>();
  const [sortBy, setSortBy] = useState("newest");
  const [showSortModal, setShowSortModal] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["products", params.q, params.categorySlug, sortBy],
    queryFn: () =>
      api.getProducts({
        q: params.q,
        categorySlug: params.categorySlug,
        sortBy,
      }),
  });

  const products = data?.items || [];
  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || "Sort";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header
        title={params.q ? `"${params.q}"` : params.categorySlug || "All Products"}
        showBack={true}
      />

      {/* Filter & Sort Bar */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.navy[900]} />
          <Text style={styles.controlText}>{currentSortLabel}</Text>
          <Ionicons name="chevron-down" size={12} color={colors.text.muted} />
        </TouchableOpacity>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{products.length} Products</Text>
        </View>
      </View>

      {/* Active Filter Chips */}
      {(params.q || params.categorySlug) && (
        <View style={styles.activeChipsRow}>
          {params.q && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>Query: {params.q}</Text>
              <TouchableOpacity onPress={() => router.setParams({ q: undefined })}>
                <Ionicons name="close" size={14} color={colors.navy[900]} />
              </TouchableOpacity>
            </View>
          )}

          {params.categorySlug && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>Category: {params.categorySlug}</Text>
              <TouchableOpacity onPress={() => router.setParams({ categorySlug: undefined })}>
                <Ionicons name="close" size={14} color={colors.navy[900]} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Products Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard product={item} />
          </View>
        )}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={colors.text.muted} />
              <Text style={styles.emptyTitle}>No matching products</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search terms or filters.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Sort Bottom Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>SORT CATALOG BY</Text>

            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.modalOption,
                  sortBy === opt.id && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSortBy(opt.id);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    sortBy === opt.id && styles.modalOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {sortBy === opt.id && (
                  <Ionicons name="checkmark-sharp" size={18} color={colors.navy[900]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  controlsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  controlText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy[900],
  },
  countBadge: {
    backgroundColor: colors.navy[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[600],
  },
  activeChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.amber[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.navy[900],
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 24,
  },
  gridItem: {
    width: "50%",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.navy[900],
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(18, 23, 43, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  modalOptionActive: {
    backgroundColor: colors.amber[100],
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  modalOptionTextActive: {
    fontWeight: "800",
    color: colors.navy[900],
  },
});
