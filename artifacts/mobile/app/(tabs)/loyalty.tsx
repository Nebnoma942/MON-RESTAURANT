import { Feather } from "@expo/vector-icons";
import { useGetLoyalty } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SkeletonBox } from "@/components/SkeletonLoader";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoyaltyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const { data: loyalty, isLoading } = useGetLoyalty({
    query: { queryKey: ["loyalty"], enabled: isAuthenticated },
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const points = loyalty?.points ?? user?.loyaltyPoints ?? 0;
  const progressPct = Math.min((points % 15) / 15, 1);

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topInset + 12 }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Programme fidélité
          </Text>
        </View>
        <View style={styles.centered}>
          <Feather name="star" size={48} color={colors.mutedForeground} />
          <Text style={[styles.centeredText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Connectez-vous pour accéder à votre programme de fidélité
          </Text>
          <Pressable style={[styles.authBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/auth/login" as never)}>
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
          Programme fidélité
        </Text>
      </View>

      <FlatList
        data={isLoading ? [] : (loyalty?.history ?? [])}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={!!(loyalty?.history?.length)}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 + 20 : 100 },
        ]}
        ListHeaderComponent={
          <View>
            {/* Points Card */}
            <View style={[styles.pointsCard, { backgroundColor: colors.primary }]}>
              <Text style={[styles.pointsLabel, { color: "rgba(255,255,255,0.8)", fontFamily: "Inter_500Medium" }]}>
                Vos points fidélité
              </Text>
              {isLoading ? (
                <SkeletonBox width={80} height={48} borderRadius={8} style={{ marginVertical: 8 }} />
              ) : (
                <Text style={[styles.pointsValue, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                  {points}
                </Text>
              )}
              <Text style={[styles.pointsSubtitle, { color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" }]}>
                1 point = 1 000 FCFA dépensés
              </Text>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBg, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                  <View style={[styles.progressFill, { width: `${progressPct * 100}%` as any, backgroundColor: "#fff" }]} />
                </View>
                <Text style={[styles.progressText, { color: "rgba(255,255,255,0.9)", fontFamily: "Inter_500Medium" }]}>
                  {points % 15} / 15 points → 1 000 FCFA de réduction
                </Text>
              </View>
            </View>

            {/* How it works */}
            <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.rulesTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Comment ça marche ?
              </Text>
              {[
                { icon: "shopping-bag", text: "1 point pour chaque 1 000 FCFA dépensés" },
                { icon: "gift", text: "15 points = 1 000 FCFA de réduction sur votre prochaine commande" },
                { icon: "clock", text: "Les points sont crédités après livraison" },
              ].map((rule, idx) => (
                <View key={idx} style={styles.ruleRow}>
                  <View style={[styles.ruleIcon, { backgroundColor: colors.secondary }]}>
                    <Feather name={rule.icon as any} size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.ruleText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                    {rule.text}
                  </Text>
                </View>
              ))}
            </View>

            {loyalty?.history?.length ? (
              <Text style={[styles.historyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Historique
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyHistory}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Aucun historique pour l'instant
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.historyItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.pointsDot, { backgroundColor: item.points > 0 ? colors.success : colors.destructive }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.historyDesc, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {item.description}
              </Text>
              <Text style={[styles.historyDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {new Date(item.createdAt).toLocaleDateString("fr-FR")}
              </Text>
            </View>
            <Text style={[styles.historyPoints, { color: item.points > 0 ? colors.success : colors.destructive, fontFamily: "Inter_700Bold" }]}>
              {item.points > 0 ? "+" : ""}{item.points}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 28 },
  listContent: { paddingHorizontal: 16 },
  pointsCard: { borderRadius: 20, padding: 24, marginBottom: 16, alignItems: "center" },
  pointsLabel: { fontSize: 14, marginBottom: 4 },
  pointsValue: { fontSize: 56, lineHeight: 64 },
  pointsSubtitle: { fontSize: 13, marginBottom: 16 },
  progressContainer: { width: "100%", gap: 6 },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: "center" },
  rulesCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20, gap: 12 },
  rulesTitle: { fontSize: 15, marginBottom: 4 },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  ruleIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  ruleText: { fontSize: 14, flex: 1, lineHeight: 20 },
  historyTitle: { fontSize: 16, marginBottom: 12 },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  pointsDot: { width: 10, height: 10, borderRadius: 5 },
  historyDesc: { fontSize: 14 },
  historyDate: { fontSize: 12, marginTop: 2 },
  historyPoints: { fontSize: 16 },
  emptyHistory: { alignItems: "center", paddingTop: 16 },
  emptyText: { fontSize: 14 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  centeredText: { fontSize: 16, textAlign: "center", paddingHorizontal: 32 },
  authBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
});
