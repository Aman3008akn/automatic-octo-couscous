import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radius, shadows } from "../../src/theme";
import { api } from "../../src/api/client";
import { Header } from "../../src/components/common/Header";
import { Button } from "../../src/components/common/Button";
import { Badge } from "../../src/components/common/Badge";
import { formatRupees, formatPercent } from "../../src/utils/format";
import { useCartStore } from "../../src/store/useCartStore";
import { useWishlistStore } from "../../src/store/useWishlistStore";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const addItem = useCartStore((s: any) => s.addItem);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.getProductById(id!),
    enabled: !!id,
  });

  if (isLoading || !product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header showBack={true} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.navy[900]} />
          <Text style={styles.loaderText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const gallery = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const variants = product.variants && product.variants.length > 0 ? product.variants : [
    {
      id: "v-default",
      sku: "SKU-DEF",
      priceCents: product.priceCents,
      compareAtCents: product.compareAtCents,
      availableStock: product.availableStock,
      options: { standard: "Default" },
    },
  ];

  const selectedVariant = variants[selectedVariantIndex] || variants[0];
  const priceCents = selectedVariant.priceCents || product.priceCents;
  const compareAtCents = selectedVariant.compareAtCents || product.compareAtCents;

  const handleAddToCart = () => {
    addItem(product, selectedVariant.id, 1);
  };

  const handleBuyNow = () => {
    addItem(product, selectedVariant.id, 1);
    router.push("/checkout/address" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header
        title={product.title}
        showBack={true}
        rightElement={
          <TouchableOpacity
            style={styles.headerWishlist}
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons
              name={inWishlist ? "heart" : "heart-outline"}
              size={22}
              color={inWishlist ? colors.status.danger : colors.ink}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Paged Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e: any) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {gallery.map((img: string, i: number) => (
              <View key={i} style={styles.imageSlide}>
                <Image source={{ uri: img }} style={styles.galleryImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>

          {/* Image Dots Indicator */}
          {gallery.length > 1 && (
            <View style={styles.dotsContainer}>
              {gallery.map((_: string, i: number) => (
                <View
                  key={i}
                  style={[styles.dot, activeImageIndex === i && styles.activeDot]}
                />
              ))}
            </View>
          )}

          {/* Condition / Verification Tag */}
          <View style={styles.conditionTag}>
            <Text style={styles.conditionText}>
              ✓ {product.condition || "Factory Sealed New"}
            </Text>
          </View>
        </View>

        {/* Product Details Header */}
        <View style={styles.mainInfo}>
          <Text style={styles.brand}>{product.brand || "VERIFIED SELLER"}</Text>
          <Text style={styles.title}>{product.title}</Text>

          {/* Rating Row */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={14} color={colors.amber[500]} />
              ))}
              <Text style={styles.ratingScore}>4.8</Text>
            </View>
            <Text style={styles.ratingCount}>• 128 verified ratings</Text>
          </View>

          {/* Price Block */}
          <View style={styles.priceBlock}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatRupees(priceCents)}</Text>
              {compareAtCents && compareAtCents > priceCents ? (
                <>
                  <Text style={styles.comparePrice}>{formatRupees(compareAtCents)}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {formatPercent(product.discountPercent || 30)}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
            <Text style={styles.taxNote}>Inclusive of all applicable GST and taxes</Text>
          </View>

          {/* Variant Selector */}
          {variants.length > 1 && (
            <View style={styles.variantsSection}>
              <Text style={styles.variantLabel}>SELECT VARIANT</Text>
              <View style={styles.variantsRow}>
                {variants.map((v: any, i: number) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.variantPill,
                      selectedVariantIndex === i && styles.variantPillActive,
                    ]}
                    onPress={() => setSelectedVariantIndex(i)}
                  >
                    <Text
                      style={[
                        styles.variantText,
                        selectedVariantIndex === i && styles.variantTextActive,
                      ]}
                    >
                      {Object.values(v.options || {})[0] || v.sku}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Stock Availability */}
          <View style={styles.stockRow}>
            <Ionicons name="shield-checkmark" size={16} color={colors.status.success} />
            <Text style={styles.stockText}>
              In Stock: <Text style={styles.stockBold}>{selectedVariant.availableStock} units</Text> ready for dispatch
            </Text>
          </View>

          {/* Seller Trust Banner */}
          <View style={styles.sellerCard}>
            <Ionicons name="business-outline" size={24} color={colors.navy[900]} />
            <View style={styles.sellerTextCol}>
              <Text style={styles.sellerName}>Sold by {product.sellerName}</Text>
              <Text style={styles.sellerBadge}>
                {product.sellerFulfillment === "cartigo"
                  ? "⚡ Cartigo Express Warehouse Fulfillment"
                  : "🛡️ Verified Partner Direct Dispatch"}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.descTitle}>PRODUCT DESCRIPTION</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Specifications Table */}
          {product.attributes && product.attributes.length > 0 && (
            <View style={styles.specsSection}>
              <Text style={styles.descTitle}>TECHNICAL SPECIFICATIONS</Text>
              <View style={styles.specsTable}>
                {product.attributes.map((attr: any, index: number) => (
                  <View key={index} style={styles.specRow}>
                    <Text style={styles.specKey}>{attr.key}</Text>
                    <Text style={styles.specValue}>{attr.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>TOTAL PRICE</Text>
          <Text style={styles.bottomPrice}>{formatRupees(priceCents)}</Text>
        </View>

        <View style={styles.bottomButtons}>
          <Button
            title="Add to Cart"
            variant="outline"
            size="md"
            icon={<Ionicons name="cart-outline" size={16} color={colors.navy[900]} />}
            onPress={handleAddToCart}
            style={styles.btnAddToCart}
          />
          <Button
            title="Buy Now"
            variant="secondary"
            size="md"
            onPress={handleBuyNow}
            style={styles.btnBuyNow}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  headerWishlist: {
    padding: 6,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 30,
  },
  galleryContainer: {
    width: "100%",
    height: 320,
    backgroundColor: colors.white,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  imageSlide: {
    width,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  activeDot: {
    width: 16,
    backgroundColor: colors.navy[900],
  },
  conditionTag: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: colors.navy[900],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.amber[400],
  },
  mainInfo: {
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  brand: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 24,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.navy[900],
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.text.muted,
  },
  priceBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.navy[900],
  },
  comparePrice: {
    fontSize: 14,
    color: colors.text.muted,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: colors.status.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  discountText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  taxNote: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  variantsSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
  },
  variantLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.navy[900],
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  variantsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  variantPillActive: {
    borderColor: colors.navy[900],
    backgroundColor: colors.navy[900],
  },
  variantText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  variantTextActive: {
    color: colors.amber[400],
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    backgroundColor: colors.status.successBg,
    padding: 10,
    borderRadius: radius.md,
  },
  stockText: {
    fontSize: 12,
    color: colors.status.success,
  },
  stockBold: {
    fontWeight: "800",
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.navy[50],
    padding: 14,
    borderRadius: radius.lg,
    marginTop: 16,
    gap: 12,
  },
  sellerTextCol: {
    flex: 1,
  },
  sellerName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.navy[900],
  },
  sellerBadge: {
    fontSize: 11,
    color: colors.navy[600],
    marginTop: 2,
    fontWeight: "600",
  },
  descSection: {
    marginTop: 20,
  },
  descTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.navy[900],
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  specsSection: {
    marginTop: 20,
  },
  specsTable: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  specRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  specKey: {
    width: "40%",
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy[900],
  },
  specValue: {
    width: "60%",
    fontSize: 12,
    color: colors.text.secondary,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadows.elevated,
  },
  bottomPriceCol: {
    justifyContent: "center",
  },
  bottomPriceLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.navy[900],
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 8,
  },
  btnAddToCart: {
    paddingHorizontal: 14,
  },
  btnBuyNow: {
    paddingHorizontal: 18,
  },
});
