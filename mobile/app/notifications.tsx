import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../src/theme";
import { Header } from "../src/components/common/Header";

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Order Dispatched! 🚀",
    message: "Your SonicPro ANC Wireless Headphones have left our Mumbai warehouse. Track your carrier delivery milestones.",
    time: "10 mins ago",
    unread: true,
    icon: "cube-outline",
  },
  {
    id: "n2",
    title: "Cartigo Drop #04 is Live! ⚡",
    message: "Vanguard Custom Mechanical Keyboards are now available for verified members with limited stock.",
    time: "2 hours ago",
    unread: true,
    icon: "flash-outline",
  },
  {
    id: "n3",
    title: "Price Drop on Saved Item",
    message: "Nordic Weatherproof Laptop Daypack 22L dropped by 30% today. Check your wishlist now.",
    time: "Yesterday",
    unread: false,
    icon: "pricetag-outline",
  },
  {
    id: "n4",
    title: "Verified Reseller Program Update",
    message: "Weekly merchant payout reports have been audited and released to your bank account.",
    time: "3 days ago",
    unread: false,
    icon: "checkmark-circle-outline",
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Notifications" showBack={true} />

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationCard, item.unread && styles.unreadCard]}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, item.unread && styles.unreadIconBox]}>
              <Ionicons
                name={item.icon as any}
                size={20}
                color={item.unread ? colors.navy[900] : colors.text.muted}
              />
            </View>

            <View style={styles.textBox}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, item.unread && styles.unreadTitle]}>
                  {item.title}
                </Text>
                {item.unread && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    ...shadows.subtle,
  },
  unreadCard: {
    borderColor: colors.amber[400],
    backgroundColor: "#FFFCF5",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy[50],
    alignItems: "center",
    justifyContent: "center",
  },
  unreadIconBox: {
    backgroundColor: colors.amber[100],
  },
  textBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  unreadTitle: {
    fontWeight: "800",
    color: colors.navy[900],
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.amber[500],
  },
  message: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 6,
    fontWeight: "600",
  },
});
