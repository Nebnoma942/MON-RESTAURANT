import { useGetMyRestaurant, useGetRestaurantStats, useListOrders } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, TrendingUp, CheckCircle, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-card-border shadow-sm">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  picked_up: "Récupérée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-purple-100 text-purple-700",
  picked_up: "bg-teal-100 text-teal-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: restaurant, isLoading: loadingRestaurant } = useGetMyRestaurant();
  const { data: stats } = useGetRestaurantStats(
    restaurant?.id ?? 0,
    { query: { enabled: !!restaurant?.id, queryKey: [`/api/restaurants/${restaurant?.id ?? 0}/stats`] } }
  );
  const { data: orders } = useListOrders();

  const restaurantOrders = orders?.filter((o) => o.restaurantId === restaurant?.id) ?? [];
  const recentOrders = restaurantOrders.slice(0, 5);
  const pendingCount = restaurantOrders.filter((o) => o.status === "pending").length;

  if (loadingRestaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4">
          <AlertCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Aucun restaurant trouvé</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Vous n'avez pas encore de restaurant enregistré.
        </p>
        <button
          onClick={() => navigate("/restaurant/setup")}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm"
        >
          Créer mon restaurant
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* Welcome */}
      <div>
        <p className="text-muted-foreground text-sm">Bonjour, {user?.name} 👋</p>
        <h1 className="text-xl font-bold text-foreground mt-0.5">{restaurant.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            restaurant.status === "approved"
              ? "bg-green-100 text-green-700"
              : restaurant.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}>
            {restaurant.status === "approved" ? "✓ Actif" : restaurant.status === "pending" ? "⏳ En attente" : "⚠ Suspendu"}
          </span>
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {pendingCount} nouvelle{pendingCount > 1 ? "s" : ""} commande{pendingCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Today's stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Aujourd'hui</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<ShoppingBag className="w-5 h-5 text-primary" />}
            label="Commandes"
            value={String(stats?.todayOrders ?? 0)}
            color="bg-primary/10"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            label="Revenu"
            value={formatFCFA(stats?.todayRevenue ?? 0)}
            color="bg-green-100"
          />
        </div>
      </div>

      {/* Overall stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Total</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
            label="Commandes livrées"
            value={String(stats?.completedOrders ?? 0)}
            sub={`sur ${stats?.totalOrders ?? 0} totales`}
            color="bg-blue-100"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-orange-600" />}
            label="Commission due"
            value={formatFCFA(stats?.commissionOwed ?? 0)}
            color="bg-orange-100"
          />
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Commandes récentes</h2>
          <button
            onClick={() => navigate("/orders")}
            className="text-xs text-primary font-medium flex items-center gap-0.5"
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-card rounded-2xl p-6 border border-card-border text-center">
            <p className="text-muted-foreground text-sm">Aucune commande pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="w-full bg-card rounded-xl p-3 border border-card-border shadow-sm flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Commande #{order.id}</p>
                    <p className="text-xs text-muted-foreground">{formatFCFA(order.total)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
