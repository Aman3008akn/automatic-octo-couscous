import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../../theme";
import { Product } from "../../types";
import { formatRupees, formatPercent } from "../../utils/format";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";

interface ProductCardProps {
  product: Product;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, style }) => {
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const inWishlist = isInWishlist(product.id);

  const handlePress = () => {
    router.push(`/products/${product.id}` as any);
  };

  const handleAddToCart = (e: any) => {
    addItem(product, product.primaryVariant?.id || product.variants?.[0]?.id, 1);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[styles.card, style]}
    >
      {/* Thumbnail Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Discount Badge */}
        {product.discountPercent ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {formatPercent(product.discountPercent)}
            </Text>
          </View>
        ) : null}

        {/* Wishlist Heart Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(product)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={inWishlist ? "heart" : "heart-outline"}
            size={18}
            color={inWishlist ? colors.status.danger : colors.ink}
          />
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand || "VERIFIED SELLER"}
        </Text>

        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Rating & Stock */}
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color={colors.amber[500]} />
            <Text style={styles.ratingText}>4.8</Text>
          </View>

          {product.availableStock <= 5 && product.availableStock > 0 ? (
            <Text style={styles.stockAlert}>Only {product.availableStock} left</Text>
          ) : null}
        </View>

        {/* Price & Add to Cart Button */}
        <View style={styles.footer}>
          <View style={styles.priceColumn}>
            <Text style={styles.price}>{formatRupees(product.priceCents)}</Text>
            {product.compareAtCents && product.compareAtCents > product.priceCents ? (
              <Text style={styles.comparePrice}>
                {formatRupees(product.compareAtCents)}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color={colors.navy[900]} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    flex: 1,
    margin: 6,
    ...shadows.subtle,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: colors.navy[50],
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.status.danger,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  discountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.subtle,
  },
  info: {
    padding: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  brand: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 18,
    minHeight: 36,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.amber[100],
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.amber[600],
  },
  stockAlert: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.status.danger,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
    paddingTop: 8,
  },
  priceColumn: {
    flex: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.navy[900],
  },
  comparePrice: {
    fontSize: 11,
    color: colors.text.muted,
    textDecorationLine: "line-through",
    marginTop: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.amber[400],
    alignItems: "center",
    justifyContent: "center",
  },
});
