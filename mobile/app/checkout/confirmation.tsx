import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, radius, shadows } from "../../src/theme";
import { Button } from "../../src/components/common/Button";
import { formatRupees } from "../../src/utils/format";

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { orderNumber, amount } = useLocalSearchParams<{ orderNumber: string; amount: string }>();

  const checkmarkScale = useSharedValue(0);
  const ringScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    // Tactile success feedback
    try {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch {}

    checkmarkScale.value = withDelay(
      150,
      withSpring(1, { damping: 9, stiffness: 180 })
    );

    ringOpacity.value = withDelay(
      200,
      withTiming(0.4, { duration: 200 })
    );
    ringScale.value = withDelay(
      200,
      withSpring(1.3, { damping: 11, stiffness: 120 })
    );
  }, []);

  const rCheckmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const rRingStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Animated Success Badge with expanding ripple */}
        <View style={styles.iconArea}>
          <Animated.View style={[styles.rippleRing, rRingStyle]} />
          <Animated.View style={[styles.successCircle, rCheckmarkStyle]}>
            <Ionicons name="checkmark-sharp" size={44} color={colors.white} />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.headerBlock}>
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>
            Thank you for shopping on Cartigo. Your order has been placed into our verified dispatch queue.
          </Text>
        </Animated.View>

        {/* Order Details Card */}
        <Animated.View entering={FadeInDown.delay(450).springify()} style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Reference</Text>
            <Text style={styles.orderNumberText}>{orderNumber || "CTG-2026-84912"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.amountText}>
              {amount ? formatRupees(parseInt(amount)) : "₹4,999"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Delivery</Text>
            <Text style={styles.deliveryText}>2–4 Business Days (Express)</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.actions}>
          <Button
            title="Track Order Milestones →"
            onPress={() => router.replace(`/orders/${orderNumber || "CTG-2026-84912"}` as any)}
            style={styles.primaryBtn}
          />

          <Button
            title="Continue Shopping"
            variant="outline"
            onPress={() => router.replace("/(tabs)" as any)}
          />
        </Animated.View>
      </View>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconArea: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: 100,
    height: 100,
  },
  rippleRing: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: colors.status.success,
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.status.success,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  headerBlock: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.navy[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 24,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 30,
    ...shadows.subtle,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.muted,
  },
  orderNumberText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.navy[900],
    fontFamily: "monospace",
  },
  amountText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.navy[900],
  },
  deliveryText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.status.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lineLight,
    marginVertical: 12,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    width: "100%",
  },
});
