import { useState } from "react";
import { useGetMyRestaurant, useUpdateRestaurant } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Store, Phone, MapPin, Clock, Save, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: restaurant, isLoading } = useGetMyRestaurant();
  const [form, setForm] = useState({
    name: "",
    type: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    openingHours: "",
  });

  const updateRestaurant = useUpdateRestaurant({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/restaurants/mine"] });
        setEditing(false);
      },
    },
  });

  const startEdit = () => {
    if (restaurant) {
      setForm({
        name: restaurant.name,
        type: restaurant.type,
        description: restaurant.description ?? "",
        address: restaurant.address,
        city: restaurant.city,
        phone: restaurant.phone,
        openingHours: restaurant.openingHours,
      });
      setEditing(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    updateRestaurant.mutate({ id: restaurant.id, data: form });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Profil</h1>

      {/* User card */}
      <div className="bg-card rounded-2xl border border-card-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-xl">{user?.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.phone}</p>
            <span className="inline-block text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full mt-1">
              Restaurateur
            </span>
          </div>
        </div>
      </div>

      {/* Restaurant info */}
      {isLoading ? (
        <div className="bg-card rounded-2xl border border-card-border p-6 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : restaurant ? (
        <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">Mon restaurant</span>
            </div>
            {!editing && (
              <button
                onClick={startEdit}
                className="text-xs text-primary font-medium"
              >
                Modifier
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="p-4 space-y-3">
              {[
                { key: "name", label: "Nom", placeholder: "Restaurant de la Paix" },
                { key: "type", label: "Type", placeholder: "Africain, Fast-food..." },
                { key: "phone", label: "Téléphone", placeholder: "+226 XX XX XX XX" },
                { key: "address", label: "Adresse", placeholder: "Rue de la Liberté" },
                { key: "city", label: "Ville", placeholder: "Ouagadougou" },
                { key: "openingHours", label: "Horaires", placeholder: "Lun-Sam 08:00-22:00" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateRestaurant.isPending}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {updateRestaurant.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-border">
              {[
                { Icon: Store, label: "Nom", value: restaurant.name },
                { Icon: Phone, label: "Téléphone", value: restaurant.phone },
                { Icon: MapPin, label: "Adresse", value: `${restaurant.address}, ${restaurant.city}` },
                { Icon: Clock, label: "Horaires", value: restaurant.openingHours },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="px-4 py-3 flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm text-foreground truncate">{value}</p>
                  </div>
                </div>
              ))}
              {restaurant.description && (
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{restaurant.description}</p>
                </div>
              )}
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  restaurant.status === "approved" ? "bg-green-100 text-green-700" :
                  restaurant.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {restaurant.status === "approved" ? "✓ Actif" : restaurant.status === "pending" ? "⏳ En attente" : "⚠ Suspendu"}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-card-border p-6 text-center">
          <Store className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="font-medium text-foreground mb-1">Pas encore de restaurant</p>
          <p className="text-sm text-muted-foreground mb-4">Créez votre restaurant pour commencer</p>
          <button
            onClick={() => navigate("/restaurant/setup")}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
          >
            Créer mon restaurant
          </button>
        </div>
      )}

      {/* Links */}
      <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3.5 flex items-center justify-between text-destructive hover:bg-destructive/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Se déconnecter</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
      </div>
    </div>
  );
}
