import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/api/queryClient";
import { useAuthStore } from "../src/store/useAuthStore";
import { colors } from "../src/theme";
import { CartigoLaunchAnimation } from "../src/components/common/CartigoLaunchAnimation";

let hasSeenLaunchAnimation = false;

export default function RootLayout() {
  const restoreSession = useAuthStore((s: any) => s.restoreSession);
  const [showSplash, setShowSplash] = useState(!hasSeenLaunchAnimation);

  useEffect(() => {
    restoreSession();
  }, []);

  const handleSplashFinish = () => {
    hasSeenLaunchAnimation = true;
    setShowSplash(false);
  };

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="products/index" options={{ headerShown: false }} />
          <Stack.Screen name="products/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="checkout/address" options={{ headerShown: false }} />
          <Stack.Screen name="checkout/payment" options={{ headerShown: false }} />
          <Stack.Screen name="checkout/confirmation" options={{ headerShown: false }} />
          <Stack.Screen name="orders/index" options={{ headerShown: false }} />
          <Stack.Screen name="orders/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="help" options={{ headerShown: false }} />
        </Stack>
        {showSplash && <CartigoLaunchAnimation onFinish={handleSplashFinish} />}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
