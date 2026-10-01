import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Store, Users, ShoppingBag } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tableau de Bord",
  "/restaurants": "Gestion des Restaurants",
  "/users": "Gestion des Utilisateurs",
  "/orders": "Toutes les Commandes",
};

function getPageTitle(path: string) {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  if (path.startsWith("/restaurants/")) return "Détails du Restaurant";
  if (path.startsWith("/users/")) return "Détails de l'Utilisateur";
  if (path.startsWith("/orders/")) return "Détails de la Commande";
  return "Administration";
}

const MOBILE_NAV = [
  { href: "/dashboard", label: "Accueil", Icon: LayoutDashboard },
  { href: "/restaurants", label: "Restaurants", Icon: Store },
  { href: "/users", label: "Utilisateurs", Icon: Users },
  { href: "/orders", label: "Commandes", Icon: ShoppingBag },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-[100dvh] bg-background w-full">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3"><div className="md:hidden w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">BF</div><h2 className="text-base md:text-lg font-semibold text-foreground">
            {getPageTitle(location)}
          </h2></div><span className="md:hidden text-xs font-medium text-muted-foreground">Administration</span></header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden pb-24 md:pb-8">
          {children}
        </main>
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          <div className="grid grid-cols-4 gap-1">
            {MOBILE_NAV.map(({ href, label, Icon }) => { const active = location === href || location.startsWith(`${href}/`); return <Link key={href} href={href} className={`min-h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${active ? "text-primary bg-primary/10" : "text-muted-foreground"}`} aria-current={active ? "page" : undefined}><Icon className="h-4 w-4" />{label}</Link>; })}
          </div>
        </nav>
      </div>
    </div>
  );
}
