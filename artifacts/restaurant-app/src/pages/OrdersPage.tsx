import { useState } from "react";
import { useListOrders, useUpdateOrderStatus, useGetMyRestaurant, OrderStatusUpdateStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, ChevronRight, Filter } from "lucide-react";
import { useLocation } from "wouter";

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", {
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
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  preparing: "bg-orange-100 text-orange-700 border-orange-200",
  ready: "bg-purple-100 text-purple-700 border-purple-200",
  delivering: "bg-teal-100 text-teal-700 border-teal-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const FILTER_TABS = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "preparing", label: "En préparation" },
  { key: "ready", label: "Prêtes" },
  { key: "delivering", label: "En livraison" },
  { key: "delivered", label: "Livrées" },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState("all");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: restaurant } = useGetMyRestaurant();
  const { data: orders, isLoading } = useListOrders({
    query: { queryKey: ["orders"], refetchInterval: 10000 },
  });

  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      },
    },
  });

  const restaurantOrders = (orders ?? []).filter((o) => o.restaurantId === restaurant?.id);
  const filtered = filter === "all" ? restaurantOrders : restaurantOrders.filter((o) => o.status === filter);

  const quickAccept = (e: React.MouseEvent, orderId: number) => {
    e.stopPropagation();
    updateStatus.mutate({ id: orderId, data: { status: OrderStatusUpdateStatus.confirmed } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Commandes</h1>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm">{filtered.length}</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_TABS.map((tab) => {
          const count = tab.key === "all"
            ? restaurantOrders.length
            : restaurantOrders.filter((o) => o.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${filter === tab.key ? "opacity-80" : "opacity-60"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 border border-card-border text-center mt-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-xl mb-3">
            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">Aucune commande</p>
          <p className="text-muted-foreground text-sm mt-1">
            {filter === "all" ? "Vous n'avez pas encore reçu de commandes" : `Aucune commande avec ce statut`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <div
              key={order.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/orders/${order.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/orders/${order.id}`); }}
              className="w-full bg-card rounded-xl border border-card-border shadow-sm p-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">Commande #{order.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <p className="text-sm font-semibold text-foreground mt-2">{formatFCFA(order.total)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  {order.status === "pending" && (
                    <button
                      onClick={(e) => quickAccept(e, order.id)}
                      className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium hover:bg-green-200 transition-colors"
                    >
                      Accepter
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
