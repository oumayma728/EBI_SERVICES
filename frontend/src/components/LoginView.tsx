import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { post } from "../api/client";
import { clientDb } from "../clientDb";
import { useLanguage } from "../LanguageContext";
import ebiLogo from "../assets/logo (2).png";

interface LoginViewProps {
  onLogin: (user: any, jwtToken: string, refreshToken?: string) => void;
  onNavigate: (tab: string) => void;
}

export default function LoginView({ onLogin, onNavigate }: LoginViewProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return;

    try {
      const data = await post<{ access_token: string; refresh_token: string; _id: string; email: string; fullname: string; role: string }>("/auth/login", { email, password });
      if (data && data.access_token) {
        const mappedUser = {
          id: data._id,
          email: data.email,
          name: data.fullname,
          role: data.role === "admin" ? "admin" : "client",
          companyId: "EBI Services",
          createdAt: new Date().toISOString(),
        };
        onLogin(mappedUser, data.access_token, data.refresh_token);
        clientDb.addActivityLog(data._id, data.fullname, "User logged in successfully (API)");
        setEmail("");
        setPassword("");
        return;
      }
    } catch (err: any) {
      if (err?.status === 403) {
        setError(t("Please verify your email address before logging in. Check your inbox for the verification link.", "Veuillez vérifier votre adresse e-mail avant de vous connecter. Consultez votre boîte de réception pour le lien de vérification."));
        return;
      }
      if (err?.status && err.status !== 401) {
        setError(err.message || t("The authentication service is unavailable. Please try again later.", "Le service d’authentification est indisponible. Veuillez réessayer plus tard."));
        return;
      }
      // A matching local demo account can still sign in without a backend session.
    }

    try {
      const users = clientDb.getUsers();
      const passwords = clientDb.getPasswords();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (user && passwords[user.email] === password) {
        onLogin(user, "");
        clientDb.addActivityLog(user.id, user.name, "User logged in successfully (offline)");
        setEmail("");
        setPassword("");
        return;
      } else {
        setError(t("Invalid email or password.", "Adresse e-mail ou mot de passe invalide."));
      }
    } catch (e) {
      setError(t("Failed to authenticate.", "Échec de l’authentification."));
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await post("/auth/forgot-password", { email: forgotEmail });
      setForgotStatus(t("A password recovery link has been sent to your email address.", "Un lien de réinitialisation du mot de passe a été envoyé à votre adresse e-mail."));
      setForgotEmail("");
    } catch {
      setForgotStatus(t("Unable to process your request at this time. Please try again later.", "Impossible de traiter votre demande pour le moment. Veuillez réessayer plus tard."));
    } finally {
      setForgotLoading(false);
    }
    setTimeout(() => setForgotStatus(""), 5000);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-left space-y-6">
      <div className="text-center space-y-2">
        <img
          src={ebiLogo}
          alt="EBI Services"
          className="mx-auto h-20 w-32 object-contain"
        />
        <h1 className="font-display text-2xl font-bold text-slate-900">{t("Log in to EBI Services", "Connexion à EBI Services")}</h1>
        <p className="text-xs text-gray-500">{t("Enter your credentials to access your secure client portal.", "Saisissez vos identifiants pour accéder à votre espace client sécurisé.")}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{t("Email address", "Adresse e-mail")}</label>
            <input
              type="email"
              required
              placeholder="e.g. client@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase text-gray-500">{t("Password", "Mot de passe")}</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-950 text-white rounded-lg py-2.5 text-xs font-semibold shadow-md transition cursor-pointer"
          >
            {t("Log in securely", "Connexion sécurisée")}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-150 space-y-2">
          <span className="block text-[10px] text-gray-400 font-bold uppercase text-center">{t("Forgot password?", "Mot de passe oublié ?")}</span>
          <form onSubmit={handleForgotSubmit} className="flex gap-2">
            <input
              type="email"
              required
              placeholder={t("Enter your email...", "Saisissez votre e-mail...")}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="flex-1 rounded border border-gray-200 p-1.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
            <button
              type="submit"
              disabled={forgotLoading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer"
            >
              {t("Reset", "Réinitialiser")}
            </button>
          </form>
          {forgotStatus && (
            <span className="block text-[10px] text-green-700 font-semibold bg-green-50 p-2 rounded text-center border border-green-100">
              {forgotStatus}
            </span>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-500">
        {t("New to EBI? ", "Nouveau chez EBI ? ")}
        <button onClick={() => onNavigate("register")} className="text-blue-900 font-bold hover:underline">
          {t("Create an account", "Créer un compte")}
        </button>
      </div>
    </div>
  );
}
