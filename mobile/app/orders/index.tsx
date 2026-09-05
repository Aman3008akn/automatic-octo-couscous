import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radius, shadows } from "../../src/theme";
import { Header } from "../../src/components/common/Header";
import { Badge } from "../../src/components/common/Badge";
import { Button } from "../../src/components/common/Button";
import { api } from "../../src/api/client";
import { formatRupees, formatDate } from "../../src/utils/format";
import { Order } from "../../src/types";

export default function OrderHistoryScreen() {
  const router = useRouter();

  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => api.getOrders(),
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "SHIPPED":
        return "info";
      case "PAID":
      case "FULFILLING":
        return "warning";
      case "CANCELLED":
        return "danger";
      default:
        return "navy";
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/orders/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Badge label={item.status} variant={getStatusVariant(item.status)} />
      </View>

      <View style={styles.itemsSnapshot}>
        {item.items.map((it, idx) => (
          <Text key={idx} style={styles.snapshotText} numberOfLines={1}>
            • {it.quantity}x {it.titleSnapshot}
          </Text>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.totalLabel}>TOTAL PAID</Text>
          <Text style={styles.totalValue}>{formatRupees(item.totalCents)}</Text>
        </View>

        <View style={styles.trackAction}>
          <Text style={styles.trackText}>Track Order</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.amber[600]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="My Orders" showBack={true} />

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color={colors.text.muted} />
          <Text style={styles.emptyTitle}>No Orders Placed Yet</Text>
          <Text style={styles.emptySubtitle}>
            When you purchase verified items, your order history and live shipment tracking will appear here.
          </Text>
          <Button
            title="Browse Catalog →"
            onPress={() => router.push("/(tabs)" as any)}
          />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.subtle,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.navy[900],
    fontFamily: "monospace",
  },
  orderDate: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  itemsSnapshot: {
    backgroundColor: colors.navy[50],
    padding: 10,
    borderRadius: radius.md,
    gap: 4,
    marginVertical: 8,
  },
  snapshotText: {
    fontSize: 12,
    color: colors.navy[900],
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.navy[900],
  },
  trackAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trackText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.amber[600],
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy[900],
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 8,
  },
});
