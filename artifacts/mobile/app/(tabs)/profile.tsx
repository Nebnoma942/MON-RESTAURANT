import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuRow({ icon, label, onPress, danger }: MenuRowProps) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? "#FEE2E2" : colors.secondary }]}>
        <Feather name={icon as any} size={18} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? colors.destructive : colors.foreground, fontFamily: "Inter_500Medium" }]}>
        {label}
      </Text>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await logout();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? bottomInset + 84 + 20 : 100 }}
    >
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Profil</Text>
      </View>

      {isAuthenticated && user ? (
        <>
          {/* Avatar + Name */}
          <View style={[styles.avatarSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[styles.userName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {user.name}
              </Text>
              <Text style={[styles.userPhone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {user.phone}
              </Text>
              <View style={[styles.loyaltyBadge, { backgroundColor: colors.secondary }]}>
                <Feather name="star" size={12} color={colors.primary} />
                <Text style={[styles.loyaltyText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  {user.loyaltyPoints} points
                </Text>
              </View>
            </View>
          </View>

          {/* Menu */}
          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              MON COMPTE
            </Text>
            <MenuRow icon="user" label="Modifier mon profil" onPress={() => router.push("/profile/edit" as never)} />
            <MenuRow icon="map-pin" label="Mes adresses" onPress={() => router.push("/profile/addresses" as never)} />
            <MenuRow icon="star" label="Programme fidélité" onPress={() => router.push("/loyalty" as never)} />
          </View>

          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              APPLICATIONS
            </Text>
            <MenuRow
              icon="briefcase"
              label="Devenir restaurateur"
              onPress={() => router.push("/onboarding/restaurant" as never)}
            />
            <MenuRow
              icon="truck"
              label="Devenir livreur"
              onPress={() => router.push("/onboarding/driver" as never)}
            />
          </View>

          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              SUPPORT
            </Text>
            <MenuRow icon="help-circle" label="Aide & Support" onPress={() => {}} />
            <MenuRow icon="shield" label="Confidentialité" onPress={() => {}} />
            <MenuRow icon="log-out" label="Se déconnecter" onPress={handleLogout} danger />
          </View>
        </>
      ) : (
        <View style={styles.guestSection}>
          <View style={[styles.guestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.guestAvatar, { backgroundColor: colors.muted }]}>
              <Feather name="user" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.guestTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Rejoignez EatBF
            </Text>
            <Text style={[styles.guestSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Créez un compte pour accéder à votre historique de commandes, programme de fidélité et plus encore.
            </Text>
            <Pressable
              style={[styles.loginBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/auth/login" as never)}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
                Se connecter
              </Text>
            </Pressable>
            
          </View>

          {/* Partner CTA */}
          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              REJOINDRE NOTRE RÉSEAU
            </Text>
            <MenuRow icon="briefcase" label="Devenir restaurateur" onPress={() => router.push("/onboarding/restaurant" as never)} />
            <MenuRow icon="truck" label="Devenir livreur" onPress={() => router.push("/onboarding/driver" as never)} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 28 },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 26, color: "#fff" },
  userName: { fontSize: 17 },
  userPhone: { fontSize: 14, marginTop: 2 },
  loyaltyBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 6, alignSelf: "flex-start" },
  loyaltyText: { fontSize: 12 },
  menuSection: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 12, marginBottom: 8, letterSpacing: 0.5 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15 },
  guestSection: {},
  guestCard: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 24,
  },
  guestAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  guestTitle: { fontSize: 20, marginBottom: 8 },
  guestSub: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  loginBtn: { width: "100%", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  registerLink: { fontSize: 15 },
});
