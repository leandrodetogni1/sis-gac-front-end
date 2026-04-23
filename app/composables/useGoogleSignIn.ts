import type { UserResponseDto } from "~/interfaces/UserResponseDto";

type GisCredentialResponse = { credential: string };

type GisIdApi = {
  initialize: (config: { client_id: string; callback: (response: GisCredentialResponse) => void }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "small" | "medium" | "large";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GisIdApi } };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

export const useGoogleSignIn = () => {
  const { setUser } = useAuthState();
  const config = useRuntimeConfig();
  const api = useApi();

  const loadGis = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Google Sign-In só funciona no cliente"));
        return;
      }
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Falha ao carregar Google Identity Services")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Falha ao carregar Google Identity Services"));
      document.head.appendChild(script);
    });
  };

  const handleCredential = async (response: GisCredentialResponse) => {
    const { user } = await api<{ user: UserResponseDto }>("/api/auth/google", {
      method: "POST",
      body: { idToken: response.credential },
    });
    setUser(user);
    await navigateTo("/");
  };

  const renderButton = async (element: HTMLElement) => {
    await loadGis();
    const clientId = config.public.googleClientId as string;
    if (!clientId) {
      throw new Error("GOOGLE_CLIENT_ID não configurado");
    }

    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
    });
    window.google!.accounts.id.renderButton(element, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
    });
  };

  const signOut = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      await navigateTo("/login");
    }
  };

  return { renderButton, signOut };
};
