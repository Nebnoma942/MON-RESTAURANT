import { useState } from "react";
import { useCreateRestaurant } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Store } from "lucide-react";

const TYPES = ["Africain", "Fast-food", "Pizzeria", "Burgers", "Sénégalais", "Libanais", "Asiatique", "Végétarien", "Autre"];

export default function SetupRestaurantPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "Africain",
    description: "",
    address: "",
    city: "Ouagadougou",
    phone: "",
    openingHours: "Lun-Dim 08:00-22:00",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = useCreateRestaurant({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/restaurants/mine"] });
        navigate("/");
      },
      onError: () => setError("Erreur lors de la création du restaurant"),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    create.mutate({ data: form });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate("/")} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-foreground">Créer mon restaurant</h1>
      </div>

      <div className="p-4">
        <div className="text-center mb-6 mt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
            <Store className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Remplissez les informations de votre restaurant</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nom du restaurant *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              minLength={2}
              placeholder="Restaurant de la Paix"
              className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Type de cuisine *</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Décrivez votre cuisine, spécialités..."
              className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Téléphone *</label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
              placeholder="+226 XX XX XX XX"
              className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Adresse *</label>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                required
                placeholder="Rue de la Liberté"
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ville *</label>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                required
                placeholder="Ouagadougou"
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Horaires d'ouverture *</label>
            <input
              value={form.openingHours}
              onChange={(e) => set("openingHours", e.target.value)}
              required
              placeholder="Lun-Dim 08:00-22:00"
              className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={create.isPending}
            className="w-full py-3 mt-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-60"
          >
            {create.isPending ? "Création en cours..." : "Créer mon restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
}
