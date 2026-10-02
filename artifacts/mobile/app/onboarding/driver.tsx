import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function DriverOnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const benefits = [
    { icon: "clock", title: "Horaires flexibles", desc: "Travaillez quand vous voulez, à votre rythme" },
    { icon: "dollar-sign", title: "Revenus immédiats", desc: "Soyez payé rapidement pour chaque livraison" },
    { icon: "map", title: "Multi-entreprises", desc: "L'app livreur fonctionne avec plusieurs plateformes" },
    { icon: "shield", title: "Assurance incluse", desc: "Couverture pour chaque livraison effectuée" },
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
          <View style={[styles.heroIcon, { backgroundColor: "#FEF3C7" }]}>
            <Feather name="truck" size={40} color="#D97706" />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Devenez livreur partenaire
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Rejoignez notre réseau de livraison et gagnez de l'argent en livrant des repas dans votre ville.
          </Text>
        </View>

        <View style={styles.benefitsSection}>
          {benefits.map((b, idx) => (
            <View key={idx} style={[styles.benefitRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.benefitIcon, { backgroundColor: "#FEF3C7" }]}>
                <Feather name={b.icon as any} size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.benefitTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{b.title}</Text>
                <Text style={[styles.benefitDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.multiNote, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={18} color={colors.primary} />
          <Text style={[styles.multiNoteText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            Notre application livreur est une plateforme multi-entreprises. En tant que livreur, vous pouvez accepter des livraisons de plusieurs entreprises partenaires, pas seulement MON RESTAURANT.
          </Text>
        </View>

        <Text style={[styles.appNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Téléchargez l'application livreur séparément pour commencer à effectuer des livraisons et gérer vos courses.
        </Text>

        <Pressable
          style={[styles.ctaBtn, { backgroundColor: "#D97706" }]}
          onPress={() => Linking.openURL("https://play.google.com/store/apps/details?id=com.monrestaurant.driver")}
        >
          <View style={styles.btnInner}>
            <Feather name="download" size={18} color="#fff" />
            <Text style={[styles.ctaBtnText, { fontFamily: "Inter_700Bold" }]}>Télécharger sur Google Play</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.secondaryBtn, { borderColor: "#D97706" }]}
          onPress={() => Linking.openURL("https://apps.apple.com/app/monrestaurant-driver/id0000000000")}
        >
          <View style={styles.btnInner}>
            <Feather name="download" size={18} color="#D97706" />
            <Text style={[styles.secondaryBtnText, { color: "#D97706", fontFamily: "Inter_700Bold" }]}>Télécharger sur l'App Store</Text>
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
  multiNote: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16, alignItems: "flex-start" },
  multiNoteText: { flex: 1, fontSize: 13, lineHeight: 20 },
  appNote: { fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 24 },
  ctaBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  ctaBtnText: { color: "#fff", fontSize: 16 },
  secondaryBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, backgroundColor: "transparent" },
  secondaryBtnText: { fontSize: 16 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 10 },
});
