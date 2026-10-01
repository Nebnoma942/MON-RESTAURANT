import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

export function CartButton() {
  const colors = useColors();
  const cart = useCart();
  const router = useRouter();

  if (cart.itemCount === 0) return null;

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.primary }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/cart" as never);
      }}
    >
      <View style={styles.left}>
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Text style={styles.badgeText}>{cart.itemCount}</Text>
        </View>
        <Text style={styles.label}>Voir le panier</Text>
      </View>
      <Text style={styles.total}>{cart.total.toLocaleString()} FCFA</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 34 + 10 : 10,
    left: 16,
    right: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
    ...Platform.select({
      ios: { shadowColor: "#E85D04", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  badge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  label: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  total: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
