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
import { Button } from "../../src/components/common/Button";
import { Input } from "../../src/components/common/Input";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your email/phone and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate quick auth & sign-in
      await login("mock-jwt-token-12345", {
        id: "usr-current",
        email: identifier.includes("@") ? identifier : `${identifier}@cartigo.in`,
        name: identifier.split("@")[0] || "Aman Shukla",
        phone: "+91 98200 12345",
        role: "CUSTOMER",
      });

      router.replace("/(tabs)" as any);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    router.replace("/(tabs)" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandTitle}>CARTIGO</Text>
            <View style={styles.brandDot} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to access your orders, saved addresses, and verified reseller catalog.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Form Inputs */}
        <View style={styles.form}>
          <Input
            label="Email or Mobile Phone *"
            placeholder="e.g. aman@cartigo.in or 9820012345"
            keyboardType="email-address"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
            leftIcon={<Ionicons name="person-outline" size={18} color={colors.text.muted} />}
          />

          <Input
            label="Password *"
            placeholder="Enter your account password"
            isPassword={true}
            value={password}
            onChangeText={setPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.text.muted} />}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push("/(auth)/verify-otp" as any)}
          >
            <Text style={styles.forgotText}>Login via One-Time Password (OTP) →</Text>
          </TouchableOpacity>

          <Button
            title="Sign In to Cartigo"
            loading={loading}
            onPress={handleLogin}
            style={styles.loginBtn}
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Guest Action */}
        <Button
          title="Continue as Guest Buyer"
          variant="outline"
          onPress={handleGuestContinue}
        />

        {/* Sign Up Link */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have a Cartigo account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup" as any)}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
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
    padding: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  header: {
    marginBottom: 28,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    color: colors.navy[900],
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.amber[500],
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.navy[900],
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  errorBox: {
    backgroundColor: colors.status.dangerBg,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.danger,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: colors.status.danger,
    fontWeight: "600",
  },
  form: {
    marginBottom: 20,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.amber[600],
  },
  loginBtn: {
    width: "100%",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  signupText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  signupLink: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.navy[900],
  },
});
