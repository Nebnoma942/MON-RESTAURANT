import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function LoginPage() {
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">MON RESTAURANT</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Espace Restaurateur — accès réservé aux comptes autorisés
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-card-border">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <GoogleSignIn
            onError={setError}
            onSuccess={(token, user) => {
              setError("");
              login(token, user);
              navigate("/");
            }}
          />

          <p className="text-center text-xs text-muted-foreground mt-5">
            Sélectionnez l'adresse Google associée à votre compte restaurateur.
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Plateforme de livraison de repas — Burkina Faso
        </p>
      </div>
    </div>
  );
}
