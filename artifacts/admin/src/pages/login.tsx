import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import GoogleSignIn from "@/components/GoogleSignIn";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) setLocation("/dashboard");
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mx-auto mb-4 text-xl font-bold">
            BF
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            MON RESTAURANT Control Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Connexion réservée aux administrateurs
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <GoogleSignIn
          onError={setErrorMsg}
          onSuccess={(token, user) => {
            setErrorMsg(null);
            login(token, user);
            setLocation("/dashboard");
          }}
        />

        <p className="text-center text-xs text-muted-foreground mt-6">
          Sélectionnez votre compte Google autorisé pour continuer.
        </p>
      </div>
    </div>
  );
}
