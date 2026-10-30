import { Languages } from "lucide-react";
import { useLanguage } from "../LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 p-1 text-[10px] font-semibold text-blue-900"
      aria-label={t("Select language", "Choisir la langue")}
    >
      <Languages className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="English"
        aria-pressed={language === "en"}
        className={`rounded-full px-2 py-1 transition ${
          language === "en" ? "bg-blue-900 text-white" : "hover:bg-blue-100"
        }`}
      >
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">English</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("fr")}
        aria-label="Français"
        aria-pressed={language === "fr"}
        className={`rounded-full px-2 py-1 transition ${
          language === "fr" ? "bg-blue-900 text-white" : "hover:bg-blue-100"
        }`}
      >
        <span className="sm:hidden">FR</span>
        <span className="hidden sm:inline">Français</span>
      </button>
    </div>
  );
}
