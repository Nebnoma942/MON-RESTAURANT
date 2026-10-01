import { useEffect, useRef, useState } from "react";
import { useGetOrder, useUpdateOrderStatus, useGetMyRestaurant, OrderStatusUpdateStatus } from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Clock, Package, CheckCircle2, ChefHat, Timer, Zap } from "lucide-react";
import { useLocation, useParams } from "wouter";

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  delivering: "En livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-purple-100 text-purple-700",
  delivering: "bg-teal-100 text-teal-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PREP_DURATIONS = [
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "20 min", value: 20 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];

interface PrepInfo {
  startAt: string; // ISO
  durationMin: number;
}

function getPrepInfo(orderId: number): PrepInfo | null {
  try {
    const raw = localStorage.getItem(`prep_${orderId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setPrepInfo(orderId: number, info: PrepInfo) {
  localStorage.setItem(`prep_${orderId}`, JSON.stringify(info));
}

function clearPrepInfo(orderId: number) {
  localStorage.removeItem(`prep_${orderId}`);
}

// --- Preparation Dialog ---
function PrepDialog({
  onClose,
  onAlreadyReady,
  onStart,
  isPending,
}: {
  onClose: () => void;
  onAlreadyReady: () => void;
  onStart: (durationMin: number) => void;
  isPending: boolean;
}) {
  const [selected, setSelected] = useState<number>(15);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-background rounded-t-3xl shadow-2xl pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-lg text-foreground">Lancement de la préparation</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 pt-5 space-y-5">
          {/* Already ready option */}
          <button
            onClick={onAlreadyReady}
            disabled={isPending}
            className="w-full flex items-center gap-3 p-4 border-2 border-green-500 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors disabled:opacity-60"
          >
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-green-700">Déjà prêt</p>
              <p className="text-xs text-green-600">La commande est prête immédiatement</p>
            </div>
          </button>

          {/* Duration selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Timer className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-medium text-foreground">Durée de préparation estimée</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PREP_DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelected(d.value)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                    selected === d.value
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-border bg-muted text-foreground hover:border-orange-300"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStart(selected)}
            disabled={isPending}
            className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            {isPending ? "Lancement..." : `Lancer la préparation · ${selected} min`}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Prep Timer ---
function PrepTimer({ orderId, onTimeUp }: { orderId: number; onTimeUp?: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const calledRef = useRef(false);

  const prepInfo = getPrepInfo(orderId);

  useEffect(() => {
    if (!prepInfo) return;
    const tick = () => {
      const diff = Math.floor((Date.now() - new Date(prepInfo.startAt).getTime()) / 1000);
      setElapsed(diff);
      const totalSeconds = prepInfo.durationMin * 60;
      if (diff >= totalSeconds && !calledRef.current) {
        calledRef.current = true;
        onTimeUp?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [prepInfo?.startAt, prepInfo?.durationMin]);

  if (!prepInfo) return null;

  const totalSeconds = prepInfo.durationMin * 60;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = Math.min(100, (elapsed / totalSeconds) * 100);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isOver = remaining === 0;

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${isOver ? "bg-purple-50 border-purple-200" : "bg-orange-50 border-orange-200"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${isOver ? "text-purple-600" : "text-orange-600"}`} />
          <span className={`text-sm font-semibold ${isOver ? "text-purple-700" : "text-orange-700"}`}>
            {isOver ? "⏰ Temps écoulé — Plat prêt ?" : "En cours de préparation"}
          </span>
        </div>
        <span className={`text-2xl font-bold tabular-nums ${isOver ? "text-purple-700" : "text-orange-700"}`}>
          {isOver ? "00:00" : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
        </span>
      </div>
      <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden border border-orange-200">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-purple-500" : "bg-orange-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className={`text-xs ${isOver ? "text-purple-600" : "text-orange-600"}`}>
        {isOver
          ? "Le temps est écoulé. Cliquez sur « Fin de préparation » dès que le plat est prêt."
          : `Durée estimée : ${prepInfo.durationMin} min — Commencé à ${new Date(prepInfo.startAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
      </p>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showPrepDialog, setShowPrepDialog] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const { token } = useAuth();

  const orderId = id ?? "";
  const { data: order, isLoading } = useGetOrder(orderId as any, {
    query: { queryKey: ["order", orderId], refetchInterval: 10000 },
  });
  const { data: restaurant } = useGetMyRestaurant();

  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      },
    },
  });

  const handlePaymentStatus = async (paymentStatus: "paid" | "failed") => {
    try {
      setPaymentBusy(true);
      if (!token) throw new Error("Session restaurant expirée");
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Impossible de mettre à jour le paiement");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      await queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Impossible de mettre à jour le paiement");
    } finally {
      setPaymentBusy(false);
    }
  };

  const handleAccept = () => {
    updateStatus.mutate({ id: orderId, data: { status: OrderStatusUpdateStatus.confirmed } });
  };

  const handleAlreadyReady = () => {
    clearPrepInfo(orderId);
    updateStatus.mutate({ id: orderId, data: { status: OrderStatusUpdateStatus.ready } }, {
      onSuccess: () => setShowPrepDialog(false),
    });
  };

  const handleStartPrep = (durationMin: number) => {
    setPrepInfo(orderId, { startAt: new Date().toISOString(), durationMin });
    updateStatus.mutate({ id: orderId, data: { status: OrderStatusUpdateStatus.preparing } }, {
      onSuccess: () => setShowPrepDialog(false),
    });
  };

  const handleEndPrep = () => {
    clearPrepInfo(orderId);
    updateStatus.mutate({ id: orderId, data: { status: OrderStatusUpdateStatus.ready } });
  };

  const handleCancel = () => {
    if (confirm("Annuler cette commande ?")) {
      updateStatus.mutate({ id: orderId, data: { status: OrderStatusUpdateStatus.cancelled } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Commande introuvable</p>
      </div>
    );
  }

  const canCancel = ["pending", "confirmed", "preparing", "ready"].includes(order.status);
  const paymentLabel =
    order.paymentMethod === "orange_money" ? "Orange Money" :
    order.paymentMethod === "moov_money" ? "Moov Money" : "Paiement à la livraison";

  return (
    <div className="pb-36">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate("/orders")} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-semibold text-foreground">Commande #{order.id}</h1>
          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Prep timer when in preparing state */}
        {order.status === "preparing" && (
          <PrepTimer orderId={orderId} />
        )}

        {/* Status ready banner */}
        {order.status === "ready" && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-purple-700">Plat prêt</p>
              <p className="text-xs text-purple-600">En attente du livreur</p>
            </div>
          </div>
        )}
        {order.status === "delivering" && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-teal-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-teal-700">Commande prise en charge</p>
              <p className="text-xs text-teal-600">Le livreur est en route vers le client.</p>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">Articles commandés</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item, idx) => (
              <div key={idx} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-bold">
                    {item.quantity}
                  </span>
                  <span className="text-sm text-foreground">{item.dishName}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{formatFCFA(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-muted/30 flex items-center justify-between border-t border-border">
            <span className="text-sm text-muted-foreground">Frais de livraison</span>
            <span className="text-sm text-foreground">{formatFCFA(order.deliveryFee)}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-lg text-foreground">{formatFCFA(order.total)}</span>
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-card rounded-2xl border border-card-border p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm text-foreground">Livraison</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Adresse</p>
            <p className="text-sm text-foreground mt-0.5">{order.deliveryAddress}{order.deliveryCity ? `, ${order.deliveryCity}` : ""}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paiement</p>
            <p className="text-sm text-foreground mt-0.5">{paymentLabel}</p>
          </div>
        </div>

        {/* Payment verification */}
        {(order.paymentMethod === "orange_money" || order.paymentMethod === "moov_money") && (
          <div className="bg-card rounded-2xl border border-card-border p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <p className="font-medium text-sm text-foreground">Vérification du paiement</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Statut : {order.paymentStatus === "paid" ? "Paiement reçu" : order.paymentStatus === "failed" ? "Paiement échoué" : "En attente de confirmation"}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {order.paymentStatus === "paid" ? "Payé" : order.paymentStatus === "failed" ? "Échec" : "À vérifier"}
              </span>
            </div>
            {order.paymentStatus === "pending" && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => handlePaymentStatus("paid")}
                  disabled={paymentBusy}
                  className="py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm disabled:opacity-60"
                >
                  Paiement reçu
                </button>
                <button
                  onClick={() => handlePaymentStatus("failed")}
                  disabled={paymentBusy}
                  className="py-2.5 border border-destructive/30 text-destructive rounded-xl font-semibold text-sm disabled:opacity-60"
                >
                  Paiement non reçu
                </button>
              </div>
            )}
          </div>
        )}

        {/* Restaurant info */}
        {restaurant && (
          <div className="bg-card rounded-2xl border border-card-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">Votre restaurant</span>
            </div>
            <p className="text-sm text-muted-foreground">{restaurant.name}</p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border space-y-2">
        {/* pending → accept */}
        {order.status === "pending" && (
          <button
            onClick={handleAccept}
            disabled={updateStatus.isPending || paymentBusy || ((order.paymentMethod === "orange_money" || order.paymentMethod === "moov_money") && order.paymentStatus !== "paid")}
            className="w-full py-3.5 bg-green-500 text-white rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {updateStatus.isPending ? "En cours..." : "Accepter la commande"}
          </button>
        )}

        {/* confirmed → start prep dialog */}
        {order.status === "confirmed" && (
          <button
            onClick={() => setShowPrepDialog(true)}
            disabled={updateStatus.isPending}
            className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            Lancer la préparation
          </button>
        )}

        {/* preparing → end prep */}
        {order.status === "preparing" && (
          <button
            onClick={handleEndPrep}
            disabled={updateStatus.isPending}
            className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {updateStatus.isPending ? "En cours..." : "✅ Fin de préparation — Plat prêt"}
          </button>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={updateStatus.isPending}
            className="w-full py-2.5 rounded-xl font-medium text-sm border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"
          >
            Annuler la commande
          </button>
        )}
      </div>

      {/* Prep dialog */}
      {showPrepDialog && (
        <PrepDialog
          onClose={() => setShowPrepDialog(false)}
          onAlreadyReady={handleAlreadyReady}
          onStart={handleStartPrep}
          isPending={updateStatus.isPending}
        />
      )}
    </div>
  );
}
