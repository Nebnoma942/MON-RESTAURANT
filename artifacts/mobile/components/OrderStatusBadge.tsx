import React from "react";
import { StyleSheet, Text, View } from "react-native";

type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

interface Props {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  pending: { label: "En attente", bg: "#FEF3C7", color: "#D97706" },
  confirmed: { label: "Confirmée", bg: "#DBEAFE", color: "#2563EB" },
  preparing: { label: "En préparation", bg: "#EDE9FE", color: "#7C3AED" },
  ready: { label: "Prête", bg: "#D1FAE5", color: "#059669" },
  delivering: { label: "En livraison", bg: "#FEE2E2", color: "#E85D04" },
  delivered: { label: "Livrée", bg: "#D1FAE5", color: "#16A34A" },
  cancelled: { label: "Annulée", bg: "#F3F4F6", color: "#6B7280" },
};

export function OrderStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
