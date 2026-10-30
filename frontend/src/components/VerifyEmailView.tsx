import React, { useState, useEffect } from "react";
import { MailCheck, AlertCircle, Loader2 } from "lucide-react";
import { post } from "../api/client";
import { useLanguage } from "../LanguageContext";

interface VerifyEmailViewProps {
  token: string;
  onNavigate: (tab: string) => void;
}

export default function VerifyEmailView({ token, onNavigate }: VerifyEmailViewProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const res = await post<{ message: string }>("/auth/verify-email", { token });
      setStatus("success");
      setMessage(res.message);
      setTimeout(() => onNavigate("login"), 4000);
    } catch {
      setStatus("error");
      setMessage(t("Invalid or expired verification link. Please register again.", "Lien de vérification invalide ou expiré. Veuillez vous inscrire à nouveau."));
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-left space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md">
          {status === "loading" ? <Loader2 className="h-6 w-6 animate-spin" /> : <MailCheck className="h-6 w-6" />}
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">{t("Email verification", "Vérification de l’adresse e-mail")}</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 text-center">
        {status === "loading" && (
          <p className="text-xs text-gray-500">{t("Verifying your email address...", "Vérification de votre adresse e-mail...")}</p>
        )}
        {status === "success" && (
          <div className="space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
              <MailCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-bold text-green-900">{t("Email verified successfully", "Adresse e-mail vérifiée")}</h3>
            <p className="text-xs text-green-800">{message}</p>
            <p className="text-[10px] text-gray-400">{t("Redirecting to login...", "Redirection vers la connexion...")}</p>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-bold text-red-900">{t("Verification failed", "Échec de la vérification")}</h3>
            <p className="text-xs text-red-800">{message}</p>
            <button
              onClick={() => onNavigate("login")}
              className="text-blue-900 font-bold text-xs hover:underline"
            >
              {t("Back to login", "Retour à la connexion")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
