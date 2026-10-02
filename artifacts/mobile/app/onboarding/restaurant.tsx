import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function RestaurantOnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const benefits = [
    { icon: "users", title: "Des milliers de clients", desc: "Accédez à une base de clients dans toute la ville" },
    { icon: "trending-up", title: "Augmentez vos ventes", desc: "Les commandes en ligne boostent votre chiffre d'affaires" },
    { icon: "smartphone", title: "App dédiée", desc: "Gérez vos commandes et votre menu depuis votre téléphone" },
    { icon: "bar-chart-2", title: "Statistiques en temps réel", desc: "Suivez vos ventes et performances facilement" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 40 }]}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="briefcase" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Devenez partenaire restaurateur
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Inscrivez votre restaurant sur MON RESTAURANT et touchez des milliers de clients à Ouagadougou et dans les grandes villes du Burkina Faso.
          </Text>
        </View>

        <View style={styles.benefitsSection}>
          {benefits.map((b, idx) => (
            <View key={idx} style={[styles.benefitRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={b.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.benefitTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{b.title}</Text>
                <Text style={[styles.benefitDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.commissionCard, { backgroundColor: colors.secondary, borderColor: colors.primary }]}>
          <Text style={[styles.commissionTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>Commission transparente</Text>
          <Text style={[styles.commissionText, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>
            Seulement 8% de commission sur chaque commande réalisée via notre plateforme.
          </Text>
        </View>

        <Text style={[styles.appNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          L'application restaurateur est disponible séparément. Téléchargez-la pour gérer vos commandes et votre menu directement depuis votre téléphone.
        </Text>

        <Pressable
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() => Linking.openURL("https://mon-restaurant-web.onrender.com")}
        >
          <View style={styles.btnInner}>
            <Feather name="download" size={18} color="#fff" />
            <Text style={[styles.ctaBtnText, { fontFamily: "Inter_700Bold" }]}>Télécharger sur Google Play</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.secondaryBtn, { borderColor: colors.primary }]}
          onPress={() => Linking.openURL("https://apps.apple.com/app/monrestaurant-restaurant/id0000000000")}
        >
          <View style={styles.btnInner}>
            <Feather name="download" size={18} color={colors.primary} />
            <Text style={[styles.secondaryBtnText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>Télécharger sur l'App Store</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  scroll: { paddingHorizontal: 20 },
  hero: { alignItems: "center", paddingVertical: 24 },
  heroIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 26, textAlign: "center", marginBottom: 12 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: "center" },
  benefitsSection: { gap: 10, marginVertical: 20 },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  benefitIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  benefitTitle: { fontSize: 15, marginBottom: 2 },
  benefitDesc: { fontSize: 13, lineHeight: 18 },
  commissionCard: { padding: 16, borderRadius: 14, borderWidth: 1.5, marginBottom: 16 },
  commissionTitle: { fontSize: 16, marginBottom: 6 },
  commissionText: { fontSize: 14, lineHeight: 20 },
  appNote: { fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 24 },
  ctaBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  ctaBtnText: { color: "#fff", fontSize: 16 },
  secondaryBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, backgroundColor: "transparent" },
  secondaryBtnText: { fontSize: 16 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 10 },
});
