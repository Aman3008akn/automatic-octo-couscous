import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../../src/theme";
import { Header } from "../../src/components/common/Header";
import { Button } from "../../src/components/common/Button";
import { Badge } from "../../src/components/common/Badge";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of Cartigo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const isReseller = user?.role === "APPROVED_RESELLER" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="My Account" showBack={false} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.name || "Aman Shukla"}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || "aman@cartigo.in"}
            </Text>
            <View style={styles.roleRow}>
              <Badge
                label={isReseller ? "APPROVED RETAILER" : "VERIFIED BUYER"}
                variant={isReseller ? "warning" : "success"}
              />
            </View>
          </View>
        </View>

        {/* Quick Order Shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcutItem}
            activeOpacity={0.75}
            onPress={() => router.push("/orders" as any)}
          >
            <View style={styles.shortcutIconBg}>
              <Ionicons name="cube-outline" size={22} color={colors.navy[900]} />
            </View>
            <Text style={styles.shortcutText}>My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutItem}
            activeOpacity={0.75}
            onPress={() => router.push("/(tabs)/wishlist" as any)}
          >
            <View style={styles.shortcutIconBg}>
              <Ionicons name="heart-outline" size={22} color={colors.navy[900]} />
            </View>
            <Text style={styles.shortcutText}>Wishlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutItem}
            activeOpacity={0.75}
            onPress={() => router.push("/checkout/address" as any)}
          >
            <View style={styles.shortcutIconBg}>
              <Ionicons name="location-outline" size={22} color={colors.navy[900]} />
            </View>
            <Text style={styles.shortcutText}>Addresses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutItem}
            activeOpacity={0.75}
            onPress={() => router.push("/help" as any)}
          >
            <View style={styles.shortcutIconBg}>
              <Ionicons name="headset-outline" size={22} color={colors.navy[900]} />
            </View>
            <Text style={styles.shortcutText}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Retailer / Reseller Management Hub */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>RESELLER & MERCHANT PORTAL</Text>
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push("/orders" as any)}
            >
              <Ionicons name="storefront-outline" size={20} color={colors.amber[600]} />
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Seller Catalog & Inventory</Text>
                <Text style={styles.menuSubtitle}>Manage ON / OFF and Private products</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push("/orders" as any)}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={colors.navy[900]} />
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Add New Product</Text>
                <Text style={styles.menuSubtitle}>Upload gallery photos and set listing price</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES & SECURITY</Text>
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push("/notifications" as any)}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.navy[900]} />
              <Text style={styles.menuTitleSimple}>Notification Preferences</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push("/help" as any)}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.navy[900]} />
              <Text style={styles.menuTitleSimple}>Privacy & Security Policy</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Auth Button */}
        <View style={styles.authContainer}>
          <Button
            title="Log Out of Account"
            variant="outline"
            icon={<Ionicons name="log-out-outline" size={18} color={colors.navy[900]} />}
            onPress={handleLogout}
          />
          <Text style={styles.versionText}>Cartigo Native Mobile • v1.0.0 (Production Build)</Text>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 14,
    ...shadows.subtle,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.navy[900],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.amber[400],
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.navy[900],
  },
  profileEmail: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  roleRow: {
    marginTop: 6,
  },
  shortcutsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 18,
    gap: 10,
  },
  shortcutItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.subtle,
  },
  shortcutIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.navy[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[900],
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: colors.text.muted,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuBox: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy[900],
  },
  menuTitleSimple: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy[900],
  },
  menuSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.lineLight,
    marginLeft: 46,
  },
  authContainer: {
    marginTop: 10,
    alignItems: "center",
    gap: 12,
  },
  versionText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: "600",
  },
});
