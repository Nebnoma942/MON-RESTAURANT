import { useGetAdminStats } from "@workspace/api-client-react";
import { Users, Store, ShoppingBag, Banknote, AlertTriangle, TrendingUp, UserCheck, UtensilsCrossed } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useGetAdminStats();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card h-32 rounded-xl border border-border"></div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5" />
        <p>Impossible de charger les statistiques.</p>
      </div>
    );
  }

  const { users, restaurants, orders, revenue } = stats;

  return (
    <div className="space-y-8">
      {restaurants.pending > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-700 dark:text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Action requise</p>
              <p className="text-sm">{restaurants.pending} restaurant(s) en attente d'approbation.</p>
            </div>
          </div>
          <Link href="/restaurants">
            <span className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer">
              Examiner
            </span>
          </Link>
        </div>
      )}

      {/* KPI Row 1: High Level */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Chiffre d'Affaires</h3>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(revenue.total)}</p>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> Aujourd'hui:</span> {formatCurrency(revenue.today)}
            </p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Commissions Dues</h3>
            <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(revenue.commission)}</p>
            <p className="text-sm text-muted-foreground mt-1">À prélever sur les restaurateurs</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Commandes Totales</h3>
            <div className="h-10 w-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{orders.total}</p>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{orders.today}</span> aujourd'hui
            </p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Utilisateurs</h3>
            <div className="h-10 w-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{users.total}</p>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{users.clients}</span> clients
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Restaurants Details */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> État des Restaurants
            </h3>
            <Link href="/restaurants">
              <span className="text-sm text-primary hover:underline cursor-pointer">Voir tout</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">Approuvés et Actifs</span>
              </div>
              <span className="text-lg font-bold">{restaurants.approved}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-amber-500/10 text-amber-800 dark:text-amber-500 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-medium">En attente</span>
              </div>
              <span className="text-lg font-bold">{restaurants.pending}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-destructive/10 text-destructive rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="font-medium">Suspendus</span>
              </div>
              <span className="text-lg font-bold">{restaurants.suspended}</span>
            </div>
            
            <div className="pt-2 flex justify-between text-sm text-muted-foreground border-t border-border">
              <span>Total inscrits</span>
              <span className="font-medium">{restaurants.total}</span>
            </div>
          </div>
        </div>

        {/* Roles Details */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> Répartition des Rôles
            </h3>
            <Link href="/users">
              <span className="text-sm text-primary hover:underline cursor-pointer">Gérer</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-3 border border-border rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md mr-4">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Clients</h4>
                <div className="w-full bg-secondary h-2 rounded-full mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(users.clients / users.total) * 100}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 font-bold">{users.clients}</span>
            </div>

            <div className="flex items-center p-3 border border-border rounded-lg">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-md mr-4">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Restaurateurs</h4>
                <div className="w-full bg-secondary h-2 rounded-full mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(users.restaurantOwners / users.total) * 100}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 font-bold">{users.restaurantOwners}</span>
            </div>

            <div className="flex items-center p-3 border border-border rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-md mr-4">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Administrateurs</h4>
              </div>
              <span className="ml-4 font-bold">{users.admins}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
