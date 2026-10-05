import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

type GoogleUser = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: string;
  loyaltyPoints: number;
  createdAt: string;
};

export default function GoogleSignIn({
  onSuccess,
  onError,
}: {
  onSuccess: (token: string, user: GoogleUser) => void;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      onError("Google Sign-In n'est pas configuré.");
      return;
    }

    const render = () => {
      if (!window.google || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            const apiBase = ((import.meta.env.VITE_API_URL as string | undefined) || "/api").replace(/\/$/, "");
            const result = await fetch(`${apiBase}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: response.credential }),
            });
            const data = await result.json().catch(() => ({}));
            if (!result.ok) throw new Error(data.error || "Connexion Google refusée.");
            if (data.user?.role !== "admin") {
              throw new Error("Cette adresse Google n'est pas autorisée comme administrateur.");
            }
            onSuccess(data.token, data.user);
          } catch (error) {
            onError(error instanceof Error ? error.message : "Connexion Google impossible.");
          }
        },
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 360,
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    };

    if (window.google) {
      render();
      return;
    }

    const existing = document.querySelector('script[data-google-identity="true"]');
    if (existing) {
      existing.addEventListener("load", render);
      return () => existing.removeEventListener("load", render);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.addEventListener("load", render);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", render);
  }, [onSuccess, onError]);

  return <div ref={containerRef} className="flex justify-center min-h-10" />;
}
