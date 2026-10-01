import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Restaurant {
  id: number;
  name: string;
  type: string;
  description?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount: number;
  city: string;
  openingHours: string;
  status: string;
}

interface Props {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: Props) {
  const colors = useColors();
  const router = useRouter();

  const isOpen = restaurant.status === "approved";

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.95 : 1 }]}
      onPress={() => router.push(`/restaurant/${restaurant.id}` as never)}
    >
      <View style={styles.imageContainer}>
        {restaurant.imageUrl ? (
          <Image source={{ uri: restaurant.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
            <Feather name="coffee" size={32} color={colors.mutedForeground} />
          </View>
        )}
        {isOpen && (
          <View style={[styles.openBadge, { backgroundColor: colors.success }]}>
            <Text style={styles.openBadgeText}>Ouvert</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {restaurant.name}
          </Text>
        </View>
        <Text style={[styles.type, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{restaurant.type}</Text>
        <View style={styles.meta}>
          <View style={styles.rating}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {restaurant.rating ? restaurant.rating.toFixed(1) : "Nouveau"} ({restaurant.reviewCount})
            </Text>
          </View>
          <View style={styles.location}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={[styles.locationText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {restaurant.city}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 160 },
  imagePlaceholder: { width: "100%", height: 160, alignItems: "center", justifyContent: "center" },
  openBadge: { position: "absolute", top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  openBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  info: { padding: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 16, flex: 1 },
  type: { fontSize: 13, marginTop: 2, marginBottom: 8 },
  meta: { flexDirection: "row", alignItems: "center", gap: 12 },
  rating: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12 },
  location: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 12 },
});
