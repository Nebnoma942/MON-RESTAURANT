import { useState } from "react";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const [, navigate] = useLocation();

  const loginMutation = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        if (data.user.role !== "restaurant_owner") { setError("Accès réservé aux comptes restaurateur"); return; }
        login(data.token, data.user);
        navigate("/");
      },
      onError: () => setError("Téléphone ou mot de passe incorrect"),
    },
  });

  const registerMutation = useRegisterUser({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        navigate("/");
      },
      onError: () => setError("Erreur lors de l'inscription"),
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ data: { phone, password } });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    registerMutation.mutate({
      data: { name, phone, password, role: "restaurant_owner" },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">MON RESTAURANT</h1>
          <p className="text-muted-foreground text-sm mt-1">Espace Restaurateur</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "register"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-card-border">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+226 XX XX XX XX"
                  required
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loginMutation.isPending ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+226 XX XX XX XX"
                  required
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {registerMutation.isPending ? "Inscription..." : "Créer mon compte"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Plateforme de livraison de repas — Burkina Faso
        </p>
      </div>
    </div>
  );
}
