import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { useCartStore } from "../../store/useCartStore";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  showCart?: boolean;
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showSearch = true,
  showCart = true,
  rightElement,
}) => {
  const router = useRouter();
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBack || (() => router.back())}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandContainer}>
            <Text style={styles.brandTitle}>CARTIGO</Text>
            <View style={styles.brandDot} />
          </View>
        )}

        {title && showBack ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {rightElement}

        {showSearch && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/search" as any)}
          >
            <Ionicons name="search-outline" size={22} color={colors.ink} />
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/(tabs)/cart" as any)}
          >
            <Ionicons name="bag-handle-outline" size={22} color={colors.ink} />
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {itemCount > 99 ? "99+" : itemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: colors.navy[900],
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.amber[500],
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.amber[500],
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.navy[900],
    fontSize: 10,
    fontWeight: "800",
  },
});
