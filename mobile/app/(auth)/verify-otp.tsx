import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../../src/theme";
import { Button } from "../../src/components/common/Button";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await login("mock-jwt-otp-token", {
        id: "usr-otp-verified",
        email: "verified@cartigo.in",
        name: "Aman Shukla",
        phone: "+91 98200 12345",
        role: "CUSTOMER",
      });
      router.replace("/(tabs)" as any);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (text: string, index: number) => {
    const updated = [...otp];
    updated[index] = text;
    setOtp(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Verify One-Time Password</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit security code to your registered mobile number: <Text style={styles.phoneText}>+91 98200 12345</Text>
          </Text>
        </View>

        {/* 6 Digit OTP Inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.otpBox, digit.length > 0 && styles.otpBoxFilled]}
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend code in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(30)}>
              <Text style={styles.resendLink}>Resend OTP Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          title="Verify & Continue →"
          loading={loading}
          onPress={handleVerify}
          style={styles.verifyBtn}
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
    padding: 24,
  },
  backBtn: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.navy[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  phoneText: {
    fontWeight: "700",
    color: colors.navy[900],
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: colors.navy[900],
  },
  otpBoxFilled: {
    borderColor: colors.navy[900],
  },
  resendRow: {
    alignItems: "center",
    marginBottom: 30,
  },
  timerText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  resendLink: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.amber[600],
  },
  verifyBtn: {
    width: "100%",
  },
});
