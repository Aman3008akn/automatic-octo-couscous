import React from "react";
import {
  View,
  Text,
  ScrollView,
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
import { useCartStore } from "../../src/store/useCartStore";
import { useWishlistStore } from "../../src/store/useWishlistStore";
import { formatRupees } from "../../src/utils/format";
import { CartItem } from "../../src/types";

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const toggleWishlist = useWishlistStore((s: any) => s.toggleWishlist);

  const freeDeliveryThreshold = 199900; // ₹1,999
  const remainingForFreeDelivery = freeDeliveryThreshold - subtotalCents;
  const progress = Math.min(1, Math.max(0, subtotalCents / freeDeliveryThreshold));

  const handleSaveForLater = (item: CartItem) => {
    toggleWishlist({
      id: item.productId,
      slug: item.productId,
      title: item.title,
      description: "",
      categoryName: "Cart Item",
      categorySlug: "general",
      imageUrl: item.imageUrl,
      priceCents: item.priceCents,
      sellerName: item.sellerName,
      availableStock: item.availableStock,
    });
    removeItem(item.cartItemId || item.id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header
        title={`Cart (${itemCount})`}
        showBack={false}
        rightElement={
          items.length > 0 ? (
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-handle-outline" size={48} color={colors.text.muted} />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse our catalog to discover authentic verified items and seasonal drops.
          </Text>
          <Button
            title="Start Shopping →"
            onPress={() => router.push("/(tabs)" as any)}
            style={styles.shopButton}
          />
        </View>
      ) : (
        <View style={styles.container}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Free Delivery Bar */}
            <View style={styles.freeDeliveryCard}>
              <View style={styles.freeDeliveryHeader}>
                <Ionicons
                  name={remainingForFreeDelivery <= 0 ? "checkmark-circle" : "car-outline"}
                  size={16}
                  color={remainingForFreeDelivery <= 0 ? colors.status.success : colors.navy[900]}
                />
                <Text style={styles.freeDeliveryTitle}>
                  {remainingForFreeDelivery <= 0
                    ? "You unlocked FREE Standard Delivery! 🎉"
                    : `Add ${formatRupees(remainingForFreeDelivery)} more for FREE Delivery`}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>
            </View>

            {/* Cart Items List */}
            <View style={styles.itemsList}>
              {items.map((item: CartItem) => (
                <View key={item.cartItemId || item.id} style={styles.itemCard}>
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />

                  <View style={styles.itemDetails}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeItem(item.cartItemId || item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close" size={18} color={colors.text.muted} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemSeller}>
                      Sold by <Text style={styles.itemSellerBold}>{item.sellerName}</Text>
                    </Text>

                    <View style={styles.itemPriceRow}>
                      <Text style={styles.itemPrice}>{formatRupees(item.priceCents)}</Text>

                      {/* Quantity Selector */}
                      <View style={styles.qtyContainer}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                        >
                          <Ionicons
                            name={item.quantity === 1 ? "trash-outline" : "remove"}
                            size={14}
                            color={colors.navy[900]}
                          />
                        </TouchableOpacity>

                        <Text style={styles.qtyText}>{item.quantity}</Text>

                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={14} color={colors.navy[900]} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Save for later link */}
                    <TouchableOpacity
                      style={styles.saveLaterBtn}
                      onPress={() => handleSaveForLater(item)}
                    >
                      <Ionicons name="bookmark-outline" size={12} color={colors.text.secondary} />
                      <Text style={styles.saveLaterText}>Save for later</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Order Price Breakdown */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>PRICE DETAILS</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
                <Text style={styles.summaryValue}>{formatRupees(subtotalCents)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Standard Delivery</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    shippingCents === 0 ? styles.freeDeliveryText : null,
                  ]}
                >
                  {shippingCents === 0 ? "FREE" : formatRupees(shippingCents)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated GST (18%)</Text>
                <Text style={styles.summaryValue}>{formatRupees(taxCents)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>{formatRupees(totalCents)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Checkout Bottom Bar */}
          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.checkoutTotalLabel}>TOTAL DUE</Text>
              <Text style={styles.checkoutTotalValue}>{formatRupees(totalCents)}</Text>
            </View>

            <Button
              title="Proceed to Checkout →"
              onPress={() => router.push("/checkout/address" as any)}
              style={styles.checkoutBtn}
            />
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
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  clearText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.status.danger,
    marginRight: 6,
  },
  freeDeliveryCard: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  freeDeliveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  freeDeliveryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy[900],
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.navy[50],
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.status.success,
  },
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    ...shadows.subtle,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.navy[50],
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    flex: 1,
    paddingRight: 6,
    lineHeight: 18,
  },
  itemSeller: {
    fontSize: 11,
    color: colors.text.muted,
    marginVertical: 2,
  },
  itemSellerBold: {
    color: colors.navy[600],
    fontWeight: "600",
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.navy[900],
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.navy[50],
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  saveLaterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  saveLaterText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.navy[900],
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  freeDeliveryText: {
    color: colors.status.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.navy[900],
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.navy[900],
  },
  checkoutBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadows.elevated,
  },
  checkoutTotalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
  },
  checkoutTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.navy[900],
  },
  checkoutBtn: {
    paddingHorizontal: 20,
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
  shopButton: {
    paddingHorizontal: 24,
  },
});
