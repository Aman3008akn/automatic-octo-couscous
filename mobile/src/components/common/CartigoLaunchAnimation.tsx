import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CartigoLaunchAnimationProps {
  onFinish?: () => void;
  /**
   * Total target animation duration in ms (defaults to 2000ms)
   */
  durationMs?: number;
}

const LETTERS = ["A", "R", "T", "I", "G", "O"];

export function CartigoLaunchAnimation({
  onFinish,
  durationMs = 2000,
}: CartigoLaunchAnimationProps) {
  const [isDone, setIsDone] = useState(false);

  // Animation values
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);

  // The Initial 'C'
  const cOpacity = useSharedValue(0);
  const cScale = useSharedValue(0.7);
  const cTranslateY = useSharedValue(6);

  // Progressive letter shared values
  const letter1 = useSharedValue(0); // A
  const letter2 = useSharedValue(0); // R
  const letter3 = useSharedValue(0); // T
  const letter4 = useSharedValue(0); // I
  const letter5 = useSharedValue(0); // G
  const letter6 = useSharedValue(0); // O

  const letterAnimValues = [letter1, letter2, letter3, letter4, letter5, letter6];

  // Settle animation for the entire wordmark
  const wordmarkSettleScale = useSharedValue(1);

  // Amber arc sweep around C
  const arcProgress = useSharedValue(0);
  const arcScale = useSharedValue(0.6);
  const arcOpacity = useSharedValue(0);

  // Amber sweep shimmer across CARTIGO
  const shimmerTranslateX = useSharedValue(-SCREEN_WIDTH * 0.6);
  const shimmerOpacity = useSharedValue(0);

  // Tagline ("VERIFIED MARKETPLACE")
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(8);

  const triggerHaptic = (style: "light" | "selection") => {
    try {
      if (Platform.OS !== "web") {
        if (style === "light") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } else {
          Haptics.selectionAsync().catch(() => {});
        }
      }
    } catch {
      // Graceful fallback if haptics unavailable
    }
  };

  const handleComplete = () => {
    setIsDone(true);
    if (onFinish) {
      onFinish();
    }
  };

  useEffect(() => {
    // 1. Initial C Reveal (t = 120ms)
    cOpacity.value = withDelay(
      120,
      withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) })
    );
    cScale.value = withDelay(
      120,
      withSpring(1, { damping: 13, stiffness: 130 })
    );
    cTranslateY.value = withDelay(
      120,
      withTiming(0, { duration: 280, easing: Easing.out(Easing.quad) })
    );

    // Subtle tactile tap on C entrance
    const cTimer = setTimeout(() => {
      triggerHaptic("light");
    }, 180);

    // 2. Progressive Typing: C -> CA -> CAR -> CART -> CARTI -> CARTIG -> CARTIGO
    const letterStartDelay = 420;
    const letterInterval = 75; // 75ms between each letter = crisp & intentional
    letterAnimValues.forEach((val, idx) => {
      val.value = withDelay(
        letterStartDelay + idx * letterInterval,
        withSpring(1, { damping: 14, stiffness: 150 })
      );
    });

    // 3. Wordmark completion & settle breath (t = 950ms)
    const settleDelay = letterStartDelay + LETTERS.length * letterInterval + 60;
    wordmarkSettleScale.value = withDelay(
      settleDelay,
      withSequence(
        withTiming(1.02, { duration: 140, easing: Easing.out(Easing.quad) }),
        withTiming(1.0, { duration: 180, easing: Easing.inOut(Easing.quad) })
      )
    );

    // 4. Tagline Reveal (t = 980ms)
    taglineOpacity.value = withDelay(
      settleDelay,
      withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) })
    );
    taglineTranslateY.value = withDelay(
      settleDelay,
      withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) })
    );

    // 5. Amber Arc Sweep around C & Wordmark Shimmer (t = 1150ms)
    const arcDelay = settleDelay + 120;
    arcOpacity.value = withDelay(
      arcDelay,
      withSequence(
        withTiming(1, { duration: 180 }),
        withDelay(260, withTiming(0, { duration: 250 }))
      )
    );
    arcProgress.value = withDelay(
      arcDelay,
      withTiming(1, { duration: 450, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    arcScale.value = withDelay(
      arcDelay,
      withSpring(1.35, { damping: 12, stiffness: 100 })
    );

    // Amber light sweep across the wordmark
    shimmerOpacity.value = withDelay(
      arcDelay,
      withSequence(
        withTiming(0.85, { duration: 120 }),
        withDelay(280, withTiming(0, { duration: 220 }))
      )
    );
    shimmerTranslateX.value = withDelay(
      arcDelay,
      withTiming(SCREEN_WIDTH * 0.6, {
        duration: 480,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );

    const sweepTimer = setTimeout(() => {
      triggerHaptic("selection");
    }, arcDelay + 100);

    // 6. Smooth exit transition to reveal Home Screen (t = 1680ms)
    const exitDelay = Math.max(1600, durationMs - 400);
    containerOpacity.value = withDelay(
      exitDelay,
      withTiming(0, { duration: 360, easing: Easing.inOut(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(handleComplete)();
        }
      })
    );
    containerScale.value = withDelay(
      exitDelay,
      withTiming(1.04, { duration: 360, easing: Easing.out(Easing.cubic) })
    );

    // 7. Safety fallback timer (guarantees completion even if animation thread pauses)
    const safetyTimer = setTimeout(() => {
      handleComplete();
    }, durationMs + 400);

    return () => {
      clearTimeout(cTimer);
      clearTimeout(sweepTimer);
      clearTimeout(safetyTimer);
    };
  }, []);

  // Animated styles
  const rContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const rCStyle = useAnimatedStyle(() => ({
    opacity: cOpacity.value,
    transform: [{ scale: cScale.value }, { translateY: cTranslateY.value }],
  }));

  const rWordmarkWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordmarkSettleScale.value }],
  }));

  const rArcStyle = useAnimatedStyle(() => {
    const rotation = interpolate(arcProgress.value, [0, 1], [0, 360]);
    return {
      opacity: arcOpacity.value,
      transform: [{ scale: arcScale.value }, { rotate: `${rotation}deg` }],
    };
  });

  const rShimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  const rTaglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  if (isDone) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, rContainerStyle]} pointerEvents="none">
      {/* Background radial glow */}
      <View style={styles.backgroundGlow} />

      <View style={styles.contentContainer}>
        {/* Arc Sweep surrounding C */}
        <Animated.View style={[styles.arcWrapper, rArcStyle]}>
          <Svg width={110} height={110} viewBox="0 0 110 110" fill="none">
            <Defs>
              <LinearGradient id="amberArc" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={colors.amber[400]} stopOpacity="0" />
                <Stop offset="50%" stopColor={colors.amber[500]} stopOpacity="0.9" />
                <Stop offset="100%" stopColor={colors.amber[300]} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Circle
              cx="55"
              cy="55"
              r="48"
              stroke="url(#amberArc)"
              strokeWidth="2.5"
              strokeDasharray="90 180"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* Brand Wordmark with progressive typing */}
        <Animated.View style={[styles.wordmarkRow, rWordmarkWrapStyle]}>
          {/* Initial 'C' */}
          <Animated.View style={[styles.letterContainer, rCStyle]}>
            <Text style={[styles.letterText, styles.letterC]}>C</Text>
          </Animated.View>

          {/* Sequential Letters: A R T I G O */}
          {LETTERS.map((letter, index) => {
            const animVal = letterAnimValues[index];
            const rLetterStyle = useAnimatedStyle(() => {
              const opacity = animVal.value;
              const translateY = interpolate(animVal.value, [0, 1], [6, 0]);
              const scale = interpolate(animVal.value, [0, 1], [0.82, 1]);
              return {
                opacity,
                transform: [{ translateY }, { scale }],
              };
            });

            return (
              <Animated.View
                key={letter + index}
                style={[styles.letterContainer, rLetterStyle]}
              >
                <Text style={styles.letterText}>{letter}</Text>
              </Animated.View>
            );
          })}

          {/* Amber Shimmer Ray across the wordmark */}
          <Animated.View style={[styles.shimmerRay, rShimmerStyle]} />
        </Animated.View>

        {/* Elegant Minimalist Tagline */}
        <Animated.View style={[styles.taglineContainer, rTaglineStyle]}>
          <View style={styles.taglineBullet} />
          <Text style={styles.taglineText}>VERIFIED MARKETPLACE</Text>
          <View style={styles.taglineBullet} />
        </Animated.View>
      </View>

      {/* Bottom Secure / Escrow Cue */}
      <View style={styles.bottomFooter}>
        <Text style={styles.footerText}>BUYER PROTECTION • TRANSPARENT MATH</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#080D1A", // Deep Ledger Navy
    zIndex: 99999,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundGlow: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: (SCREEN_WIDTH * 0.9) / 2,
    backgroundColor: "rgba(232, 163, 61, 0.04)", // Subtle Signal Amber ambient glow
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  arcWrapper: {
    position: "absolute",
    left: -28,
    top: -30,
    zIndex: 1,
    pointerEvents: "none",
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  letterContainer: {
    paddingHorizontal: 1.5,
  },
  letterText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#F7F7F5", // Crisp Cartigo Paper
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-condensed",
      default: "sans-serif",
    }),
  },
  letterC: {
    color: "#FFFFFF",
    textShadowColor: "rgba(232, 163, 61, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  shimmerRay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(232, 163, 61, 0.22)",
    transform: [{ skewX: "-20deg" }],
    borderRadius: 12,
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  taglineBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.amber[500],
  },
  taglineText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.amber[500],
    letterSpacing: 4,
  },
  bottomFooter: {
    position: "absolute",
    bottom: 48,
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(148, 163, 184, 0.5)",
    letterSpacing: 2,
  },
});
