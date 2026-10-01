import { useLocation } from "wouter";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, User } from "lucide-react";

const TABS = [
  { path: "/", label: "Accueil", Icon: LayoutDashboard },
  { path: "/orders", label: "Commandes", Icon: ShoppingBag },
  { path: "/menu", label: "Menu", Icon: UtensilsCrossed },
  { path: "/profile", label: "Profil", Icon: User },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-40 md:max-w-3xl md:mx-auto">
      <div className="flex items-center justify-around px-2 pt-2 pb-safe">
        {TABS.map(({ path, label, Icon }) => {
          const active = path === "/" ? location === "/" : location.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] min-h-11 px-3 py-2 rounded-xl transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className={`text-xs font-medium ${active ? "text-primary" : ""}`}>{label}</span>
              {active && (
                <span className="absolute top-0 w-6 h-0.5 bg-primary rounded-full" style={{ marginTop: "-8px" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
