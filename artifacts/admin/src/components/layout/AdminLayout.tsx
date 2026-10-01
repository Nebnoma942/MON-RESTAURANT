import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useLocation } from "wouter";

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

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-[100dvh] bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center px-8 flex-shrink-0 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-foreground">
            {getPageTitle(location)}
          </h2>
        </header>
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
