import { Feather } from "@expo/vector-icons";
import { useGetOrder } from "@workspace/api-client-react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SkeletonBox } from "@/components/SkeletonLoader";
import { useColors } from "@/hooks/useColors";

const STATUS_STEPS = [
  { key: "pending",    label: "Reçue",          icon: "shopping-bag" },
  { key: "confirmed",  label: "Confirmée",       icon: "check-circle" },
  { key: "preparing",  label: "En préparation",  icon: "clock" },
  { key: "ready",      label: "Prête",           icon: "package" },
  { key: "delivering", label: "En livraison",    icon: "truck" },
  { key: "delivered",  label: "Livrée",          icon: "check-circle" },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  delivering: 4,
  delivered: 5,
  cancelled: -1,
};

const PAYMENT_LABELS: Record<string, string> = {
  orange_money: "Orange Money",
  moov_money: "Moov Money",
  cash: "Paiement à la livraison",
};

function StatusTimeline({ status }: { status: string }) {
  const colors = useColors();
  const currentIdx = STATUS_ORDER[status] ?? 0;
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <View style={[styles.cancelledBadge, { backgroundColor: "#FEE2E2", borderColor: "#FECACA" }]}>
        <Feather name="x-circle" size={18} color="#DC2626" />
        <Text style={{ color: "#DC2626", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
          Commande annulée
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isLast = idx === STATUS_STEPS.length - 1;

        const dotColor = isCompleted || isCurrent ? colors.primary : colors.border;
        const lineColor = isCompleted ? colors.primary : colors.border;

        return (
          <View key={step.key} style={styles.timelineRow}>
            {/* Left column: dot + line */}
            <View style={styles.timelineLeft}>
              <View style={[
                styles.dot,
                {
                  borderColor: dotColor,
                  backgroundColor: isCompleted || isCurrent ? colors.primary : colors.background,
                },
              ]}>
                {(isCompleted || isCurrent) && (
                  <Feather
                    name={isCompleted ? "check" : step.icon as any}
                    size={10}
                    color="#fff"
                  />
                )}
              </View>
              {!isLast && (
                <View style={[styles.line, { backgroundColor: lineColor }]} />
              )}
            </View>

            {/* Right column: label */}
            <View style={styles.timelineContent}>
              <Text style={[
                styles.stepLabel,
                {
                  color: isCurrent ? colors.primary : isCompleted ? colors.foreground : colors.mutedForeground,
                  fontFamily: isCurrent ? "Inter_700Bold" : isCompleted ? "Inter_500Medium" : "Inter_400Regular",
                },
              ]}>
                {step.label}
              </Text>
              {isCurrent && (
                <View style={[styles.currentBadge, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={{ color: colors.primary, fontSize: 10, fontFamily: "Inter_600SemiBold" }}>En cours</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = id ?? "";

  const { data: order, isLoading, refetch } = useGetOrder(orderId as any, {
    query: {
      queryKey: ["order", orderId],
      refetchInterval: 30000, // Poll every 30s
    },
  });
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {order ? `Commande #${order.id}` : "Commande"}
        </Text>
        <Pressable onPress={() => refetch()}>
          <Feather name="refresh-cw" size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ padding: 16, gap: 12 }}>
          <SkeletonBox width="50%" height={20} />
          <SkeletonBox width="100%" height={80} />
          <SkeletonBox width="100%" height={120} />
        </View>
      ) : order ? (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 40 }]}>
          {/* Restaurant + date */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardRow}>
              <Text style={[styles.restaurantName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {order.restaurantName}
              </Text>
              <Text style={[styles.dateText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>

          {/* Status timeline */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Suivi de commande
            </Text>
            <StatusTimeline status={order.status} />
          </View>

          {/* Items */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Plats commandés
            </Text>
            {order.items.map((item, idx) => (
              <View key={idx} style={[styles.itemRow, { borderBottomColor: colors.border, borderBottomWidth: idx < order.items.length - 1 ? 1 : 0 }]}>
                <Text style={[styles.itemQty, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{item.quantity}x</Text>
                <Text style={[styles.itemName, { color: colors.foreground, fontFamily: "Inter_400Regular", flex: 1 }]}>{item.dishName}</Text>
                <Text style={[styles.itemPrice, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {item.totalPrice.toLocaleString()} FCFA
                </Text>
              </View>
            ))}
          </View>

          {/* Delivery */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Livraison</Text>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                {order.deliveryAddress}, {order.deliveryCity}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="credit-card" size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </Text>
            </View>
          </View>

          {/* Summary */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Récapitulatif</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Sous-total</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{order.subtotal.toLocaleString()} FCFA</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Livraison</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{order.deliveryFee.toLocaleString()} FCFA</Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: "#16A34A", fontFamily: "Inter_400Regular" }]}>Réduction fidélité</Text>
                <Text style={[styles.summaryValue, { color: "#16A34A", fontFamily: "Inter_500Medium" }]}>-{order.discount.toLocaleString()} FCFA</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{order.total.toLocaleString()} FCFA</Text>
            </View>
            {order.loyaltyPointsEarned > 0 && (
              <View style={[styles.loyaltyRow, { backgroundColor: colors.secondary }]}>
                <Feather name="star" size={14} color={colors.primary} />
                <Text style={[styles.loyaltyText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  +{order.loyaltyPointsEarned} points fidélité {order.status === "delivered" ? "gagnés" : "à gagner"}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 16 }]}>
            Commande introuvable
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20 },
  scroll: { paddingHorizontal: 16, gap: 0 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12, gap: 8 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  restaurantName: { fontSize: 18, flex: 1 },
  dateText: { fontSize: 12 },
  sectionTitle: { fontSize: 15, marginBottom: 10 },
  // Timeline
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", alignItems: "flex-start" },
  timelineLeft: { width: 32, alignItems: "center" },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  line: { width: 2, flex: 1, minHeight: 20, marginVertical: 2 },
  timelineContent: { flex: 1, paddingLeft: 10, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 },
  stepLabel: { fontSize: 14 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  cancelledBadge: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1 },
  // Items
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 },
  itemQty: { fontSize: 14, width: 28 },
  itemName: { fontSize: 14 },
  itemPrice: { fontSize: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 14, flex: 1 },
  // Summary
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14 },
  totalRow: { paddingTop: 10, borderTopWidth: 1, marginTop: 4 },
  totalLabel: { fontSize: 16 },
  totalValue: { fontSize: 18 },
  loyaltyRow: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 8, marginTop: 8 },
  loyaltyText: { fontSize: 13 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
});
