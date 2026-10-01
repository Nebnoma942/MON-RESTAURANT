import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Store, Users, ShoppingBag, LogOut } from "lucide-react";
import { useGetAdminStats } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/restaurants", label: "Restaurants", icon: Store, checkAlerts: true },
  { href: "/users", label: "Utilisateurs", icon: Users },
  { href: "/orders", label: "Commandes", icon: ShoppingBag },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // We use this to show alert badges on nav items if needed
  const { data: stats } = useGetAdminStats({ query: { queryKey: ["admin-stats"], staleTime: 60000 } });
  
  const pendingRestaurants = stats?.restaurants?.pending || 0;

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col text-sidebar-foreground flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            BF
          </div>
          MON RESTAURANT Admin
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer min-h-11 ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.checkAlerts && pendingRestaurants > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingRestaurants}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
        <div className="mb-4">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/60 truncate">{user?.phone}</p>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sidebar-accent/50 hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-xl text-sm font-medium min-h-11"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
