import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "../LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ebiLogo from "../assets/logo (2).png";

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-gray-200 bg-white text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src={ebiLogo}
                alt="EBI Services"
                className="h-10 w-16 shrink-0 object-contain"
              />
              <span className="font-display text-base font-bold text-blue-950">
                EBI Services
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              {t(
                "EBI Services supports your business with call center services, digital development and recruitment.",
                "EBI Services vous accompagne avec ses services de centre d’appels, de développement numérique et de recrutement.",
              )}
            </p>
            <div className="flex items-center space-x-2 text-[10px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded border border-green-100 w-fit">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{t("EBI Services platform", "Plateforme EBI Services")}</span>
            </div>
          </div>

          {}
          <div>
            <span className="block font-display text-xs font-semibold uppercase tracking-wider text-gray-900">
              {t("Our services", "Nos services")}
            </span>
            <ul className="mt-4 space-y-2 text-xs">
              {[
                {
                  name: t("Call center and customer support", "Centre d’appels et support client"),
                  action: () => {
                    setActiveTab("services");
                  },
                },
                {
                  name: t("Business applications and custom solutions", "Applications métier et solutions sur mesure"),
                  action: () => {
                    setActiveTab("services");
                  },
                },
                {
                  name: t("Web applications", "Applications web"),
                  action: () => {
                    setActiveTab("services");
                  },
                },
                {
                  name: t("IT recruitment and pre-screening", "Recrutement et préqualification IT"),
                  action: () => {
                    setActiveTab("services");
                  },
                },
                {
                  name: t("Administrative assistance and back office", "Assistance administrative et back-office"),
                  action: () => {
                    setActiveTab("services");
                  },
                },
              ].map((item, index) => (
                <li key={index}>
                  <button
                    onClick={item.action}
                    className="hover:text-blue-900 transition-colors cursor-pointer"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {}
          <div>
            <span className="block font-display text-xs font-semibold uppercase tracking-wider text-gray-900">
              {t("Access and information", "Accès et informations")}
            </span>
            <ul className="mt-4 space-y-2 text-xs">
              {[
                {
                  name: t("Client portal", "Espace client"),
                  action: () => {
                    setActiveTab("portal");
                  },
                },
                {
                  name: t("Book an appointment", "Demander un rendez-vous"),
                  action: () => {
                    setActiveTab("contact");
                  },
                },
                {
                  name: t("Request a quote", "Demander un devis"),
                  action: () => {
                    setActiveTab("contact");
                  },
                },
                {
                  name: t("Contact form", "Formulaire de contact"),
                  action: () => {
                    setActiveTab("contact");
                  },
                },
                {
                  name: t("Privacy policy", "Politique de confidentialité"),
                  action: () => {
                    setActiveTab("privacy");
                  },
                },
                {
                  name: t("Terms of service", "Conditions d’utilisation"),
                  action: () => {
                    setActiveTab("terms");
                  },
                },
              ].map((item, index) => (
                <li key={index}>
                  <button
                    onClick={item.action}
                    className="hover:text-blue-900 transition-colors cursor-pointer text-left"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {}
          <div className="space-y-3">
            <span className="block font-display text-xs font-semibold uppercase tracking-wider text-gray-900">
              {t("Contact us", "Nous contacter")}
            </span>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="flex items-center space-x-2">
                <MapPin className="h-3.5 w-3.5 text-blue-900 flex-shrink-0" />
                <span>Rue El Hijaz, Kh Pacha Tunis 1073</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-blue-900 flex-shrink-0" />
                <span>+216 56 566 533</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-blue-900 flex-shrink-0" />
                <span>lylia.aouani@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="h-3.5 w-3.5 text-blue-900 flex-shrink-0" />
                <span>www.ebiservices.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} EBI Services.{" "}
            {t("All rights reserved.", "Tous droits réservés.")}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
