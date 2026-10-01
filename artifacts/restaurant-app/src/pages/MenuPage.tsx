import { useRef, useState } from "react";
import {
  useGetMyRestaurant,
  useGetRestaurantDishes,
  useCreateDish,
  useUpdateDish,
  useDeleteDish,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, AlertCircle, UtensilsCrossed, Camera, X } from "lucide-react";

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";
}

interface DishFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  available: boolean;
  hasPromotion: boolean;
  promotionPrice: string;
}

const DEFAULT_FORM: DishFormData = {
  name: "",
  description: "",
  price: "",
  category: "Plat principal",
  imageUrl: "",
  available: true,
  hasPromotion: false,
  promotionPrice: "",
};

const CATEGORIES = ["Plat principal", "Entrée", "Dessert", "Boisson", "Snack", "Spécialité locale"];

function DishModal({
  onClose,
  onSave,
  initial,
  isPending,
}: {
  onClose: () => void;
  onSave: (data: DishFormData) => void;
  initial?: DishFormData;
  isPending: boolean;
}) {
  const [form, setForm] = useState<DishFormData>(initial ?? DEFAULT_FORM);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof DishFormData, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      set("imageUrl", reader.result as string);
      setImageError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      setImageError(true);
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-background rounded-t-3xl shadow-2xl pb-8 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg text-foreground">{initial ? "Modifier le plat" : "Ajouter un plat"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 pt-4 space-y-4"
        >
          {/* Photo obligatoire */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Photo du plat <span className="text-destructive">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {form.imageUrl ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-input">
                <img
                  src={form.imageUrl}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => { set("imageUrl", ""); setImageError(false); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl transition-colors ${
                  imageError
                    ? "border-destructive bg-destructive/5 text-destructive"
                    : "border-input hover:border-primary hover:bg-primary/5 text-muted-foreground"
                }`}
              >
                <Camera className="w-7 h-7" />
                <span className="text-sm font-medium">Cliquez pour ajouter une photo</span>
                <span className="text-xs">JPG, PNG, WEBP</span>
              </button>
            )}
            {imageError && (
              <p className="text-xs text-destructive mt-1">La photo du plat est obligatoire.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nom *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="Riz sauce tomate"
              className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Courte description du plat..."
              className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Prix (FCFA) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                required
                min="0"
                placeholder="1500"
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Disponible</p>
              <p className="text-xs text-muted-foreground">Visible dans le menu</p>
            </div>
            <button
              type="button"
              onClick={() => set("available", !form.available)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.available ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.available ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Promotion</p>
              <p className="text-xs text-muted-foreground">Prix spécial temporaire</p>
            </div>
            <button
              type="button"
              onClick={() => set("hasPromotion", !form.hasPromotion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.hasPromotion ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.hasPromotion ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {form.hasPromotion && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Prix promotionnel (FCFA)</label>
              <input
                type="number"
                value={form.promotionPrice}
                onChange={(e) => set("promotionPrice", e.target.value)}
                min="0"
                placeholder="1200"
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-60"
          >
            {isPending ? "Enregistrement..." : initial ? "Mettre à jour" : "Ajouter le plat"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState<{ id: number; form: DishFormData } | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: restaurant } = useGetMyRestaurant();
  const restaurantId = restaurant?.id ?? 0;

  const { data: dishes, isLoading } = useGetRestaurantDishes(restaurantId, {
    query: { enabled: !!restaurantId, queryKey: [`/api/restaurants/${restaurantId}/dishes`] },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${restaurantId}/dishes`] });
  };

  const createDish = useCreateDish({ mutation: { onSuccess: () => { invalidate(); setShowModal(false); } } });
  const updateDish = useUpdateDish({ mutation: { onSuccess: () => { invalidate(); setEditingDish(null); } } });
  const deleteDish = useDeleteDish({ mutation: { onSuccess: invalidate } });

  const handleSave = (form: DishFormData) => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      category: form.category,
      imageUrl: form.imageUrl || undefined,
      available: form.available,
      hasPromotion: form.hasPromotion,
      promotionPrice: form.hasPromotion && form.promotionPrice ? parseFloat(form.promotionPrice) : undefined,
    };

    if (editingDish) {
      updateDish.mutate({ restaurantId, dishId: editingDish.id, data: payload });
    } else {
      createDish.mutate({ restaurantId, data: payload });
    }
  };

  const handleEdit = (dish: NonNullable<typeof dishes>[0]) => {
    setEditingDish({
      id: dish.id,
      form: {
        name: dish.name,
        description: dish.description ?? "",
        price: String(dish.price),
        category: dish.category,
        imageUrl: dish.imageUrl ?? "",
        available: dish.available,
        hasPromotion: dish.hasPromotion,
        promotionPrice: dish.promotionPrice != null ? String(dish.promotionPrice) : "",
      },
    });
  };

  const handleDelete = (dishId: number) => {
    if (confirm("Supprimer ce plat ?")) {
      deleteDish.mutate({ restaurantId, dishId });
    }
  };

  const grouped = (dishes ?? []).reduce<Record<string, typeof dishes>>((acc, d) => {
    if (!acc[d.category]) acc[d.category] = [];
    acc[d.category]!.push(d);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-4 text-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Créez d'abord votre restaurant</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Menu</h1>
          <p className="text-sm text-muted-foreground">{dishes?.length ?? 0} plat{(dishes?.length ?? 0) !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 border border-card-border text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-xl mb-3">
            <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Menu vide</p>
          <p className="text-sm text-muted-foreground mt-1">Ajoutez vos premiers plats</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
          >
            Ajouter un plat
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const items = grouped[cat] ?? [];
            const isOpen = expandedCategory === null || expandedCategory === cat;
            return (
              <div key={cat} className="bg-card rounded-2xl border border-card-border overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex items-center justify-between"
                  onClick={() => setExpandedCategory(isOpen && expandedCategory === cat ? null : cat)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{cat}</span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{items.length}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="divide-y divide-border border-t border-border">
                    {items.map((dish) => (
                      <div key={dish.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${dish.available ? "text-foreground" : "text-muted-foreground line-through"}`}>
                              {dish.name}
                            </span>
                            {!dish.available && (
                              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Indisponible</span>
                            )}
                            {dish.hasPromotion && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Promo</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {dish.hasPromotion && dish.promotionPrice != null ? (
                              <>
                                <span className="text-sm font-semibold text-green-600">{formatFCFA(dish.promotionPrice)}</span>
                                <span className="text-xs text-muted-foreground line-through">{formatFCFA(dish.price)}</span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-primary">{formatFCFA(dish.price)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(dish)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(dish.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(showModal || editingDish) && (
        <DishModal
          onClose={() => { setShowModal(false); setEditingDish(null); }}
          onSave={handleSave}
          initial={editingDish?.form}
          isPending={createDish.isPending || updateDish.isPending}
        />
      )}
    </div>
  );
}
