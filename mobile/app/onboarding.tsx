import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../src/theme";
import { Button } from "../src/components/common/Button";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "s1",
    tag: "VERIFIED AUTHENTICITY",
    title: "Curated Items from Audited Resellers",
    description: "Every merchant on Cartigo undergoes identity, tax, and inventory provenance checks before listing.",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    icon: "shield-checkmark-outline",
  },
  {
    id: "s2",
    tag: "TRANSPARENT MATH",
    title: "Zero Hidden Marketplace Inflation",
    description: "Direct-from-merchant pricing with no artificial convenience surcharges. What you inspect is what you pay.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
    icon: "calculator-outline",
  },
  {
    id: "s3",
    tag: "PROTECTED ESCROW",
    title: "Doorstep Verification & Fast Dispatch",
    description: "Your payment remains securely held in buyer escrow until your order is delivered to your doorstep.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    icon: "lock-closed-outline",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleFinish = () => {
    router.replace("/(tabs)" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>CARTIGO</Text>
          <View style={styles.brandDot} />
        </View>

        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Paged Slides */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: slide.image }} style={styles.image} resizeMode="cover" />
              <View style={styles.iconCircle}>
                <Ionicons name={slide.icon as any} size={28} color={colors.amber[400]} />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.tag}>{slide.tag}</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                activeIndex === i && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <Button
          title={activeIndex === SLIDES.length - 1 ? "Start Shopping →" : "Continue →"}
          onPress={
            activeIndex === SLIDES.length - 1
              ? handleFinish
              : () => {
                  setActiveIndex(activeIndex + 1);
                }
          }
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  skipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.muted,
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    width: width - 64,
    height: 300,
    borderRadius: radius.xl,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.navy[900],
    marginBottom: 32,
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  iconCircle: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.navy[900],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.amber[400],
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  tag: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.amber[600],
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.navy[900],
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 290,
  },
  bottomControls: {
    padding: 24,
    gap: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.navy[900],
  },
  continueBtn: {
    width: "100%",
  },
});
