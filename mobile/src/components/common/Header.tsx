import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { useCartStore } from "../../store/useCartStore";
import { CartigoLogo } from "./CartigoLogo";

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
  const itemCount = useCartStore((s: any) => s.itemCount);

  // Reanimated badge bounce
  const badgeScale = useSharedValue(1);

  useEffect(() => {
    if (itemCount > 0) {
      badgeScale.value = withSequence(
        withSpring(1.4, { damping: 6, stiffness: 280 }),
        withSpring(1.0, { damping: 12, stiffness: 160 })
      );
    }
  }, [itemCount]);

  const rBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

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
          <TouchableOpacity
            style={styles.brandContainer}
            onPress={() => router.push("/(tabs)" as any)}
            activeOpacity={0.8}
          >
            <CartigoLogo size={26} color={colors.navy[900]} accentColor={colors.amber[500]} />
            <Text style={styles.brandTitle}>CARTIGO</Text>
            <View style={styles.brandDot} />
          </TouchableOpacity>
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
              <Animated.View style={[styles.badge, rBadgeStyle]}>
                <Text style={styles.badgeText}>
                  {itemCount > 99 ? "99+" : itemCount}
                </Text>
              </Animated.View>
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
    alignItems: "center",
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: colors.navy[900],
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.amber[500],
    marginLeft: -2,
    marginBottom: 4,
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
