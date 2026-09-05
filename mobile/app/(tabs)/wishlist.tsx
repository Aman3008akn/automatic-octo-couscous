import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../../src/theme";
import { Header } from "../../src/components/common/Header";
import { Button } from "../../src/components/common/Button";
import { useWishlistStore } from "../../src/store/useWishlistStore";
import { useCartStore } from "../../src/store/useCartStore";
import { formatRupees } from "../../src/utils/format";
import { Product } from "../../src/types";

export default function WishlistScreen() {
  const router = useRouter();
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((s: any) => s.addItem);

  const handleMoveToCart = (product: Product) => {
    addItem(product, product.variants?.[0]?.id, 1);
    removeItem(product.id);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={() => router.push(`/products/${item.id}` as any)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>{item.brand || "VERIFIED SELLER"}</Text>
          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push(`/products/${item.id}` as any)}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </TouchableOpacity>

        <Text style={styles.price}>{formatRupees(item.priceCents)}</Text>

        <View style={styles.actions}>
          <Button
            title="Move to Cart"
            size="sm"
            variant="secondary"
            icon={<Ionicons name="cart-outline" size={14} color={colors.navy[900]} />}
            onPress={() => handleMoveToCart(item)}
            style={styles.moveButton}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title={`Wishlist (${items.length})`} showBack={false} />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-dislike-outline" size={48} color={colors.text.muted} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite curated items and monitor price drops in one place.
          </Text>
          <Button
            title="Explore Products →"
            onPress={() => router.push("/products" as any)}
            style={styles.exploreBtn}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    gap: 12,
    ...shadows.subtle,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.navy[50],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 18,
    marginVertical: 3,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.navy[900],
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  moveButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.navy[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy[900],
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  exploreBtn: {
    paddingHorizontal: 24,
  },
});
