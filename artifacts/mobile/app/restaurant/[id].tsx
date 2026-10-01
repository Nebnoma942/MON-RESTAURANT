import { Feather } from "@expo/vector-icons";
import { useGetRestaurant } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartButton } from "@/components/CartButton";
import { DishCard } from "@/components/DishCard";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { useCart } from "@/context/CartContext";
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

interface DishModalProps {
  dish: Dish;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}

function DishDetailModal({ dish, quantity, onAdd, onRemove, onClose }: DishModalProps) {
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
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={[modalStyles.sheet, { backgroundColor: colors.background }]}>
          {/* Photo */}
          {dish.imageUrl ? (
            <Image source={{ uri: dish.imageUrl }} style={modalStyles.photo} resizeMode="cover" />
          ) : (
            <View style={[modalStyles.photoPlaceholder, { backgroundColor: colors.muted }]}>
              <Feather name="coffee" size={56} color={colors.mutedForeground} />
            </View>
          )}

          {/* Close button */}
          <Pressable
            style={[modalStyles.closeBtn, { backgroundColor: "rgba(0,0,0,0.45)" }]}
            onPress={onClose}
          >
            <Feather name="x" size={20} color="#fff" />
          </Pressable>

          {/* Info */}
          <View style={modalStyles.body}>
            <View style={modalStyles.titleRow}>
              <Text style={[modalStyles.name, { color: colors.foreground, fontFamily: "Inter_700Bold", flex: 1 }]}>
                {dish.name}
              </Text>
              {dish.hasPromotion && (
                <View style={[modalStyles.promoBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={[{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 11 }]}>Promo</Text>
                </View>
              )}
            </View>

            {dish.description ? (
              <Text style={[modalStyles.description, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {dish.description}
              </Text>
            ) : null}

            <View style={modalStyles.priceRow}>
              <Text style={[modalStyles.price, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                {displayPrice.toLocaleString()} FCFA
              </Text>
              {dish.hasPromotion && dish.promotionPrice && (
                <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14, textDecorationLine: "line-through" }]}>
                  {dish.price.toLocaleString()} FCFA
                </Text>
              )}
            </View>

            {/* Controls */}
            {dish.available ? (
              quantity > 0 ? (
                <View style={modalStyles.controls}>
                  <Pressable
                    style={[modalStyles.qtyBtn, { backgroundColor: colors.muted }]}
                    onPress={handleRemove}
                  >
                    <Feather name="minus" size={18} color={colors.foreground} />
                  </Pressable>
                  <Text style={[modalStyles.qty, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {quantity}
                  </Text>
                  <Pressable
                    style={[modalStyles.qtyBtn, { backgroundColor: colors.primary }]}
                    onPress={handleAdd}
                  >
                    <Feather name="plus" size={18} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[modalStyles.addBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAdd}
                >
                  <Feather name="plus" size={18} color="#fff" />
                  <Text style={[modalStyles.addBtnText, { fontFamily: "Inter_700Bold" }]}>
                    Ajouter au panier
                  </Text>
                </Pressable>
              )
            ) : (
              <View style={[modalStyles.unavailable, { backgroundColor: colors.muted }]}>
                <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Indisponible actuellement
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function RestaurantScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurantId = parseInt(id ?? "0", 10);
  const cart = useCart();

  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const { data: restaurant, isLoading } = useGetRestaurant(restaurantId);

  const categories = useMemo(() => {
    if (!restaurant?.dishes) return [];
    const cats = Array.from(new Set(restaurant.dishes.map((d) => d.category)));
    return cats;
  }, [restaurant]);

  const sections = useMemo(() => {
    if (!restaurant?.dishes) return [];
    return categories.map((cat) => ({
      title: cat,
      data: restaurant.dishes.filter((d) => d.category === cat),
    }));
  }, [categories, restaurant]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back button */}
      <Pressable
        style={[styles.backBtn, { top: topInset + 8, backgroundColor: "rgba(255,255,255,0.9)" }]}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={22} color="#1a1a1a" />
      </Pressable>

      {isLoading ? (
        <ScrollView>
          <SkeletonBox width="100%" height={220} borderRadius={0} />
          <View style={{ padding: 16, gap: 10 }}>
            <SkeletonBox width="60%" height={24} />
            <SkeletonBox width="40%" height={16} />
            <SkeletonBox width="80%" height={14} />
          </View>
        </ScrollView>
      ) : restaurant ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 80 : 100 }}
          ListHeaderComponent={
            <View>
              {restaurant.imageUrl ? (
                <Image source={{ uri: restaurant.imageUrl }} style={styles.heroImage} resizeMode="cover" />
              ) : (
                <View style={[styles.heroPlaceholder, { backgroundColor: colors.muted }]}>
                  <Feather name="coffee" size={48} color={colors.mutedForeground} />
                </View>
              )}
              <View style={styles.infoSection}>
                <Text style={[styles.restaurantName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {restaurant.name}
                </Text>
                <Text style={[styles.restaurantType, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  {restaurant.type}
                </Text>
                {restaurant.description && (
                  <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {restaurant.description}
                  </Text>
                )}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather name="star" size={14} color="#F59E0B" />
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {restaurant.rating?.toFixed(1) ?? "Nouveau"} ({restaurant.reviewCount} avis)
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {restaurant.openingHours}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {restaurant.city}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const qty = cart.items.find((i) => i.dishId === item.id)?.quantity ?? 0;
            return (
              <View style={{ paddingHorizontal: 16 }}>
                {/* Tap the card body to open detail modal */}
                <Pressable onPress={() => setSelectedDish(item)}>
                  <DishCard
                    dish={item}
                    quantity={qty}
                    onAdd={() =>
                      cart.addItem(restaurant.id, restaurant.name, {
                        dishId: item.id,
                        dishName: item.name,
                        unitPrice: item.hasPromotion && item.promotionPrice ? item.promotionPrice : item.price,
                        imageUrl: item.imageUrl,
                      })
                    }
                    onRemove={() => {
                      if (qty === 1) cart.removeItem(item.id);
                      else cart.updateQuantity(item.id, qty - 1);
                    }}
                  />
                </Pressable>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.centered}>
          <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Restaurant introuvable
          </Text>
        </View>
      )}

      <CartButton />

      {/* Dish detail modal */}
      {selectedDish && restaurant && (
        <DishDetailModal
          dish={selectedDish}
          quantity={cart.items.find((i) => i.dishId === selectedDish.id)?.quantity ?? 0}
          onAdd={() =>
            cart.addItem(restaurant.id, restaurant.name, {
              dishId: selectedDish.id,
              dishName: selectedDish.name,
              unitPrice: selectedDish.hasPromotion && selectedDish.promotionPrice ? selectedDish.promotionPrice : selectedDish.price,
              imageUrl: selectedDish.imageUrl,
            })
          }
          onRemove={() => {
            const qty = cart.items.find((i) => i.dishId === selectedDish.id)?.quantity ?? 0;
            if (qty === 1) cart.removeItem(selectedDish.id);
            else cart.updateQuantity(selectedDish.id, qty - 1);
          }}
          onClose={() => setSelectedDish(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: { width: "100%", height: 240 },
  heroPlaceholder: { width: "100%", height: 240, alignItems: "center", justifyContent: "center" },
  infoSection: { padding: 16, paddingBottom: 8 },
  restaurantName: { fontSize: 24, marginBottom: 4 },
  restaurantType: { fontSize: 14, marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13 },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  photo: { width: "100%", height: 280 },
  photoPlaceholder: { width: "100%", height: 280, alignItems: "center", justifyContent: "center" },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 20, paddingBottom: 36, gap: 10 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 22, lineHeight: 28 },
  promoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  description: { fontSize: 14, lineHeight: 20 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  price: { fontSize: 24 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 8 },
  qtyBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  qty: { fontSize: 24, minWidth: 32, textAlign: "center" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  addBtnText: { color: "#fff", fontSize: 16 },
  unavailable: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
});
