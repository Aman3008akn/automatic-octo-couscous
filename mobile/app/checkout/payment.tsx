import React, { useState } from "react";
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
import { useCartStore } from "../../src/store/useCartStore";
import { api } from "../../src/api/client";
import { formatRupees } from "../../src/utils/format";

type PaymentMethod = "COD" | "UPI" | "CARD";

export default function CheckoutPaymentScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("COD");
  const [loading, setLoading] = useState(false);

  const { totalCents, clearCart } = useCartStore();

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await api.createOrder({
        line1: "Flat 402, Lotus Tower, Hiranandani Estate",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400076",
        country: "India",
        phone: "+91 98200 12345",
        paymentMethod: selectedMethod === "COD" ? "COD" : "CARD",
      });

      clearCart();
      router.replace({
        pathname: "/checkout/confirmation" as any,
        params: { orderNumber: res.orderNumber, amount: totalCents },
      });
    } catch (err: any) {
      Alert.alert("Order Error", err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Payment Method" showBack={true} showCart={false} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepDotDone}>
            <Ionicons name="checkmark" size={12} color={colors.white} />
          </View>
          <Text style={styles.stepLabelDone}>Address</Text>
          <View style={[styles.stepLine, styles.stepLineActive]} />
          <View style={[styles.stepDot, styles.stepActive]}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={styles.stepLabelActive}>Payment</Text>
          <View style={styles.stepLine} />
          <View style={styles.stepDot}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Confirmation</Text>
        </View>

        <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>

        {/* Method 1: Cash on Delivery */}
        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === "COD" && styles.methodCardSelected]}
          activeOpacity={0.85}
          onPress={() => setSelectedMethod("COD")}
        >
          <View style={styles.methodHeader}>
            <View style={[styles.radioOuter, selectedMethod === "COD" && styles.radioOuterSelected]}>
              {selectedMethod === "COD" && <View style={styles.radioInner} />}
            </View>
            <View style={styles.methodTitleRow}>
              <Text style={styles.methodTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.methodBadge}>VERIFIED</Text>
            </View>
          </View>
          <Text style={styles.methodSubtext}>
            Pay upon receiving package at your doorstep. Zero advance payment needed.
          </Text>
        </TouchableOpacity>

        {/* Method 2: UPI */}
        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === "UPI" && styles.methodCardSelected]}
          activeOpacity={0.85}
          onPress={() => setSelectedMethod("UPI")}
        >
          <View style={styles.methodHeader}>
            <View style={[styles.radioOuter, selectedMethod === "UPI" && styles.radioOuterSelected]}>
              {selectedMethod === "UPI" && <View style={styles.radioInner} />}
            </View>
            <View style={styles.methodTitleRow}>
              <Text style={styles.methodTitle}>UPI (Google Pay / PhonePe / Paytm)</Text>
              <Text style={styles.instantBadge}>⚡ INSTANT</Text>
            </View>
          </View>
          <Text style={styles.methodSubtext}>
            Pay securely with any UPI app on your device.
          </Text>
        </TouchableOpacity>

        {/* Method 3: Cards */}
        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === "CARD" && styles.methodCardSelected]}
          activeOpacity={0.85}
          onPress={() => setSelectedMethod("CARD")}
        >
          <View style={styles.methodHeader}>
            <View style={[styles.radioOuter, selectedMethod === "CARD" && styles.radioOuterSelected]}>
              {selectedMethod === "CARD" && <View style={styles.radioInner} />}
            </View>
            <View style={styles.methodTitleRow}>
              <Text style={styles.methodTitle}>Credit / Debit Card</Text>
            </View>
          </View>
          <Text style={styles.methodSubtext}>
            Visa, MasterCard, RuPay with 256-bit bank encryption.
          </Text>
        </TouchableOpacity>

        {/* Escrow Guarantee */}
        <View style={styles.escrowBox}>
          <Ionicons name="shield-checkmark" size={20} color={colors.status.success} />
          <View style={styles.escrowTextCol}>
            <Text style={styles.escrowTitle}>Cartigo Buyer Escrow Protection</Text>
            <Text style={styles.escrowSub}>
              Merchant is paid only after package is successfully delivered and verified by you.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Place Order Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.bottomTotalValue}>{formatRupees(totalCents)}</Text>
        </View>

        <Button
          title={selectedMethod === "COD" ? "Confirm COD Order →" : "Pay & Place Order →"}
          loading={loading}
          onPress={handlePlaceOrder}
          style={styles.payBtn}
        />
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
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 20,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.navy[50],
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.status.success,
    alignItems: "center",
    justifyContent: "center",
  },
  stepActive: {
    backgroundColor: colors.navy[900],
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.amber[400],
  },
  stepLabelDone: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.status.success,
    marginLeft: 4,
  },
  stepLabelActive: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy[900],
    marginLeft: 4,
  },
  stepLabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginLeft: 4,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.status.success,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  methodCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginBottom: 12,
    ...shadows.subtle,
  },
  methodCardSelected: {
    borderColor: colors.navy[900],
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.navy[900],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.navy[900],
  },
  methodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.navy[900],
  },
  methodBadge: {
    backgroundColor: colors.navy[50],
    fontSize: 9,
    fontWeight: "800",
    color: colors.navy[600],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  instantBadge: {
    backgroundColor: colors.amber[100],
    fontSize: 9,
    fontWeight: "800",
    color: colors.amber[600],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  methodSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
    marginLeft: 32,
  },
  escrowBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.status.successBg,
    padding: 14,
    borderRadius: radius.lg,
    gap: 12,
    marginTop: 8,
  },
  escrowTextCol: {
    flex: 1,
  },
  escrowTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.status.success,
  },
  escrowSub: {
    fontSize: 11,
    color: colors.status.success,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomBar: {
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
  bottomTotalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.navy[900],
  },
  payBtn: {
    paddingHorizontal: 20,
  },
});
