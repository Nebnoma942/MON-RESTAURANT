import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Dish {
  id: number;
  restaurantId: number;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  imageUrl?: string | null;
  available: boolean;
  hasPromotion: boolean;
  promotionPrice?: number | null;
}

interface Props {
  dish: Dish;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function DishCard({ dish, quantity, onAdd, onRemove }: Props) {
  const colors = useColors();
  const displayPrice = dish.hasPromotion && dish.promotionPrice ? dish.promotionPrice : dish.price;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd();
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove();
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: dish.available ? 1 : 0.5 }]}>
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={2}>
            {dish.name}
          </Text>
          {dish.description && (
            <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
              {dish.description}
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {displayPrice.toLocaleString()} FCFA
            </Text>
            {dish.hasPromotion && dish.promotionPrice && (
              <Text style={[styles.originalPrice, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {dish.price.toLocaleString()}
              </Text>
            )}
            {dish.hasPromotion && (
              <View style={[styles.promoBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.promoText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Promo</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.rightSection}>
          {dish.imageUrl ? (
            <Image source={{ uri: dish.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
              <Feather name="coffee" size={24} color={colors.mutedForeground} />
            </View>
          )}
          {dish.available && (
            <View style={styles.quantityControls}>
              {quantity > 0 ? (
                <>
                  <Pressable
                    style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                    onPress={handleRemove}
                  >
                    <Feather name="minus" size={14} color={colors.foreground} />
                  </Pressable>
                  <Text style={[styles.qty, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{quantity}</Text>
                  <Pressable
                    style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                    onPress={handleAdd}
                  >
                    <Feather name="plus" size={14} color="#fff" />
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={[styles.addBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAdd}
                >
                  <Feather name="plus" size={16} color="#fff" />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  content: { flexDirection: "row", gap: 12 },
  textSection: { flex: 1, justifyContent: "space-between" },
  name: { fontSize: 15, marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  price: { fontSize: 15 },
  originalPrice: { fontSize: 12, textDecorationLine: "line-through" },
  promoBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  promoText: { fontSize: 10 },
  rightSection: { alignItems: "center", gap: 8 },
  image: { width: 80, height: 80, borderRadius: 10 },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quantityControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  qty: { fontSize: 15, minWidth: 20, textAlign: "center" },
  addBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
