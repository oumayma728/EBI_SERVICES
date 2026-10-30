import React from "react";
import { useLanguage } from "../LanguageContext";

export default function PrivacyView() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-left space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-slate-900">{t("Privacy Policy", "Politique de confidentialité")}</h1>
      <span className="text-xs text-gray-400 block">{t("Last updated: July 9, 2026", "Dernière mise à jour : 9 juillet 2026")}</span>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-xs text-gray-600 space-y-4 leading-relaxed">
        <p>
          {t(
            "At EBI Services, we prioritize data security. This Privacy Policy explains how we collect, encrypt and protect lead information, quotes, chat transcripts and schedules across our platform.",
            "Chez EBI Services, nous accordons une grande importance à la sécurité des données. Cette politique explique comment nous collectons, chiffrons et protégeons les informations des prospects, les devis, les conversations et les rendez-vous sur notre plateforme.",
          )}
        </p>

        <h3 className="font-bold text-slate-900">{t("1. Data collection and storage", "1. Collecte et stockage des données")}</h3>
        <p>
          {t(
            "Technical requirements and files uploaded to the secure client portal are protected using industry-standard safeguards. We do not sell or distribute corporate records.",
            "Les documents techniques et fichiers téléversés dans l’espace sécurisé sont protégés selon les normes du secteur. Nous ne vendons ni ne distribuons les données de l’entreprise.",
          )}
        </p>

        <h3 className="font-bold text-slate-900">{t("2. Cookies and browser storage", "2. Cookies et stockage du navigateur")}</h3>
        <p>
          {t(
            "Our application uses browser storage to maintain your session and does not use tracking cookies for this purpose. We handle personal data in accordance with applicable data protection requirements.",
            "Notre application utilise le stockage du navigateur pour maintenir votre session et n’emploie pas de cookies de suivi à cette fin. Nous traitons les données personnelles conformément aux règles applicables en matière de protection des données.",
          )}
        </p>

        <p>
          {t(
            "For questions about data deletion or compliance, contact compliance@ebiservices.com.",
            "Pour toute question concernant la suppression des données ou la conformité, contactez compliance@ebiservices.com.",
          )}
        </p>
      </div>
    </div>
  );
}
