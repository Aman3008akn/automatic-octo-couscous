import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../../src/theme";
import { Header } from "../../src/components/common/Header";
import { Button } from "../../src/components/common/Button";
import { Input } from "../../src/components/common/Input";
import { Address } from "../../src/types";

const SAVED_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    line1: "Flat 402, Lotus Tower, Hiranandani Estate",
    line2: "Near City Park",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400076",
    country: "India",
    phone: "+91 98200 12345",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Office",
    line1: "Suite 300, Maker Maxity, BKC",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400051",
    country: "India",
    phone: "+91 98200 54321",
    isDefault: false,
  },
];

export default function CheckoutAddressScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("addr-1");
  const [showAddForm, setShowAddForm] = useState(false);

  // New Address Form State
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  const handleContinue = () => {
    router.push("/checkout/payment" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Delivery Address" showBack={true} showCart={false} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepActive]}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <Text style={styles.stepLabelActive}>Address</Text>
          <View style={styles.stepLine} />
          <View style={styles.stepDot}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Payment</Text>
          <View style={styles.stepLine} />
          <View style={styles.stepDot}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Confirmation</Text>
        </View>

        <Text style={styles.sectionTitle}>SELECT DELIVERY ADDRESS</Text>

        {SAVED_ADDRESSES.map((addr) => {
          const isSelected = selectedId === addr.id;
          return (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addressCard, isSelected && styles.addressCardSelected]}
              activeOpacity={0.85}
              onPress={() => setSelectedId(addr.id)}
            >
              <View style={styles.radioRow}>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.labelTag}>
                  <Text style={styles.labelText}>{addr.label}</Text>
                </View>
              </View>

              <Text style={styles.addressLine}>{addr.line1}</Text>
              {addr.line2 && <Text style={styles.addressLine}>{addr.line2}</Text>}
              <Text style={styles.addressCity}>
                {addr.city}, {addr.state} - {addr.postalCode}
              </Text>
              <Text style={styles.phoneText}>📞 Contact: {addr.phone}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Add New Address Button */}
        {!showAddForm ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.navy[900]} />
            <Text style={styles.addBtnText}>+ Add New Address</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Enter Delivery Details</Text>
            <Input
              label="Flat / House / Street Address *"
              placeholder="e.g. Flat 101, Palm Grove"
              value={line1}
              onChangeText={setLine1}
            />
            <Input
              label="City *"
              placeholder="e.g. Mumbai"
              value={city}
              onChangeText={setCity}
            />
            <Input
              label="State *"
              placeholder="e.g. Maharashtra"
              value={state}
              onChangeText={setState}
            />
            <Input
              label="Postal Code (PIN) *"
              placeholder="e.g. 400001"
              keyboardType="number-pad"
              value={postalCode}
              onChangeText={setPostalCode}
            />
            <Input
              label="Contact Phone Number *"
              placeholder="+91 98000 00000"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Continue Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Proceed to Payment →"
          onPress={handleContinue}
          style={styles.continueBtn}
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
  stepActive: {
    backgroundColor: colors.navy[900],
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.amber[400],
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginBottom: 12,
    ...shadows.subtle,
  },
  addressCardSelected: {
    borderColor: colors.navy[900],
    backgroundColor: colors.white,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
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
  labelTag: {
    backgroundColor: colors.navy[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  labelText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.navy[600],
    textTransform: "uppercase",
  },
  addressLine: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 18,
  },
  addressCity: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  phoneText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.navy[900],
    marginTop: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 14,
    gap: 8,
    marginTop: 6,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy[900],
  },
  addForm: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 12,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.navy[900],
    marginBottom: 14,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadows.elevated,
  },
  continueBtn: {
    width: "100%",
  },
});
