import { Feather } from "@expo/vector-icons";
import { useCreateOrder } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
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
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

const PAYMENT_METHODS = [
  { id: "orange_money" as const, label: "Orange Money", icon: "smartphone", color: "#FF6600" },
  { id: "moov_money" as const, label: "Moov Money", icon: "smartphone", color: "#0066CC" },
];

const PAYMENT_NUMBERS: Record<string, string> = {
  orange_money: process.env.EXPO_PUBLIC_ORANGE_MONEY_NUMBER || "Numéro Orange Money de la plateforme",
  moov_money: process.env.EXPO_PUBLIC_MOOV_MONEY_NUMBER || "Numéro Moov Money de la plateforme",
};

interface PaymentInstructionProps {
  orderId: number;
  amount: number;
  method: "orange_money" | "moov_money";
  onClose: () => void;
}

function PaymentInstructionModal({ orderId, amount, method, onClose }: PaymentInstructionProps) {
  const colors = useColors();
  const number = PAYMENT_NUMBERS[method]!;
  const label = method === "orange_money" ? "Orange Money" : "Moov Money";
  const accentColor = method === "orange_money" ? "#FF6600" : "#0066CC";

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.payIcon, { backgroundColor: accentColor + "20" }]}>
              <Feather name="smartphone" size={28} color={accentColor} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Instructions de paiement
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Finalisez votre commande via {label}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.stepNum, { backgroundColor: accentColor }]}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Composez le numéro
                </Text>
                <Text style={[styles.stepNumber, { color: accentColor, fontFamily: "Inter_700Bold" }]}>
                  {number}
                </Text>
              </View>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.stepNum, { backgroundColor: accentColor }]}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Montant à envoyer
                </Text>
                <Text style={[styles.stepNumber, { color: accentColor, fontFamily: "Inter_700Bold" }]}>
                  {amount.toLocaleString()} FCFA
                </Text>
              </View>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.stepNum, { backgroundColor: accentColor }]}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Référence de paiement
                </Text>
                <Text style={[styles.stepNumber, { color: accentColor, fontFamily: "Inter_700Bold" }]}>
                  ORDER-{orderId}
                </Text>
                <Text style={[styles.stepHint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Indiquez cette référence dans le motif du virement
                </Text>
              </View>
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.primary + "40" }]}>
              <Feather name="info" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                Votre commande sera confirmée par le restaurant dès réception du paiement. Vous pouvez suivre son avancement dans « Mes commandes ».
              </Text>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <Pressable
              style={[styles.confirmBtn, { backgroundColor: accentColor }]}
              onPress={onClose}
            >
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={[styles.confirmBtnText, { fontFamily: "Inter_700Bold" }]}>Fermer et attendre la confirmation</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cart = useCart();
  const { isAuthenticated, login } = useAuth();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Ouagadougou");
  const [paymentMethod, setPaymentMethod] = useState<"orange_money" | "moov_money">("orange_money");
  const [pendingPayment, setPendingPayment] = useState<{ orderId: number; amount: number; method: "orange_money" | "moov_money" } | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | null>(null);
  const [deliveryZoneName, setDeliveryZoneName] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Guest info (when not authenticated)
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const createOrder = useCreateOrder();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const total = cart.total + (deliveryFee ?? 1000);

  // Get the customer's position early so the delivery quote shown before
  // checkout matches the fee recalculated by the server when the order is created.
  useEffect(() => {
    let cancelled = false;

    const loadLocationAndQuote = async () => {
      if (!cart.restaurantId || !city.trim()) return;

      setLocationLoading(true);
      try {
        let coords: { lat: number; lng: number } | null = customerCoords;
        if (!coords) {
          try {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status === "granted") {
              const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
              coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              if (!cancelled) setCustomerCoords(coords);
            }
          } catch {
            // The quote endpoint can still return the city's fallback fee.
          }
        }

        if (cancelled) return;
        setQuoteLoading(true);

        const params = new URLSearchParams({
          restaurantId: String(cart.restaurantId),
          city: city.trim(),
        });
        if (coords) {
          params.set("lat", String(coords.lat));
          params.set("lng", String(coords.lng));
        }

        const response = await fetch(`/api/delivery/quote?${params.toString()}`);
        if (!response.ok) throw new Error("Unable to calculate delivery fee");
        const quote = await response.json() as {
          fee: number;
          distanceKm: number | null;
          zoneName: string | null;
        };

        if (!cancelled) {
          setDeliveryFee(quote.fee);
          setDeliveryDistanceKm(quote.distanceKm);
          setDeliveryZoneName(quote.zoneName);
        }
      } catch {
        if (!cancelled) {
          setDeliveryFee(null);
          setDeliveryDistanceKm(null);
          setDeliveryZoneName(null);
        }
      } finally {
        if (!cancelled) {
          setLocationLoading(false);
          setQuoteLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void loadLocationAndQuote();
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cart.restaurantId, city, customerCoords]);

  const handleOrder = async () => {
    if (!address.trim()) {
      Alert.alert("Adresse requise", "Veuillez entrer votre adresse de livraison.");
      return;
    }
    if (!cart.restaurantId) return;

    if (!isAuthenticated && (!guestName.trim() || !guestPhone.trim())) {
      Alert.alert("Informations requises", "Entrez votre nom et numéro de téléphone pour passer la commande.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setLocationLoading(true);
      let lat: number | undefined = customerCoords?.lat;
      let lng: number | undefined = customerCoords?.lng;
      if (lat === undefined || lng === undefined) {
        try {
          const permission = await Location.requestForegroundPermissionsAsync();
          if (permission.status === "granted") {
            const position = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            lat = position.coords.latitude;
            lng = position.coords.longitude;
          }
        } catch {
          // Address text remains valid when GPS is unavailable.
        }
      }
      setLocationLoading(false);

      const order = await createOrder.mutateAsync({
        data: {
          restaurantId: cart.restaurantId,
          items: cart.items.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
          deliveryAddress: address,
          deliveryCity: city,
          paymentMethod,
          ...(lat !== undefined && { deliveryLat: lat }),
          ...(lng !== undefined && { deliveryLng: lng }),
          ...(!isAuthenticated && { guestName: guestName.trim(), guestPhone: guestPhone.trim() }),
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cart.clearCart();

      setPendingPayment({ orderId: order.id, amount: order.total, method: paymentMethod });
    } catch {
      Alert.alert("Erreur", "Impossible de passer la commande. Réessayez.");
    }
  };

  const handlePaymentDone = () => {
    setPendingPayment(null);
    router.replace("/(tabs)/orders" as never);
  };

  const isSubmitting = createOrder.isPending || locationLoading;

  if (cart.itemCount === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topInset + 12 }]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Panier</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <Feather name="shopping-cart" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Votre panier est vide
          </Text>
          <Pressable
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/" as never)}
          >
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Explorer les restaurants</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Panier</Text>
        <Pressable onPress={cart.clearCart}>
          <Feather name="trash-2" size={20} color={colors.destructive} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 100 }]}>
        <Text style={[styles.restaurantName, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          {cart.restaurantName}
        </Text>

        {/* Items */}
        {cart.items.map((item) => (
          <View key={item.dishId} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.qtyBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.qtyText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{item.quantity}</Text>
            </View>
            <Text style={[styles.itemName, { color: colors.foreground, fontFamily: "Inter_500Medium", flex: 1 }]}>
              {item.dishName}
            </Text>
            <View style={styles.itemActions}>
              <Text style={[styles.itemPrice, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {(item.unitPrice * item.quantity).toLocaleString()} FCFA
              </Text>
              <Pressable onPress={() => cart.removeItem(item.dishId)}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>
        ))}

        {/* Guest info — shown only when not logged in */}
        {!isAuthenticated && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Vos coordonnées
            </Text>
            <View style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Feather name="user" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.inputText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Votre prénom / nom"
                placeholderTextColor={colors.mutedForeground}
                value={guestName}
                onChangeText={setGuestName}
              />
            </View>
            <View style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, marginTop: 8 }]}>
              <Feather name="phone" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.inputText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="+226 XX XX XX XX"
                placeholderTextColor={colors.mutedForeground}
                value={guestPhone}
                onChangeText={setGuestPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        )}

        {/* Delivery address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Adresse de livraison
          </Text>
          <View style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.inputText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="Entrez votre adresse..."
              placeholderTextColor={colors.mutedForeground}
              value={address}
              onChangeText={setAddress}
            />
          </View>
          <View style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, marginTop: 8 }]}>
            <Feather name="navigation" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.inputText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="Ville"
              placeholderTextColor={colors.mutedForeground}
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Mode de paiement
          </Text>
          {PAYMENT_METHODS.map((pm) => (
            <Pressable
              key={pm.id}
              style={[
                styles.paymentOption,
                {
                  borderColor: paymentMethod === pm.id ? pm.color : colors.border,
                  backgroundColor: paymentMethod === pm.id ? pm.color + "15" : colors.card,
                },
              ]}
              onPress={() => setPaymentMethod(pm.id)}
            >
              <View style={[styles.paymentIconBox, { backgroundColor: pm.color + "20" }]}>
                <Feather name={pm.icon as any} size={18} color={pm.color} />
              </View>
              <Text style={[styles.paymentLabel, { color: paymentMethod === pm.id ? pm.color : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {pm.label}
              </Text>
              {paymentMethod === pm.id && <Feather name="check-circle" size={18} color={pm.color} />}
            </Pressable>
          ))}
          <View style={[styles.payNotice, { backgroundColor: colors.secondary, borderColor: colors.primary + "40" }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[styles.payNoticeText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
              Les instructions de paiement s'afficheront après validation de votre commande.
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Sous-total</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{cart.total.toLocaleString()} FCFA</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Livraison
              </Text>
              {(deliveryDistanceKm != null || deliveryZoneName) && (
                <Text style={[styles.quoteHint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {deliveryDistanceKm != null ? `${deliveryDistanceKm.toFixed(1)} km` : ""}
                  {deliveryDistanceKm != null && deliveryZoneName ? " · " : ""}
                  {deliveryZoneName ?? ""}
                </Text>
              )}
            </View>
            <Text style={[styles.summaryValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {quoteLoading ? "Calcul..." : `${(deliveryFee ?? 1000).toLocaleString()} FCFA`}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{total.toLocaleString()} FCFA</Text>
          </View>
        </View>
      </ScrollView>

      {/* Order button */}
      <View style={[styles.footer, { paddingBottom: bottomInset + 10, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.orderBtn, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={handleOrder}
          disabled={isSubmitting || quoteLoading}
        >
          <Text style={[styles.orderBtnText, { fontFamily: "Inter_700Bold" }]}>
            {isSubmitting ? "En cours..." : quoteLoading ? "Calcul des frais..." : `Commander · ${total.toLocaleString()} FCFA`}
          </Text>
        </Pressable>
      </View>

      {pendingPayment && (
        <PaymentInstructionModal
          orderId={pendingPayment.orderId}
          amount={pendingPayment.amount}
          method={pendingPayment.method}
          onClose={handlePaymentDone}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20 },
  scroll: { paddingHorizontal: 16 },
  restaurantName: { fontSize: 13, marginBottom: 16 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  qtyBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 13 },
  itemName: { fontSize: 14 },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemPrice: { fontSize: 14 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, marginBottom: 12 },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputText: { flex: 1, fontSize: 15 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  paymentIconBox: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  paymentLabel: { flex: 1, fontSize: 15 },
  payNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  payNoticeText: { flex: 1, fontSize: 13, lineHeight: 18 },
  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 24, gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14 },
  quoteHint: { fontSize: 11, marginTop: 3 },
  totalRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: "#EBEBEB" },
  totalLabel: { fontSize: 16 },
  totalValue: { fontSize: 18 },
  footer: { paddingHorizontal: 16, borderTopWidth: 1, paddingTop: 12 },
  orderBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  orderBtnText: { color: "#fff", fontSize: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16 },
  browseBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%", overflow: "hidden" },
  modalHeader: { alignItems: "center", padding: 24, paddingBottom: 20, borderBottomWidth: 1, gap: 8 },
  payIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 20 },
  modalSubtitle: { fontSize: 14 },
  modalBody: { padding: 20, gap: 12 },
  stepCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16, borderRadius: 14, borderWidth: 1 },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  stepTitle: { fontSize: 13, marginBottom: 4 },
  stepNumber: { fontSize: 22 },
  stepHint: { fontSize: 12, marginTop: 4 },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  modalFooter: { padding: 20, borderTopWidth: 1 },
  confirmBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, paddingVertical: 16 },
  confirmBtnText: { color: "#fff", fontSize: 16 },
});
