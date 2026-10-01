import { Feather } from "@expo/vector-icons";
import { useRegisterUser } from "@workspace/api-client-react";
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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useRegisterUser();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Mot de passe", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await registerMutation.mutateAsync({
        data: { name, phone, email: email || undefined, password, role: "client" },
      });
      await login(result.token, result.user as any);
      router.back();
    } catch (err: any) {
      Alert.alert("Erreur", err?.message ?? "Impossible de créer le compte.");
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topInset + 20, paddingBottom: bottomInset + 40 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>

        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Créer un compte</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Rejoignez MON RESTAURANT et profitez de repas livrés chez vous
          </Text>
        </View>

        <View style={styles.form}>
          {[
            { label: "Nom complet *", icon: "user", value: name, setter: setName, placeholder: "Votre nom", keyboard: "default" as const },
            { label: "Numéro de téléphone *", icon: "phone", value: phone, setter: setPhone, placeholder: "+226 XX XX XX XX", keyboard: "phone-pad" as const },
            { label: "Email (optionnel)", icon: "mail", value: email, setter: setEmail, placeholder: "vous@email.com", keyboard: "email-address" as const },
          ].map((field) => (
            <View key={field.label} style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{field.label}</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Feather name={field.icon as any} size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.keyboard}
                  autoCapitalize={field.keyboard === "default" ? "words" : "none"}
                />
              </View>
            </View>
          ))}

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Mot de passe *</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Min. 6 caractères"
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
            style={[styles.registerBtn, { backgroundColor: colors.primary, opacity: registerMutation.isPending ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={registerMutation.isPending}
          >
            <Text style={[styles.registerBtnText, { fontFamily: "Inter_700Bold" }]}>
              {registerMutation.isPending ? "Création..." : "Créer mon compte"}
            </Text>
          </Pressable>

          <Pressable style={styles.loginLink} onPress={() => router.replace("/auth/login" as never)}>
            <Text style={[styles.loginLinkText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Déjà un compte ?{" "}
              <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Se connecter</Text>
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
  backBtn: { marginBottom: 28 },
  titleSection: { marginBottom: 28 },
  title: { fontSize: 28, marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  form: {},
  field: { marginBottom: 14 },
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
  registerBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  registerBtnText: { color: "#fff", fontSize: 16 },
  loginLink: { alignItems: "center", marginTop: 16 },
  loginLinkText: { fontSize: 14 },
});
