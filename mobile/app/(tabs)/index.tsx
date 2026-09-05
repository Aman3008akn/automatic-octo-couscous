import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radius, shadows } from "../../src/theme";
import { api } from "../../src/api/client";
import { Header } from "../../src/components/common/Header";
import { ProductCard } from "../../src/components/product/ProductCard";
import { formatRupees } from "../../src/utils/format";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Queries
  const { data: banners = [], refetch: refetchBanners, isRefetching: refetchingBanners } = useQuery({
    queryKey: ["banners"],
    queryFn: () => api.getBanners("HERO_CAROUSEL"),
  });

  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
  });

  const { data: productsData, refetch: refetchProducts, isRefetching: refetchingProducts } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => api.getProducts({ take: 8 }),
  });

  const products = productsData?.items || [];

  const handleRefresh = async () => {
    await Promise.all([refetchBanners(), refetchCategories(), refetchProducts()]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refetchingBanners || refetchingProducts}
            onRefresh={handleRefresh}
            colors={[colors.amber[500]]}
            tintColor={colors.amber[500]}
          />
        }
      >
        {/* Delivery Location Bar */}
        <TouchableOpacity
          style={styles.locationBar}
          activeOpacity={0.7}
          onPress={() => router.push("/checkout/address" as any)}
        >
          <Ionicons name="location-sharp" size={14} color={colors.amber[600]} />
          <Text style={styles.locationText} numberOfLines={1}>
            Deliver to <Text style={styles.locationBold}>Aman Shukla • Mumbai 400001</Text>
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.text.secondary} />
        </TouchableOpacity>

        {/* Quick Search Trigger Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => router.push("/search" as any)}
        >
          <Ionicons name="search" size={18} color={colors.text.muted} />
          <Text style={styles.searchPlaceholder}>
            Search products, brands and verified sellers...
          </Text>
        </TouchableOpacity>

        {/* Hero Promotional Banner Carousel */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                setActiveBannerIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {banners.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  activeOpacity={0.9}
                  style={styles.bannerCard}
                  onPress={() => router.push("/products" as any)}
                >
                  <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerTag}>FEATURED DROP</Text>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    <View style={styles.bannerCta}>
                      <Text style={styles.bannerCtaText}>Explore Now →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Carousel Dots */}
            <View style={styles.dotsContainer}>
              {banners.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    activeBannerIndex === i ? styles.activeDot : null,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Categories Rail */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHOP BY CATEGORY</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/categories" as any)}>
            <Text style={styles.sectionLink}>View All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRail}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryPill}
              activeOpacity={0.7}
              onPress={() => router.push(`/products?categorySlug=${cat.slug}` as any)}
            >
              <View style={styles.categoryIconCircle}>
                <Image source={{ uri: cat.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" }} style={styles.categoryImage} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cartigo Limited Drop Showcase Banner */}
        <View style={styles.dropBanner}>
          <View style={styles.dropHeader}>
            <View style={styles.dropTag}>
              <Text style={styles.dropTagText}>CARTIGO DROP #04</Text>
            </View>
            <Text style={styles.dropStockText}>⚡ Only 14 Units Left</Text>
          </View>
          <Text style={styles.dropTitle}>Vanguard Custom Mechanical Keyboard</Text>
          <Text style={styles.dropPrice}>Special Launch Price: {formatRupees(649900)}</Text>
          <TouchableOpacity
            style={styles.dropButton}
            onPress={() => router.push("/products/p2" as any)}
          >
            <Text style={styles.dropButtonText}>Claim Drop Item →</Text>
          </TouchableOpacity>
        </View>

        {/* Popular on Cartigo Grid */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>TRENDING PRODUCTS</Text>
            <Text style={styles.sectionSubtitle}>Top rated items from verified sellers</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/products" as any)}>
            <Text style={styles.sectionLink}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {products.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              <ProductCard product={item} />
            </View>
          ))}
        </View>

        {/* Meet the Builders Section */}
        <View style={styles.buildersCard}>
          <View style={styles.buildersBadge}>
            <Text style={styles.buildersBadgeText}>ENGINEERED WITH PASSION</Text>
          </View>
          <Text style={styles.buildersTitle}>Meet the Builders Behind Cartigo</Text>
          <Text style={styles.buildersBio}>
            Proudly designed and engineered by Aman Shukla (Lead Full-Stack Developer) and Sumit Gautam (Lead UI/UX Designer) to revolutionize Indian verified marketplace shopping.
          </Text>
          <View style={styles.builderAvatars}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" }}
              style={styles.avatar}
            />
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" }}
              style={[styles.avatar, { marginLeft: -12 }]}
            />
            <Text style={styles.builderTeamText}>Cartigo Core Engineering Team</Text>
          </View>
        </View>
      </ScrollView>
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
  contentContainer: {
    paddingBottom: 32,
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.amber[100],
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: colors.navy[900],
    flex: 1,
  },
  locationBold: {
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    gap: 10,
    ...shadows.subtle,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: colors.text.muted,
  },
  bannerSection: {
    marginBottom: 20,
  },
  bannerCard: {
    width: width - 32,
    height: 180,
    marginHorizontal: 16,
    borderRadius: radius.lg,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.navy[900],
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.65,
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  bannerTag: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.amber[400],
    letterSpacing: 1,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 10,
  },
  bannerCta: {
    alignSelf: "flex-start",
    backgroundColor: colors.amber[400],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  bannerCtaText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.navy[900],
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.navy[900],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: colors.navy[900],
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.amber[600],
  },
  categoriesRail: {
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 20,
  },
  categoryPill: {
    alignItems: "center",
    width: 68,
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.amber[400],
    overflow: "hidden",
    marginBottom: 6,
    backgroundColor: colors.white,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
  },
  dropBanner: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.navy[900],
    borderWidth: 1,
    borderColor: colors.navy[600],
    ...shadows.card,
  },
  dropHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dropTag: {
    backgroundColor: colors.amber[500],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dropTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.navy[900],
  },
  dropStockText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.amber[400],
  },
  dropTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 4,
  },
  dropPrice: {
    fontSize: 13,
    color: colors.navy[100],
    marginBottom: 14,
  },
  dropButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: "center",
  },
  dropButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.navy[900],
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  gridItem: {
    width: "50%",
  },
  buildersCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.subtle,
  },
  buildersBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.navy[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginBottom: 8,
  },
  buildersBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.navy[600],
    letterSpacing: 0.5,
  },
  buildersTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.navy[900],
    marginBottom: 6,
  },
  buildersBio: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  builderAvatars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white,
  },
  builderTeamText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[900],
    marginLeft: 4,
  },
});
