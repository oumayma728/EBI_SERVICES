import React from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Headset,
  MessageSquareCode,
  Users,
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
  onOpenChat: () => void;
}

export default function HomeView({ setActiveTab, onOpenChat }: HomeViewProps) {
  const { t } = useLanguage();
  const departments = [
    {
      icon: <Headset className="h-6 w-6 text-blue-900" />,
      title: t("Call center & tele-services", "Call center & téléservices"),
      description: t(
        "Customer relations, support, call handling, request processing and administrative assistance.",
        "Relation client, support, gestion des appels, traitement des demandes et assistance administrative en priorité.",
      ),
    },
    {
      icon: <Code2 className="h-6 w-6 text-blue-900" />,
      title: t("Development", "Développement"),
      description: t(
        "Web and business applications, custom solutions, integration, and ongoing or corrective maintenance.",
        "Applications web et métier, solutions sur mesure, intégration et maintenance évolutive ou corrective.",
      ),
    },
    {
      icon: <Users className="h-6 w-6 text-blue-900" />,
      title: t("Recruitment", "Recrutement"),
      description: t(
        "Candidate sourcing and selection, IT recruitment, pre-screening, and HR support.",
        "Recherche et sélection de profils, recrutement IT, préqualification et accompagnement RH.",
      ),
    },
  ];

  return (
    <div className="space-y-16 py-8">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8 pt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-900">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            <span>{t("Your partner in performance and transformation", "Votre partenaire en performance et transformation")}</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            {t("The right solutions to move ", "Des solutions adaptées pour faire avancer ")}
            <span className="text-blue-900">{t("your business", "votre activité")}</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">
            {t(
              "EBI Services puts call center services at the heart of its offering, alongside digital development and recruitment. Tell us what you need and our team will connect you with the right people.",
              "EBI Services place le Call center au cœur de son offre, avec des solutions en développement numérique, recrutement et téléservices. Présentez-nous votre besoin : notre équipe vous orientera vers le bon interlocuteur.",
            )}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <button
              onClick={() => setActiveTab("contact")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-950 sm:w-auto"
            >
              <span>{t("Book an appointment", "Demander un rendez-vous")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100 sm:w-auto"
            >
              <MessageSquareCode className="h-4 w-4" />
              <span>{t("Chat with our assistant", "Discuter avec notre assistant")}</span>
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 sm:w-auto"
            >
              {t("Become a client", "Devenir client")}
            </button>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700">
              {t("Our expertise", "Nos expertises")}
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t("Three areas, tailored support", "Trois domaines, un accompagnement adapté")}
            </h2>
            <p className="text-sm text-gray-500">
              {t(
                "Explore our services and choose the area that best fits your needs.",
                "Découvrez nos services et choisissez le domaine correspondant à votre besoin.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {departments.map((department) => (
              <article
                key={department.title}
                className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  {department.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  {department.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {department.description}
                </p>
                <button
                  onClick={() => setActiveTab("services")}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-900 hover:text-blue-700"
                >
                  {t("Discover our services", "Découvrir nos services")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-blue-950 p-8 text-white shadow-xl md:flex-row md:items-center md:p-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              {t("Let's talk about your project", "Parlons de votre projet")}
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("Have a project for us?", "Vous avez un besoin à nous confier ?")}
            </h2>
            <p className="text-sm leading-relaxed text-blue-100">
              {t(
                "Chat with our assistant or contact our team to discuss your request and next steps.",
                "Échangez avec notre assistant ou contactez notre équipe pour présenter votre demande et préparer la suite.",
              )}
            </p>
          </div>
          <button
            onClick={() => setActiveTab("contact")}
            className="shrink-0 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-950 shadow transition hover:bg-gray-100"
          >
            {t("Tell us what you need", "Présenter mon besoin")}
          </button>
        </div>
      </section>
    </div>
  );
}
