import { Feather } from "@expo/vector-icons";
import { useLoginUser } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLoginUser();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await loginMutation.mutateAsync({ data: { phone, password } });
      await login(result.token, result.user as any);
      router.back();
    } catch {
      Alert.alert("Erreur", "Numéro ou mot de passe incorrect.");
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topInset + 20, paddingBottom: bottomInset + 40 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>

        <View style={styles.titleSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.secondary }]}>
            <Feather name="coffee" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Bon retour !</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Connectez-vous à votre compte EatBF
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Numéro de téléphone</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Feather name="phone" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="+226 XX XX XX XX"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Mot de passe</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.primary, opacity: loginMutation.isPending ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            <Text style={[styles.loginBtnText, { fontFamily: "Inter_700Bold" }]}>
              {loginMutation.isPending ? "Connexion..." : "Se connecter"}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <Pressable
            style={[styles.registerBtn, { borderColor: colors.border }]}
            onPress={() => router.replace("/auth/register" as never)}
          >
            <Text style={[styles.registerBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Créer un compte
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 32 },
  titleSection: { alignItems: "center", marginBottom: 36 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 28, marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: "center" },
  form: { gap: 0 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, marginBottom: 6 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15 },
  loginBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  loginBtnText: { color: "#fff", fontSize: 16 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 14 },
  registerBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1.5 },
  registerBtnText: { fontSize: 16 },
});
