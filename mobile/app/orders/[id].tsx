import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radius, shadows } from "../../src/theme";
import { Header } from "../../src/components/common/Header";
import { Badge } from "../../src/components/common/Badge";
import { Button } from "../../src/components/common/Button";
import { api } from "../../src/api/client";
import { formatRupees, formatDate } from "../../src/utils/format";

const TRACKING_STEPS = [
  { key: "confirmed", title: "Order Confirmed", subtitle: "Verified by Cartigo merchant network" },
  { key: "payment", title: "Payment Secured", subtitle: "Buyer escrow protection activated" },
  { key: "warehouse", title: "Warehouse Processing", subtitle: "Quality check and barcode scanning completed" },
  { key: "shipped", title: "In Transit with Express Courier", subtitle: "Air freight dispatch tracking active" },
  { key: "delivered", title: "Package Delivered", subtitle: "Handed over to customer" },
];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => api.getOrderById(id!),
    enabled: !!id,
  });

  const handleCancel = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? An automatic refund will be processed to your original payment method.",
      [
        { text: "No, Keep Order", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            Alert.alert("Order Cancelled", "Your order has been cancelled and refunded.");
            router.back();
          },
        },
      ]
    );
  };

  const currentStepIndex = order?.status === "DELIVERED" ? 4 : order?.status === "SHIPPED" ? 3 : 2;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Shipment Tracking" showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Header Summary */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.orderLabel}>ORDER REFERENCE</Text>
              <Text style={styles.orderNumber}>{order?.orderNumber || id}</Text>
            </View>
            <Badge label={order?.status || "IN_TRANSIT"} variant="info" />
          </View>

          <View style={styles.divider} />

          <View style={styles.deliveryEstimateRow}>
            <Ionicons name="time" size={18} color={colors.amber[600]} />
            <Text style={styles.deliveryEstimateText}>
              Estimated Delivery: <Text style={styles.boldText}>Tomorrow, by 8:00 PM</Text>
            </Text>
          </View>
        </View>

        {/* Milestone Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>SHIPMENT MILESTONES</Text>

          <View style={styles.timeline}>
            {TRACKING_STEPS.map((step, index) => {
              const isDone = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === TRACKING_STEPS.length - 1;

              return (
                <View key={step.key} style={styles.timelineStep}>
                  {/* Left Column: Icon + Vertical Line */}
                  <View style={styles.stepIndicatorCol}>
                    <View
                      style={[
                        styles.timelineDot,
                        isDone && styles.timelineDotDone,
                        isCurrent && styles.timelineDotCurrent,
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={12} color={colors.white} />
                      ) : (
                        <View style={styles.dotInner} />
                      )}
                    </View>

                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          index < currentStepIndex && styles.timelineLineDone,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Step Info */}
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isDone && styles.stepTitleDone,
                        isCurrent && styles.stepTitleCurrent,
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Address Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>DELIVERY DESTINATION</Text>
          <Text style={styles.infoName}>Aman Shukla</Text>
          <Text style={styles.infoLine}>Flat 402, Lotus Tower, Hiranandani Estate</Text>
          <Text style={styles.infoLine}>Mumbai, Maharashtra - 400076</Text>
          <Text style={styles.infoPhone}>📞 +91 98200 12345</Text>
        </View>

        {/* Order Items Summary */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>ITEMS IN THIS PACKAGE</Text>
          {order?.items.map((it, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemTitle}>
                {it.quantity}x {it.titleSnapshot}
              </Text>
              <Text style={styles.itemPrice}>
                {formatRupees(it.unitPriceCentsSnap * it.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid ({order?.paymentMethod || "CARD"})</Text>
            <Text style={styles.totalPrice}>{formatRupees(order?.totalCents || 499900)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button
            title="Need Help with this Order?"
            variant="outline"
            icon={<Ionicons name="help-circle-outline" size={16} color={colors.navy[900]} />}
            onPress={() => router.push("/help" as any)}
            style={styles.actionBtn}
          />

          {order?.status !== "DELIVERED" && order?.status !== "CANCELLED" && (
            <Button
              title="Cancel Order"
              variant="ghost"
              onPress={handleCancel}
              textStyle={{ color: colors.status.danger }}
            />
          )}
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
    gap: 16,
  },
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.subtle,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.navy[900],
    fontFamily: "monospace",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lineLight,
    marginVertical: 12,
  },
  deliveryEstimateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliveryEstimateText: {
    fontSize: 13,
    color: colors.navy[900],
  },
  boldText: {
    fontWeight: "800",
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.subtle,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineStep: {
    flexDirection: "row",
    gap: 14,
  },
  stepIndicatorCol: {
    alignItems: "center",
    width: 24,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.navy[50],
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineDotDone: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  timelineDotCurrent: {
    backgroundColor: colors.amber[500],
    borderColor: colors.amber[400],
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.muted,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 38,
    backgroundColor: colors.line,
    marginVertical: 2,
  },
  timelineLineDone: {
    backgroundColor: colors.status.success,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 22,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.muted,
  },
  stepTitleDone: {
    color: colors.navy[900],
  },
  stepTitleCurrent: {
    color: colors.navy[900],
    fontWeight: "800",
  },
  stepSubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  infoName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.navy[900],
    marginBottom: 2,
  },
  infoLine: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  infoPhone: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.navy[900],
    marginTop: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  itemTitle: {
    fontSize: 12,
    color: colors.ink,
    flex: 1,
    paddingRight: 10,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy[900],
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy[900],
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.navy[900],
  },
  actionsRow: {
    gap: 8,
  },
  actionBtn: {
    width: "100%",
  },
});
