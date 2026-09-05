import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../src/theme";
import { Header } from "../src/components/common/Header";

const FAQS = [
  {
    q: "How does Cartigo Buyer Escrow protection work?",
    a: "When you place an order, your payment is securely retained in our buyer escrow account. The merchant is only credited after your item is delivered, inspected, and accepted at your doorstep.",
  },
  {
    q: "What is the return and replacement window?",
    a: "Cartigo offers a standard 14-day hassle-free acceptance guarantee on all sealed and verified merchant products. If an item arrives damaged or misrepresented, reverse pickup is free.",
  },
  {
    q: "How are Cartigo partner resellers verified?",
    a: "Every merchant undergoes identity, business tax (GST), and warehouse inventory audits before their listings appear on the Cartigo marketplace.",
  },
  {
    q: "Can I pay with Cash on Delivery (COD)?",
    a: "Yes, COD is supported across over 19,000 pincodes in India with zero upfront payment requirements.",
  },
];

export default function HelpScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSupportCall = () => {
    Linking.openURL("tel:+911800123456");
  };

  const handleSupportEmail = () => {
    Linking.openURL("mailto:support@cartigo.in?subject=Customer%20Support%20Inquiry");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Help & Support" showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Support Channels Banner */}
        <View style={styles.contactBanner}>
          <Text style={styles.contactTitle}>24/7 Dedicated Support</Text>
          <Text style={styles.contactSub}>
            Have an issue with your delivery or payment? Our customer care specialists are always here.
          </Text>

          <View style={styles.contactButtonsRow}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleSupportCall}
            >
              <Ionicons name="call" size={16} color={colors.navy[900]} />
              <Text style={styles.contactButtonText}>Call 1800-123-456</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleSupportEmail}
            >
              <Ionicons name="mail" size={16} color={colors.navy[900]} />
              <Text style={styles.contactButtonText}>Email Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionHeader}>FREQUENTLY ASKED QUESTIONS</Text>

        <View style={styles.faqList}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  activeOpacity={0.7}
                  onPress={() => toggleFaq(index)}
                >
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.navy[900]}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Operating Hours */}
        <View style={styles.hoursCard}>
          <Ionicons name="time-outline" size={20} color={colors.text.muted} />
          <View style={styles.hoursTextCol}>
            <Text style={styles.hoursTitle}>Customer Service Hours</Text>
            <Text style={styles.hoursSub}>
              Monday to Sunday: 8:00 AM – 11:00 PM IST
            </Text>
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
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  contactBanner: {
    backgroundColor: colors.navy[900],
    borderRadius: radius.xl,
    padding: 20,
    ...shadows.card,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.white,
    marginBottom: 4,
  },
  contactSub: {
    fontSize: 12,
    color: colors.navy[100],
    lineHeight: 18,
    marginBottom: 16,
  },
  contactButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.amber[400],
    paddingVertical: 10,
    borderRadius: radius.md,
    gap: 6,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.navy[900],
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginLeft: 4,
    marginTop: 6,
  },
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    ...shadows.subtle,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy[900],
    lineHeight: 18,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
    paddingTop: 10,
  },
  faqAnswer: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  hoursCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    marginTop: 8,
  },
  hoursTextCol: {
    flex: 1,
  },
  hoursTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy[900],
  },
  hoursSub: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
});
