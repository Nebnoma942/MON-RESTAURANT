import { Feather } from "@expo/vector-icons";
import { useListOrders } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: orders, isLoading, refetch, isRefetching } = useListOrders({
    query: { queryKey: ["orders"], enabled: isAuthenticated },
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topInset + 12 }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Mes commandes
          </Text>
        </View>
        <View style={styles.centered}>
          <Feather name="lock" size={48} color={colors.mutedForeground} />
          <Text style={[styles.centeredText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Connectez-vous pour voir vos commandes
          </Text>
          <Pressable
            style={[styles.authBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/auth/login" as never)}
          >
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Se connecter</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Mes commandes
        </Text>
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <SkeletonBox width="60%" height={14} />
              <SkeletonBox width="40%" height={12} style={{ marginTop: 8 }} />
              <SkeletonBox width="30%" height={20} style={{ marginTop: 10 }} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={orders ?? []}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={!!(orders && orders.length > 0)}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 + 20 : 100 },
          ]}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Feather name="shopping-bag" size={48} color={colors.mutedForeground} />
              <Text style={[styles.centeredText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Aucune commande pour l'instant
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/order/${item.id}` as never)}
            >
              <View style={styles.orderTop}>
                <Text style={[styles.restaurantName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {item.restaurantName}
                </Text>
                <Text style={[styles.orderDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                </Text>
              </View>
              <Text style={[styles.orderItems, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {item.items.map((i) => `${i.quantity}x ${i.dishName}`).join(", ")}
              </Text>
              <View style={styles.orderBottom}>
                <OrderStatusBadge status={item.status as any} />
                <Text style={[styles.orderTotal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                  {item.total.toLocaleString()} FCFA
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 28 },
  listContent: { paddingHorizontal: 16 },
  orderCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  orderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  restaurantName: { fontSize: 15 },
  orderDate: { fontSize: 12 },
  orderItems: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  orderBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderTotal: { fontSize: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  centeredText: { fontSize: 16, textAlign: "center", paddingHorizontal: 32 },
  authBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
});
